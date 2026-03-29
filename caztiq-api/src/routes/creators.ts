import { Router } from 'express'
import { supabase } from '../lib/supabase'
import { authenticate } from '../middleware/authenticate'

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
  await supabase.from('creators')
    .delete()
    .eq('id', req.params.id)
    .eq('brand_id', user.id)
  res.json({ success: true })
})

export default router
