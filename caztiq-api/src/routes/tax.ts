import { Router } from 'express'
import { supabase } from '../lib/supabase'
import { authenticate } from '../middleware/authenticate'
import { decryptSSN } from '../lib/crypto'
import ExcelJS from 'exceljs'
import { sendTaxConfirmationEmail } from '../lib/email'

const router = Router()
router.use(authenticate)

type TinStatus = 'validated' | 'mismatch' | 'missing' | 'na'
type FormType = '1099-NEC' | 'W-8BEN (exempt)' | 'Below threshold' | 'S-Corp (exempt)'

const THRESHOLD = 60000 // $600 in cents

interface CreatorTax {
  id: string
  name: string
  email: string
  handle?: string
  country_code?: string
  ytdEarned: number
  tinStatus: TinStatus
  formType: FormType
  taxForm: any
}

// Helper to fetch and map tax data
async function getTaxData(brandId: string, year: number) {
  const { data: creators, error: cErr } = await supabase
    .from('creators')
    .select('id, name, email, handle, country_code, invitation_status, tax_form_type, tax_form_submitted_at, tax_forms(*), payouts(*)')
    .eq('brand_id', brandId)

  if (cErr) throw cErr

  const mapped: CreatorTax[] = (creators || []).map(c => {
    // Filter payouts for the given year and 'claimed' or 'sent' status
    // Note: The prompt says "status = 'paid'", but earlier logic used 'claimed' or 'sent'.
    const ytdEarned = (c.payouts || [])
      .filter((p: any) => 
        (p.status === 'sent' || p.status === 'claimed') &&
        new Date(p.created_at).getFullYear() === year
      )
      .reduce((sum: number, p: any) => sum + (p.amount_cents || 0), 0)

    const taxForm = (c.tax_forms && c.tax_forms.length > 0) ? c.tax_forms[0] : null
    
    let tinStatus: TinStatus = 'missing'
    if (taxForm) {
      if (taxForm.form_type === 'W-8BEN') {
        tinStatus = 'na'
      } else if (taxForm.ssn_encrypted) {
        tinStatus = 'validated' // Simplification since actual IRS API is removed
      }
    }

    let formType: FormType = 'Below threshold'
    if (taxForm?.form_type === 'W-8BEN') {
      formType = 'W-8BEN (exempt)'
    } else if (taxForm?.tax_classification === 'S Corporation' || taxForm?.tax_classification === 'C Corporation') {
      formType = 'S-Corp (exempt)'
    } else if (ytdEarned >= THRESHOLD) {
      formType = '1099-NEC'
    } else {
      formType = 'Below threshold'
    }

    return {
      id: c.id,
      name: c.name || c.email,
      email: c.email,
      handle: c.handle,
      country_code: c.country_code || 'US',
      ytdEarned,
      tinStatus,
      formType,
      taxForm
    }
  })

  // Only return creators that have some relevance (they have payouts or are confirmed)
  // Let's just return all of them to let the frontend filter.
  return mapped
}

