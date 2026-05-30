import { Router } from 'express'
import { supabase } from '../lib/supabase'
import { authenticate } from '../middleware/authenticate'
import { sendWorkspaceInviteEmail, sendWorkspaceAcceptedEmail } from '../lib/email'
import crypto from 'crypto'

const router = Router()

// ─── Protected routes (require auth) ─────────────────────────────────────────

// GET /api/workspace/prospects — list all saved prospects for this brand
router.get('/prospects', authenticate, async (req, res) => {
  const user = (req as any).user
  const { data, error } = await supabase
    .from('workspace_prospects')
    .select('*')
    .eq('brand_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data || [])
})

// POST /api/workspace/prospects — upsert prospect(s) (from search or manual add)
router.post('/prospects', authenticate, async (req, res) => {
  const user = (req as any).user
  const body = req.body

  // Accept single prospect or array
  const prospects = Array.isArray(body) ? body : [body]

  const rows = prospects.map((p: any) => ({
    brand_id: user.id,
    handle: p.handle,
    name: p.name,
    email: p.email || '',
    niche: p.niche || [],
    city: p.city || '',
    country: p.country || 'USA',
    flag: p.flag || '🇺🇸',
    followers: p.followers || 0,
    engagement: p.engagement || 0,
    format: p.format || [],
    reached_out: p.reachedOut ?? false,
    responded: p.responded ?? false,
    tax_status: 'none',
    search_params: p.searchParams || null,
  }))

  const { data, error } = await supabase
    .from('workspace_prospects')
    .upsert(rows, { onConflict: 'brand_id,handle', ignoreDuplicates: false })
    .select()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// PATCH /api/workspace/prospects/:id — update outreach/email/status fields
router.patch('/prospects/:id', authenticate, async (req, res) => {
  const user = (req as any).user
  const allowed = ['email', 'reached_out', 'responded', 'tax_status', 'tax_form', 'invitation_status']

  const patch: Record<string, any> = {}
  for (const key of allowed) {
    if (key in req.body) patch[key] = req.body[key]
  }
  patch.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('workspace_prospects')
    .update(patch)
    .eq('id', req.params.id)
    .eq('brand_id', user.id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  if (!data) return res.status(404).json({ error: 'Prospect not found' })
  res.json(data)
})

// DELETE /api/workspace/prospects/:id
router.delete('/prospects/:id', authenticate, async (req, res) => {
  const user = (req as any).user
  const { error } = await supabase
    .from('workspace_prospects')
    .delete()
    .eq('id', req.params.id)
    .eq('brand_id', user.id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

// POST /api/workspace/prospects/:id/invite — send invite email to prospect
router.post('/prospects/:id/invite', authenticate, async (req, res) => {
  const user = (req as any).user

  // Fetch the prospect
  const { data: prospect, error: pErr } = await supabase
    .from('workspace_prospects')
    .select('*')
    .eq('id', req.params.id)
    .eq('brand_id', user.id)
    .single()

  if (pErr || !prospect) return res.status(404).json({ error: 'Prospect not found' })
  if (!prospect.email) return res.status(400).json({ error: 'No email address for this prospect' })

  // Fetch brand info
  const { data: brand } = await supabase
    .from('brands')
    .select('company_name, email')
    .eq('id', user.id)
    .single()

  const brandName = brand?.company_name || 'A brand'
  const inviteToken = crypto.randomUUID()

  // Store the token and mark as invited
  const { data: updated, error: uErr } = await supabase
    .from('workspace_prospects')
    .update({
      invitation_token: inviteToken,
      invitation_status: 'invited',
      invited_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', req.params.id)
    .eq('brand_id', user.id)
    .select()
    .single()

  if (uErr) return res.status(500).json({ error: uErr.message })

  // Send the invite email
  await sendWorkspaceInviteEmail({
    to: prospect.email,
    creatorName: prospect.name,
    brandName,
    inviteToken,
  }).catch(err => console.error('Workspace invite email failed:', err))

  res.json(updated)
})

// ─── Public route (no auth) ────────────────────────────────────────────────────

// GET /api/workspace/accept/:token — load invite info
router.get('/accept/:token', async (req, res) => {
  const { data: prospect, error } = await supabase
    .from('workspace_prospects')
    .select('id, name, email, invitation_status, brand_id')
    .eq('invitation_token', req.params.token)
    .single()

  if (error || !prospect) return res.status(404).json({ error: 'Invalid or expired invite link' })
  if (prospect.invitation_status === 'accepted') return res.status(400).json({ error: 'already_accepted' })

  // Fetch brand name
  const { data: brand } = await supabase
    .from('brands')
    .select('company_name')
    .eq('id', prospect.brand_id)
    .single()

  res.json({
    creator_name: prospect.name,
    brand_name: brand?.company_name || 'A brand',
  })
})

// POST /api/workspace/accept/:token — creator accepts the invite
router.post('/accept/:token', async (req, res) => {
  const { data: prospect, error } = await supabase
    .from('workspace_prospects')
    .select('id, name, email, invitation_status, brand_id')
    .eq('invitation_token', req.params.token)
    .single()

  if (error || !prospect) return res.status(404).json({ error: 'Invalid or expired invite link' })
  if (prospect.invitation_status === 'accepted') return res.status(400).json({ error: 'already_accepted' })

  await supabase
    .from('workspace_prospects')
    .update({
      invitation_status: 'accepted',
      accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', prospect.id)

  // Notify the brand
  const { data: brand } = await supabase
    .from('brands')
    .select('email, company_name')
    .eq('id', prospect.brand_id)
    .single()

  if (brand?.email) {
    await sendWorkspaceAcceptedEmail({
      to: brand.email,
      brandName: brand.company_name || 'Your brand',
      creatorName: prospect.name,
      creatorEmail: prospect.email,
    }).catch(err => console.error('Workspace accepted email failed:', err))
  }

  res.json({ success: true })
})

export default router
