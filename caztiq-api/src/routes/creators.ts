import { Router } from 'express'
import { supabase } from '../lib/supabase'
import { authenticate } from '../middleware/authenticate'
import { sendCreatorInviteEmail } from '../lib/email'

const router = Router()
router.use(authenticate)

router.get('/', async (req, res) => {
  const user = (req as any).user
  const { data } = await supabase
    .from('creators')
    .select('*, payouts(amount_cents, status)')
    .eq('brand_id', user.id)
    .order('created_at', { ascending: false })
  res.json(data || [])
})

router.post('/invite', async (req, res) => {
  const user = (req as any).user
  const { email, name } = req.body
  if (!email) return res.status(400).json({ error: 'Email required' })

  const { data, error } = await supabase
    .from('creators')
    .insert({ brand_id: user.id, email: email.toLowerCase(), name })
    .select()
    .single()

  if (error?.code === '23505') {
    return res.status(400).json({ error: 'Creator already added' })
  }
  if (error) return res.status(500).json({ error: error.message })

  const { data: brand } = await supabase
    .from('brands')
    .select('company_name')
    .eq('id', user.id)
    .single()

  await sendCreatorInviteEmail({
    to: email,
    brandName: brand?.company_name || 'A brand'
  }).catch(err => console.error('Invite email failed:', err))

  res.json(data)
})

router.get('/:id', async (req, res) => {
  const user = (req as any).user
  const { data } = await supabase
    .from('creators')
    .select('*, payouts(*)')
    .eq('id', req.params.id)
    .eq('brand_id', user.id)
    .single()
  if (!data) return res.status(404).json({ error: 'Not found' })
  res.json(data)
})

router.delete('/:id', async (req, res) => {
  const user = (req as any).user
  const creatorId = req.params.id
  console.log(`Force deleting creator ${creatorId} for brand ${user.id}`);
  
  // 1. Get all payouts for this creator
  const { data: payouts } = await supabase
    .from('payouts')
    .select('id')
    .eq('creator_id', creatorId)
    .eq('brand_id', user.id)

  if (payouts && payouts.length > 0) {
    const payoutIds = payouts.map(p => p.id)
    
    // 2. Unlink transactions (set reference_id to null)
    await supabase.from('wallet_transactions')
      .update({ reference_id: null })
      .in('reference_id', payoutIds)
      .eq('brand_id', user.id)

    // 3. Delete payouts
    await supabase.from('payouts')
      .delete()
      .in('id', payoutIds)
  }

  // 4. Delete creator
  const { error, count } = await supabase.from('creators')
    .delete({ count: 'exact' })
    .eq('id', creatorId)
    .eq('brand_id', user.id)

  if (error) {
    console.error('Creator force deletion failed:', error.message)
    return res.status(500).json({ error: error.message })
  }

  if (count === 0) {
    return res.status(404).json({ error: 'Creator not found or already deleted' });
  }

  console.log(`Successfully force deleted creator ${creatorId}`);
  res.json({ success: true })
})

export default router
