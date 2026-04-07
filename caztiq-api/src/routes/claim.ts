import { Router } from 'express'
import { supabase } from '../lib/supabase'
import { sendPayoutClaimedEmail, sendTaxConfirmationEmail } from '../lib/email'

const router = Router()

// GET /api/claim/:token — validate and return payout info
router.get('/:token', async (req, res) => {
  const { data: payout } = await supabase
    .from('payouts')
    .select('*, brands(company_name, email), creators(email, tax_form_submitted_at)')
    .eq('claim_token', req.params.token)
    .single()

  if (!payout) return res.status(404).json({ error: 'Invalid link' })
  if (payout.status === 'claimed' || payout.status === 'completed') {
    return res.status(400).json({ error: 'already_claimed' })
  }
  if (payout.status === 'cancelled') {
    return res.status(400).json({ error: 'cancelled' })
  }

  res.json({
    amount: payout.creator_receives_cents / 100,
    currency: payout.currency,
    brand_name: payout.brands?.company_name || 'A brand',
    note: payout.note,
    requires_tax_form: !payout.creators?.tax_form_submitted_at
  })
})

// POST /api/claim/:token/tax-form
router.post('/:token/tax-form', async (req, res) => {
  const { legal_name, tax_id, street, city, state, zip, certified } = req.body
  if (!legal_name) return res.status(400).json({ error: 'Full legal name is required' })
  if (!certified) return res.status(400).json({ error: 'Certification is required' })

  const { data: payout } = await supabase
    .from('payouts')
    .select('creator_id, brands(company_name), creators(email, name)')
    .eq('claim_token', req.params.token)
    .single()

  if (!payout) return res.status(404).json({ error: 'Invalid link' })

  await supabase.from('creators')
    .update({
      tax_form_type: 'w9',
      tax_form_submitted_at: new Date().toISOString(),
      tax_form_data: { legal_name, tax_id, street, city, state, zip, certified },
      country_code: 'US'
    })
    .eq('id', payout.creator_id)

  // Send confirmation email to creator
  const creator = (payout as any).creators
  const brand = (payout as any).brands
  if (creator?.email) {
    sendTaxConfirmationEmail({
      to: creator.email,
      creatorName: creator.name || legal_name,
      brandName: brand?.company_name || 'the brand',
    }).catch(err => console.error('Tax confirmation email failed:', err))
  }

  res.json({ success: true })
})

// POST /api/claim/:token/submit — pick payment method and claim
router.post('/:token/submit', async (req, res) => {
  const { payment_method, payment_details } = req.body

  const { data: payout } = await supabase
    .from('payouts')
    .select('*, brands(email, company_name), creators(email, tax_form_submitted_at)')
    .eq('claim_token', req.params.token)
    .single()

  if (!payout || !['pending', 'sent'].includes(payout.status)) {
    return res.status(400).json({ error: 'Invalid or already claimed payout' })
  }

  if (!payout.creators?.tax_form_submitted_at) {
    return res.status(400).json({ error: 'Tax form required before claiming' })
  }

  // Mark as claimed
  await supabase.from('payouts')
    .update({
      status: 'claimed',
      payment_method,
      payment_details,
      claimed_at: new Date().toISOString()
    })
    .eq('id', payout.id)

  // Increment tax_reporting total for this creator + year (1099 tracking)
  const amountUsd = payout.creator_receives_cents / 100
  const taxYear = new Date().getFullYear()
  supabase.rpc('update_tax_reporting', {
    p_creator_id: payout.creator_id,
    p_amount_usd: amountUsd,
    p_tax_year: taxYear,
  }).then(({ error }) => {
    if (error) console.error('tax_reporting update failed:', error.message)
  })

  // Notify brand
  try {
    await sendPayoutClaimedEmail({
      to: payout.brands?.email,
      creatorEmail: payout.creators?.email,
      amountFormatted: `$${amountUsd.toFixed(2)}`
    })
  } catch (e) {
    console.error('Claim notification email failed:', e)
  }

  res.json({ success: true, message: 'Payment claimed. Funds will be transferred within 1-2 business days.' })
})

export default router
