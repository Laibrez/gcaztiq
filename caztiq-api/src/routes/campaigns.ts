import { Router } from 'express'
import { supabase } from '../lib/supabase'
import { authenticate } from '../middleware/authenticate'

const router = Router()
router.use(authenticate)

router.get('/', async (req, res) => {
  const user = (req as any).user
  const { data } = await supabase
    .from('campaigns')
    .select('*, campaign_creators(creator_id)')
    .eq('brand_id', user.id)
    .order('created_at', { ascending: false })
  res.json(data || [])
})

router.post('/', async (req, res) => {
  const user = (req as any).user
  const { name, description, payment_config, starts_at, ends_at } = req.body
  if (!name) return res.status(400).json({ error: 'Name required' })

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      brand_id: user.id,
      name,
      description,
      payment_config: payment_config || {},
      starts_at: starts_at || null,
      ends_at: ends_at || null,
      status: 'draft'
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.patch('/:id', async (req, res) => {
  const user = (req as any).user
  const { data, error } = await supabase
    .from('campaigns')
    .update(req.body)
    .eq('id', req.params.id)
    .eq('brand_id', user.id)
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.post('/:id/creators', async (req, res) => {
  const { creator_id } = req.body
  const { data, error } = await supabase
    .from('campaign_creators')
    .insert({ campaign_id: req.params.id, creator_id })
    .select()
    .single()
  if (error?.code === '23505') return res.status(400).json({ error: 'Already in campaign' })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.delete('/:id', async (req, res) => {
  const user = (req as any).user
  await supabase.from('campaigns').delete().eq('id', req.params.id).eq('brand_id', user.id)
  res.json({ success: true })
})

export default router
