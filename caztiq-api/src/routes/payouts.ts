import { Router } from 'express'
import { supabase } from '../lib/supabase'
import { authenticate } from '../middleware/authenticate'
import { sendPayoutEmail } from '../lib/email'
import crypto from 'crypto'
import multer from 'multer'
import csv from 'csv-parser'
import { Readable } from 'stream'

const router = Router()
router.use(authenticate)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const ok = file.mimetype === 'text/csv'
      || file.mimetype === 'application/vnd.ms-excel'
      || file.originalname.endsWith('.csv')
    if (!ok) return cb(new Error('Only .csv files are accepted'))
    cb(null, true)
  }
})

// Multer error handler wrapper
function uploadSingle(req: any, res: any, next: any) {
  upload.single('file')(req, res, (err: any) => {
    if (err) return res.status(400).json({ error: err.message || 'File upload failed' })
    next()
  })
}

router.get('/', async (req, res) => {
  const user = (req as any).user
  const { status, campaign_id, limit = 50, offset = 0 } = req.query

  let query = supabase
    .from('payouts')
    .select('*, creators(email, name), campaigns(name)')
    .eq('brand_id', user.id)
    .order('created_at', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1)

  if (status) query = query.eq('status', status as string)
  if (campaign_id) query = query.eq('campaign_id', campaign_id as string)

  const { data } = await query
  res.json({ payouts: data || [], total: data?.length ?? 0 })
})

router.post('/single', async (req, res) => {
  const user = (req as any).user
  const { creator_email, amount_cents, currency = 'USD', note, campaign_id } = req.body

  if (!creator_email || !amount_cents) {
    return res.status(400).json({ error: 'Creator email and amount required' })
  }
  if (amount_cents < 100) {
    return res.status(400).json({ error: 'Minimum payout is $1.00' })
  }

  // Find or create creator
  let { data: creator } = await supabase
    .from('creators')
    .select('id')
    .eq('brand_id', user.id)
    .eq('email', creator_email.toLowerCase())
    .maybeSingle()

  if (!creator) {
    const { data: newCreator, error: createErr } = await supabase
      .from('creators')
      .insert({ brand_id: user.id, email: creator_email.toLowerCase() })
      .select()
      .single()
    if (createErr) return res.status(500).json({ error: createErr.message })
    creator = newCreator
  }

  const fee_cents = Math.round(amount_cents * 0.05)
  const creator_receives_cents = amount_cents - fee_cents

  // 1. Deduct from wallet atomically
  const { data: newBalance, error: walletError } = await supabase
    .rpc('deduct_from_wallet', { p_brand_id: user.id, p_amount_cents: amount_cents })

  if (walletError) {
    return res.status(400).json({ error: walletError.message || 'Insufficient wallet balance' })
  }

  // 2. Create payout record (DB generates UUID claim_token)
  const { data: payout, error: payoutError } = await supabase
    .from('payouts')
    .insert({
      brand_id: user.id,
      creator_id: creator!.id,
      campaign_id: campaign_id || null,
      amount_cents,
      fee_cents,
      creator_receives_cents,
      currency,
      note,
      status: 'pending'
    })
    .select()
    .single()

  if (payoutError) {
    // If payout fails, we should ideally refund the wallet, but for now we log and return error
    console.error('CRITICAL: Payout creation failed after wallet deduction:', payoutError.message)
    return res.status(500).json({ error: 'Payout record creation failed' })
  }

  // 3. Create wallet transaction record
  await supabase.from('wallet_transactions').insert({
    brand_id: user.id,
    type: 'payout',
    amount_cents: -amount_cents,
    balance_after_cents: newBalance,
    description: `Payout to ${creator_email}`,
    reference_id: payout.id
  })

  // 4. Send email and update status
  const { data: brand } = await supabase
    .from('brands')
    .select('company_name')
    .eq('id', user.id)
    .single()

  try {
    await sendPayoutEmail({
      to: creator_email,
      brandName: brand?.company_name || 'A brand',
      amountFormatted: `$${(creator_receives_cents / 100).toFixed(2)}`,
      currency,
      claimToken: payout.claim_token,
      note
    })
  } catch (emailErr: any) {
    console.error('Email sending failed during payout:', emailErr.message || emailErr)
    // We continue anyway so the payout isn't lost
  }

  // Update status to 'sent'
  await supabase
    .from('payouts')
    .update({ status: 'sent' })
    .eq('id', payout.id)

  res.json(payout)
})

router.post('/:id/cancel', async (req, res) => {
  const user = (req as any).user
  const { data: payout } = await supabase
    .from('payouts')
    .select('status, brand_id')
    .eq('id', req.params.id)
    .single()

  if (!payout || payout.brand_id !== user.id) {
    return res.status(404).json({ error: 'Not found' })
  }
  if (!['pending', 'sent'].includes(payout.status)) {
    return res.status(400).json({ error: 'Cannot cancel — payout already claimed or processed' })
  }

  await supabase.from('payouts')
    .update({ status: 'cancelled' })
    .eq('id', req.params.id)

  res.json({ success: true })
})

