import { Router } from 'express'
import { supabase } from '../lib/supabase'
import { authenticate } from '../middleware/authenticate'
import { sendCampaignInviteEmail } from '../lib/email'

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
  const { name, description, payment_config, starts_at, ends_at, creator_ids } = req.body
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

  // If creators were selected, add them to the campaign and notify them
  if (Array.isArray(creator_ids) && creator_ids.length > 0) {
    const creatorInserts = creator_ids.map((id: string) => ({
      campaign_id: data.id,
      creator_id: id
    }))
    
    // Bulk insert into campaign_creators
    await supabase.from('campaign_creators').insert(creatorInserts)

    // Fetch brand name for email
    const { data: brand } = await supabase.from('brands').select('company_name').eq('id', user.id).single()
    const brandName = brand?.company_name || 'A brand'

    // Fetch creator details
    const { data: creatorsToNotify } = await supabase
      .from('creators')
      .select('id, name, email')
      .in('id', creator_ids)

    if (creatorsToNotify && creatorsToNotify.length > 0) {
      await Promise.all(
        creatorsToNotify.map(creator => {
          if (creator.email) {
            return sendCampaignInviteEmail({
              to: creator.email,
              creatorName: creator.name || creator.email,
              brandName,
              campaignName: name,
              campaignDescription: description,
              startsAt: starts_at,
              endsAt: ends_at
            }).catch(err => console.error(`Failed to send campaign email to ${creator.email}:`, err))
          }
          return Promise.resolve()
        })
      )
    }
    
    // Fetch updated campaign to return
    const { data: updatedData } = await supabase
      .from('campaigns')
      .select('*, campaign_creators(creator_id)')
      .eq('id', data.id)
      .single()
      
    return res.json(updatedData || data)
  }

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
