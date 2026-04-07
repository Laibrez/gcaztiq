import { Router } from 'express'
import { supabase } from '../lib/supabase'
import { encryptSSN } from '../lib/crypto'
import { sendTaxConfirmationEmail, sendBrandCreatorConfirmedEmail } from '../lib/email'

const router = Router()

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeSSN(raw: string): string | null {
  // Accept XXX-XX-XXXX or XXXXXXXXX
  const digits = raw.replace(/\D/g, '')
  if (digits.length !== 9) return null
  return digits
}

function isValidZip(zip: string): boolean {
  return /^\d{5}$/.test(zip)
}

// ─── GET /api/invite/:token — load creator info for the invite page ───────────

router.get('/:token', async (req, res) => {
  const { data: creator, error } = await supabase
    .from('creators')
    .select('id, name, email, invitation_status, brands(company_name, email)')
    .eq('invitation_token', req.params.token)
    .single()

  if (error) console.error('Invite token lookup error:', error.message, '| token:', req.params.token)

  if (!creator) {
    return res.status(404).json({ error: 'invalid_token' })
  }

  if (creator.invitation_status === 'confirmed') {
    return res.status(400).json({ error: 'already_confirmed' })
  }

  const brand = (creator as any).brands

  res.json({
    creator_name: creator.name || creator.email,
    brand_name: brand?.company_name || 'A brand',
  })
})

// ─── POST /api/invite/:token/submit-w9 ────────────────────────────────────────

router.post('/:token/submit-w9', async (req, res) => {
  const {
    full_legal_name,
    street_address,
    city,
    state,
    zip_code,
    ssn,
    certification_accepted,
  } = req.body

  // 1. Validate required fields
  if (!full_legal_name || !street_address || !city || !state || !zip_code || !ssn) {
    return res.status(400).json({ error: 'All fields are required' })
  }
  if (!certification_accepted) {
    return res.status(400).json({ error: 'You must certify that the information is correct' })
  }

  // 2. Validate SSN format
  const normalizedSSN = normalizeSSN(ssn)
  if (!normalizedSSN) {
    return res.status(400).json({ error: 'SSN must be 9 digits (e.g. 123-45-6789)' })
  }

  // 3. Validate ZIP
  if (!isValidZip(zip_code.trim())) {
    return res.status(400).json({ error: 'ZIP code must be 5 digits' })
  }

  // 4. Load creator by token
  const { data: creator } = await supabase
    .from('creators')
    .select('id, name, email, invitation_status, brand_id, brands(company_name, email)')
    .eq('invitation_token', req.params.token)
    .single()

  if (!creator) {
    return res.status(404).json({ error: 'invalid_token' })
  }
  if (creator.invitation_status === 'confirmed') {
    return res.status(400).json({ error: 'already_confirmed' })
  }

  // 5. Encrypt SSN
  let ssn_encrypted: string
  try {
    ssn_encrypted = encryptSSN(normalizedSSN)
  } catch (err: any) {
    console.error('SSN encryption failed:', err.message)
    return res.status(500).json({ error: 'Internal error — please try again' })
  }

  // 6. Insert into tax_forms
  const { error: insertError } = await supabase.from('tax_forms').insert({
    creator_id: creator.id,
    form_type: 'W-9',
    full_legal_name: full_legal_name.trim(),
    street_address: street_address.trim(),
    city: city.trim(),
    state: state.trim().toUpperCase(),
    zip_code: zip_code.trim(),
    ssn_encrypted,
    certification_accepted: true,
  })

  if (insertError) {
    console.error('tax_forms insert failed:', insertError.message)
    return res.status(500).json({ error: 'Failed to save tax form' })
  }

  // 7. Update creator status
  await supabase
    .from('creators')
    .update({
      invitation_status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      tax_form_submitted_at: new Date().toISOString(),
      tax_form_type: 'w9',
      country_code: 'US',
    })
    .eq('id', creator.id)

  const brand = (creator as any).brands
  const creatorName = creator.name || full_legal_name
  const brandName = brand?.company_name || 'the brand'

  // 8. Send confirmation email to creator
  if (creator.email) {
    sendTaxConfirmationEmail({
      to: creator.email,
      creatorName,
      brandName,
    }).catch(err => console.error('Tax confirmation email failed:', err))
  }

  // 9. Notify brand
  if (brand?.email) {
    sendBrandCreatorConfirmedEmail({
      to: brand.email,
      brandName,
      creatorName,
      creatorEmail: creator.email,
    }).catch(err => console.error('Brand notification email failed:', err))
  }

  res.json({ success: true })
})

export default router