// POST /api/payouts/bulk/validate — parse CSV and return preview + totals
router.post('/bulk/validate', uploadSingle, async (req, res) => {
  const user = (req as any).user
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

  const rows: any[] = []
  await new Promise<void>((resolve, reject) => {
    Readable.from(req.file!.buffer.toString())
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', resolve)
      .on('error', reject)
  })

  const validated = rows.map((row, i) => {
    const email = row.creatorEmail?.trim()?.toLowerCase()
    const amount = parseFloat(row.amount)
    const currency = row.currency?.trim()?.toUpperCase() || 'USD'

    if (!email || !email.includes('@'))
      return { ...row, line: i + 2, valid: false, error: 'Invalid email' }
    if (!amount || isNaN(amount) || amount <= 0)
      return { ...row, line: i + 2, valid: false, error: 'Invalid amount' }
    if (!['USD', 'GBP', 'EUR', 'CAD'].includes(currency))
      return { ...row, line: i + 2, valid: false, error: 'Unsupported currency' }

    const amount_cents = Math.round(amount * 100)
    const fee_cents = Math.round(amount_cents * 0.05)
    return { email, amount_cents, fee_cents, creator_receives_cents: amount_cents - fee_cents, currency, valid: true, error: null }
  })

  const validRows = validated.filter(r => r.valid)
  const total_cents = validRows.reduce((sum, r) => sum + r.amount_cents, 0)

  const { data: brand } = await supabase.from('brands').select('wallet_balance_cents').eq('id', user.id).single()

  res.json({
    rows: validated,
    summary: {
      total_rows: rows.length,
      valid_count: validRows.length,
      error_count: validated.filter(r => !r.valid).length,
      total_cents,
      total_fee_cents: validRows.reduce((sum, r) => sum + r.fee_cents, 0),
      creator_receives_cents: validRows.reduce((sum, r) => sum + r.creator_receives_cents, 0),
      wallet_balance_cents: brand?.wallet_balance_cents || 0,
      sufficient_balance: (brand?.wallet_balance_cents || 0) >= total_cents
    }
  })
})

// POST /api/payouts/bulk/confirm — create all payouts + fire emails
router.post('/bulk/confirm', async (req, res) => {
  const user = (req as any).user
  const { rows, campaign_id } = req.body
  const validRows = (rows as any[]).filter(r => r.valid)

  if (validRows.length === 0) return res.status(400).json({ error: 'No valid rows to process' })

  const totalCents = validRows.reduce((sum: number, r: any) => sum + r.amount_cents, 0)
  
  // 1. Deduct total from wallet atomically
  const { data: newBalance, error: walletError } = await supabase
    .rpc('deduct_from_wallet', { p_brand_id: user.id, p_amount_cents: totalCents })

  if (walletError) {
    return res.status(400).json({ error: walletError.message || 'Insufficient wallet balance' })
  }

  // 2. Fetch brand info for emails
  const { data: brand } = await supabase.from('brands').select('company_name').eq('id', user.id).single()

  // 3. Prepare payout records
  const payoutInserts = await Promise.all(validRows.map(async (row: any) => {
    let { data: creator } = await supabase.from('creators').select('id').eq('brand_id', user.id).eq('email', row.email).maybeSingle()
    
    if (!creator) {
      const { data: newCreator } = await supabase.from('creators').insert({ brand_id: user.id, email: row.email }).select().single()
      creator = newCreator
    }

    return {
      brand_id: user.id,
      creator_id: creator!.id,
      campaign_id: campaign_id || null,
      amount_cents: row.amount_cents,
      fee_cents: row.fee_cents,
      creator_receives_cents: row.creator_receives_cents,
      currency: row.currency,
      status: 'sent'
      // claim_token generated by DB
    }
  }))

  const { data: payouts, error: insertError } = await supabase.from('payouts').insert(payoutInserts).select()

  if (insertError) {
    console.error('CRITICAL: Bulk payout creation failed after deduction:', insertError.message)
    return res.status(500).json({ error: 'Failed to create payout records' })
  }

  // 4. Record the wallet transaction
  await supabase.from('wallet_transactions').insert({
    brand_id: user.id,
    type: 'payout',
    amount_cents: -totalCents,
    balance_after_cents: newBalance,
    description: `Bulk payout (${payouts?.length} creators)`,
    reference_id: 'bulk_' + Date.now()
  })

  // 5. Fire emails in background
  payouts?.forEach((payout, i) => {
    sendPayoutEmail({
      to: validRows[i]?.email || '',
      brandName: brand?.company_name || 'A brand',
      amountFormatted: `$${(payout.creator_receives_cents / 100).toFixed(2)}`,
      currency: payout.currency,
      claimToken: payout.claim_token,
    }).catch(err => console.error('Bulk email failed:', err.message))
  })

  res.json({ success: true, created: payouts?.length || 0 })
})

export default router