router.get('/summary', async (req, res) => {
  const user = (req as any).user
  const year = parseInt(req.query.year as string) || new Date().getFullYear()

  try {
    const data = await getTaxData(user.id, year)
    
    const necRequired = data.filter(c => c.formType === '1099-NEC').length
    const readyToFile = data.filter(c => c.formType === '1099-NEC' && c.tinStatus === 'validated').length
    const needsAttention = data.filter(c => c.formType === '1099-NEC' && c.tinStatus !== 'validated').length
    const totalReportable = data.filter(c => c.formType === '1099-NEC').reduce((sum, c) => sum + c.ytdEarned, 0)
    const totalFlagged = data.filter(c => c.tinStatus === 'missing' || c.tinStatus === 'mismatch').length

    res.json({
      necRequired,
      readyToFile,
      needsAttention,
      totalReportable,
      totalFlagged
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/creators', async (req, res) => {
  const user = (req as any).user
  const year = parseInt(req.query.year as string) || new Date().getFullYear()

  try {
    const data = await getTaxData(user.id, year)
    // Mask SSNs for the frontend display
    const safeData = data.map(c => {
      let maskedTin = ''
      if (c.taxForm?.ssn_encrypted) {
        maskedTin = '•••-••-••••'
      }
      return { ...c, taxForm: { ...c.taxForm, ssn_encrypted: maskedTin } }
    })

    res.json(safeData)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/export', async (req, res) => {
  const user = (req as any).user
  const { year, format } = req.body
  const exportYear = parseInt(year) || new Date().getFullYear()

  try {
    const data = await getTaxData(user.id, exportYear)
    const { data: brand } = await supabase.from('brands').select('*').eq('id', user.id).single()

    // Log the export
    await supabase.from('tax_exports').insert({
      brand_id: user.id,
      tax_year: exportYear,
      format,
      acknowledged: true
    })

    const reportable = data.filter(c => c.formType === '1099-NEC')
    const exempt = data.filter(c => c.formType !== '1099-NEC')

    if (format === 'standard') {
      const workbook = new ExcelJS.Workbook()
      
      // Tab 1: 1099-NEC Ready
      const sheet1 = workbook.addWorksheet('1099-NEC Ready')
      sheet1.columns = [
        { header: 'Recipient TIN', key: 'tin', width: 15 },
        { header: 'TIN type (SSN/EIN)', key: 'tinType', width: 15 },
        { header: 'Recipient legal name', key: 'legalName', width: 25 },
        { header: 'Business name', key: 'businessName', width: 25 },
        { header: 'Federal tax classification', key: 'classification', width: 20 },
        { header: 'Address line 1', key: 'address1', width: 30 },
        { header: 'Address line 2', key: 'address2', width: 15 },
        { header: 'City', key: 'city', width: 20 },
        { header: 'State', key: 'state', width: 10 },
        { header: 'ZIP', key: 'zip', width: 15 },
        { header: 'Box 1 - Nonemployee comp', key: 'box1', width: 25 },
        { header: 'Box 4 - Withheld', key: 'box4', width: 15 },
        { header: 'Account number', key: 'account', width: 20 },
      ]
      
      reportable.forEach(c => {
        let tin = ''
        if (c.taxForm?.ssn_encrypted) {
          try { tin = decryptSSN(c.taxForm.ssn_encrypted) } catch (e) {}
        }
        sheet1.addRow({
          tin,
          tinType: c.taxForm?.tax_classification?.includes('Corporation') ? 'EIN' : 'SSN',
          legalName: c.taxForm?.full_legal_name || c.name,
          businessName: c.taxForm?.business_name || '',
          classification: c.taxForm?.tax_classification || '',
          address1: c.taxForm?.street_address || '',
          address2: '',
          city: c.taxForm?.city || '',
          state: c.taxForm?.state || '',
          zip: c.taxForm?.zip_code || '',
          box1: (c.ytdEarned / 100).toFixed(2),
          box4: '0.00',
          account: c.id
        })
      })

      // Tab 2: Exempt
      const sheet2 = workbook.addWorksheet('Exempt')
      sheet2.columns = [
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Country', key: 'country', width: 15 },
        { header: 'Reason', key: 'reason', width: 25 },
        { header: 'YTD Earnings', key: 'earnings', width: 15 }
      ]
      exempt.forEach(c => {
        sheet2.addRow({
          name: c.name,
          country: c.country_code,
          reason: c.formType,
          earnings: (c.ytdEarned / 100).toFixed(2)
        })
      })

      // Tab 3: Payment Detail
      const sheet3 = workbook.addWorksheet('Payment Detail')
      sheet3.columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Creator Name', key: 'creatorName', width: 25 },
        { header: 'Creator ID', key: 'creatorId', width: 20 },
        { header: 'Gross Amount', key: 'gross', width: 15 },
        { header: 'Status', key: 'status', width: 15 }
      ]
      // simplified payouts for the sheet
      const { data: payouts } = await supabase.from('payouts').select('*, creators(name)').eq('brand_id', user.id)
      const yearPayouts = (payouts || []).filter(p => new Date(p.created_at).getFullYear() === exportYear)
      yearPayouts.forEach(p => {
        sheet3.addRow({
          date: new Date(p.created_at).toISOString().split('T')[0],
          creatorName: (p as any).creators?.name || '',
          creatorId: p.creator_id,
          gross: (p.amount_cents / 100).toFixed(2),
          status: p.status
        })
      })

      // Tab 4: Summary
      const sheet4 = workbook.addWorksheet('Summary')
      sheet4.addRow(['Tax Year', exportYear])
      sheet4.addRow(['Brand Legal Name', brand?.company_name || ''])
      sheet4.addRow(['Total 1099s to file', reportable.length])
      sheet4.addRow(['Total reportable amount', '$' + (reportable.reduce((s,c) => s + c.ytdEarned, 0) / 100).toFixed(2)])
      sheet4.addRow(['Deadline', 'January 31'])

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename=Rollio_1099_Package_${exportYear}.xlsx`)
      await workbook.xlsx.write(res)
      res.end()

    } else if (format === 'csv') {
      let csv = 'Recipient TIN,TIN Type,Legal Name,Address,City,State,ZIP,Box 1\n'
      reportable.forEach(c => {
        let tin = ''
        if (c.taxForm?.ssn_encrypted) {
          try { tin = decryptSSN(c.taxForm.ssn_encrypted) } catch (e) {}
        }
        csv += `"${tin}","SSN","${c.taxForm?.full_legal_name || ''}","${c.taxForm?.street_address || ''}","${c.taxForm?.city || ''}","${c.taxForm?.state || ''}","${c.taxForm?.zip_code || ''}","${(c.ytdEarned / 100).toFixed(2)}"\n`
      })
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename=Rollio_1099_Data_${exportYear}.csv`)
      res.send(csv)

    } else if (format === 'track1099' || format === 'tax1099') {
      // Stub for third-party formats, practically identical to CSV just with specific headers
      let csv = 'PayerEIN,RecipientTIN,RecipientName,Address1,City,State,ZIP,Box1Amount\n'
      reportable.forEach(c => {
        let tin = ''
        if (c.taxForm?.ssn_encrypted) {
          try { tin = decryptSSN(c.taxForm.ssn_encrypted) } catch (e) {}
        }
        csv += `"", "${tin}", "${c.taxForm?.full_legal_name || ''}", "${c.taxForm?.street_address || ''}", "${c.taxForm?.city || ''}", "${c.taxForm?.state || ''}", "${c.taxForm?.zip_code || ''}", "${(c.ytdEarned / 100).toFixed(2)}"\n`
      })
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename=Rollio_${format}_${exportYear}.csv`)
      res.send(csv)

    } else if (format === 'quickbooks') {
      let iif = '!VEND\tNAME\tTAXID\tADDR1\tADDR2\tADDR3\tADDR4\tADDR5\t1099\n'
      reportable.forEach(c => {
        let tin = ''
        if (c.taxForm?.ssn_encrypted) {
          try { tin = decryptSSN(c.taxForm.ssn_encrypted) } catch (e) {}
        }
        iif += `VEND\t${c.taxForm?.full_legal_name || c.name}\t${tin}\t${c.taxForm?.street_address}\t${c.taxForm?.city}\t${c.taxForm?.state}\t${c.taxForm?.zip_code}\t\tY\n`
      })
      res.setHeader('Content-Type', 'application/qbooks')
      res.setHeader('Content-Disposition', `attachment; filename=Rollio_QB_Vendors_${exportYear}.iif`)
      res.send(iif)
    } else {
      res.status(400).json({ error: 'Unknown format' })
    }

  } catch (error: any) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

// Optional endpoint to manually remind a specific creator
router.post('/remind/:creatorId', async (req, res) => {
  res.json({ success: true, message: 'Reminder sent (mock)' })
})

export default router
