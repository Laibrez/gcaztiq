import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface PayoutEmailData {
  to: string
  brandName: string
  amountFormatted: string
  currency: string
  claimToken: string
  note?: string
}

export async function sendPayoutEmail(data: PayoutEmailData) {
  const claimUrl = `${process.env.FRONTEND_URL}/claim/${data.claimToken}`

  return resend.emails.send({
    from: 'Caztiq Payments <payments@caztiq.com>',
    to: data.to,
    subject: `${data.brandName} sent you ${data.amountFormatted}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background: #F9F8F4; margin: 0; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; border: 1px solid #E8E6DF;">
    <div style="width: 40px; height: 40px; background: #B6F542; border-radius: 8px; margin-bottom: 24px;"></div>
    <h2 style="margin: 0 0 8px; font-size: 22px; color: #1A1A18;">You have a payment waiting</h2>
    <p style="color: #6B6B65; margin: 0 0 24px;">
      <strong style="color: #1A1A18;">${data.brandName}</strong> sent you a payment.
    </p>
    <div style="background: #F9F8F4; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
      <div style="font-size: 36px; font-weight: 700; color: #1A1A18;">${data.amountFormatted}</div>
      <div style="color: #6B6B65; font-size: 14px;">${data.currency}</div>
    </div>
    ${data.note ? `<p style="color: #6B6B65; font-size: 14px; margin-bottom: 24px;">Note: ${data.note}</p>` : ''}
    <a href="${claimUrl}" style="display: block; background: #B6F542; color: #1A1A18; padding: 16px; border-radius: 10px; text-decoration: none; font-weight: 700; text-align: center; font-size: 16px;">
      Claim Your Payment →
    </a>
    <p style="color: #9B9B95; font-size: 12px; margin-top: 24px; text-align: center;">
      No account required. Link expires in 30 days.<br>
      Choose PayPal, Venmo, bank transfer, or Wise.
    </p>
  </div>
</body>
</html>
    `
  })
}

export async function sendPayoutClaimedEmail(data: {
  to: string
  creatorEmail: string
  amountFormatted: string
}) {
  return resend.emails.send({
    from: 'Caztiq Payments <payments@caztiq.com>',
    to: data.to,
    subject: `Payment claimed — ${data.amountFormatted}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px;">
        <h2 style="color: #1A1A18;">Payment Claimed</h2>
        <p style="color: #6B6B65;">
          <strong>${data.creatorEmail}</strong> just claimed their payment of 
          <strong>${data.amountFormatted}</strong>.
        </p>
        <p style="color: #6B6B65;">The funds have been deducted from your wallet.</p>
      </div>
    `
  })
}
// Sent to creator when brand invites them (legacy — kept for backward compat)
export async function sendCreatorInviteEmail(data: {
  to: string
  brandName: string
}) {
  return resend.emails.send({
    from: 'Caztiq <notifications@caztiq.com>',
    to: data.to,
    subject: `${data.brandName} added you as a creator on Caztiq`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background: #F9F8F4; margin: 0; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; border: 1px solid #E8E6DF;">
    <div style="width: 40px; height: 40px; background: #B6F542; border-radius: 8px; margin-bottom: 24px;"></div>
    <p style="color: #6B6B65; margin: 0 0 24px;">
      <strong style="color: #1A1A18;">${data.brandName}</strong> has added you to their creator program on Caztiq.
    </p>
    <p style="color: #6B6B65; margin: 0 0 24px;">
      When they send you a payment, you'll receive an email with a link to claim it. No account required.
    </p>
    <p style="color: #9B9B95; font-size: 13px; margin-top: 32px; border-top: 1px solid #E8E6DF; padding-top: 20px;">
      — Caztiq
    </p>
  </div>
</body>
</html>
    `
  })
}

// Email 2: Confirmation to creator after W-9 submitted
export async function sendTaxConfirmationEmail(data: {
  to: string
  creatorName: string
  brandName: string
}) {
  return resend.emails.send({
    from: 'Caztiq <notifications@caztiq.com>',
    to: data.to,
    subject: `You're all set on Caztiq`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background: #F9F8F4; margin: 0; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; border: 1px solid #E8E6DF;">
    <div style="width: 40px; height: 40px; background: #B6F542; border-radius: 8px; margin-bottom: 24px;"></div>
    <p style="color: #6B6B65; margin: 0 0 16px;">Hi ${data.creatorName},</p>
    <p style="color: #6B6B65; margin: 0 0 16px;">
      Your tax information has been received. You're now set up to receive payments from
      <strong style="color: #1A1A18;">${data.brandName}</strong>.
    </p>
    <p style="color: #6B6B65; margin: 0 0 24px;">
      You'll get an email each time a payment is sent to you. No login or account needed — everything happens by email.
    </p>
    <p style="color: #9B9B95; font-size: 13px; margin-top: 32px; border-top: 1px solid #E8E6DF; padding-top: 20px;">
      — Caztiq
    </p>
  </div>
</body>
</html>
    `
  })
}

// Email 1: Invitation (sent when brand invites creator)
export async function sendCreatorInvitationEmail(data: {
  to: string
  creatorName: string
  brandName: string
  inviteToken: string
}) {
  const inviteUrl = `${process.env.FRONTEND_URL}/invite/${data.inviteToken}`
  const firstName = data.creatorName.split(' ')[0]
  const dateStamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return resend.emails.send({
    from: 'Caztiq <notifications@caztiq.com>',
    to: data.to,
    subject: `${data.brandName} wants to pay you on Caztiq`,
    headers: {
      'X-Entity-Ref-ID': data.inviteToken, // forces Gmail to treat each send as unique
    },
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background: #F9F8F4; margin: 0; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; border: 1px solid #E8E6DF;">
    <div style="width: 40px; height: 40px; background: #B6F542; border-radius: 8px; margin-bottom: 24px;"></div>
    <p style="color: #6B6B65; margin: 0 0 8px;">Hi ${firstName},</p>
    <p style="color: #6B6B65; margin: 0 0 24px;">
      <strong style="color: #1A1A18;">${data.brandName}</strong> invited you to receive payments through Caztiq — a platform
      that makes creator payments fast and simple.
    </p>
    <p style="color: #6B6B65; margin: 0 0 24px;">
      To get started, we just need some basic tax information. It takes about 2 minutes.
    </p>
    <a href="${inviteUrl}" style="display: block; background: #B6F542; color: #1A1A18; padding: 16px; border-radius: 10px; text-decoration: none; font-weight: 700; text-align: center; font-size: 16px; margin-bottom: 24px;">
      GET STARTED →
    </a>
    <p style="color: #9B9B95; font-size: 12px; margin: 0 0 16px; word-break: break-all;">
      Or copy this link: <a href="${inviteUrl}" style="color: #6B6B65;">${inviteUrl}</a>
    </p>
    <p style="color: #6B6B65; font-size: 13px; margin: 0 0 8px;">Questions? Reply to this email.</p>
    <p style="color: #9B9B95; font-size: 13px; margin-top: 32px; border-top: 1px solid #E8E6DF; padding-top: 20px;">
      — Caztiq
    </p>
  </div>
</body>
</html>
    `
  })
}

// Email 3: Notification to brand when creator confirms
export async function sendBrandCreatorConfirmedEmail(data: {
  to: string
  brandName: string
  creatorName: string
  creatorEmail: string
}) {
  const creatorsUrl = `${process.env.FRONTEND_URL}/creators`

  return resend.emails.send({
    from: 'Caztiq <notifications@caztiq.com>',
    to: data.to,
    subject: `${data.creatorName} has confirmed on Caztiq`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background: #F9F8F4; margin: 0; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; border: 1px solid #E8E6DF;">
    <div style="width: 40px; height: 40px; background: #B6F542; border-radius: 8px; margin-bottom: 24px;"></div>
    <p style="color: #6B6B65; margin: 0 0 24px;">
      <strong style="color: #1A1A18;">${data.creatorName}</strong> (${data.creatorEmail}) has accepted your invitation and submitted their tax form.
    </p>
    <p style="color: #6B6B65; margin: 0 0 24px;">
      You can now send them payments through Caztiq.
    </p>
    <a href="${creatorsUrl}" style="display: block; background: #B6F542; color: #1A1A18; padding: 16px; border-radius: 10px; text-decoration: none; font-weight: 700; text-align: center; font-size: 16px; margin-bottom: 24px;">
      GO TO CREATORS PAGE →
    </a>
    <p style="color: #9B9B95; font-size: 13px; margin-top: 32px; border-top: 1px solid #E8E6DF; padding-top: 20px;">
      — Caztiq
    </p>
  </div>
</body>
</html>
    `
  })
}

// Email 4: Informational email when a creator is added to a new campaign
export async function sendCampaignInviteEmail(data: {
  to: string
  creatorName: string
  brandName: string
  campaignName: string
  campaignDescription?: string
  startsAt?: string
  endsAt?: string
}) {
  const firstName = data.creatorName.split(' ')[0]
  
  let datesText = ''
  if (data.startsAt && data.endsAt) datesText = `from ${new Date(data.startsAt).toLocaleDateString()} to ${new Date(data.endsAt).toLocaleDateString()}`
  else if (data.startsAt) datesText = `starting ${new Date(data.startsAt).toLocaleDateString()}`
  else if (data.endsAt) datesText = `ending ${new Date(data.endsAt).toLocaleDateString()}`
  
  return resend.emails.send({
    from: 'Caztiq <notifications@caztiq.com>',
    to: data.to,
    subject: `You've been added to a new campaign: ${data.campaignName}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background: #F9F8F4; margin: 0; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; border: 1px solid #E8E6DF;">
    <div style="width: 40px; height: 40px; background: #B6F542; border-radius: 8px; margin-bottom: 24px;"></div>
    <p style="color: #6B6B65; margin: 0 0 8px;">Hi ${firstName},</p>
    <p style="color: #6B6B65; margin: 0 0 24px;">
      <strong style="color: #1A1A18;">${data.brandName}</strong> has added you to their new campaign on Caztiq.
    </p>
    
    <div style="background: #F9F8F4; border: 1px solid #E8E6DF; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 12px; color: #1A1A18; font-size: 18px;">${data.campaignName}</h3>
      ${datesText ? `<p style="margin: 0 0 12px; color: #6B6B65; font-size: 14px;"><strong>Timeline:</strong> ${datesText}</p>` : ''}
      ${data.campaignDescription ? `<p style="margin: 0; color: #6B6B65; font-size: 14px; line-height: 1.5;">${data.campaignDescription}</p>` : ''}
    </div>

    <p style="color: #6B6B65; font-size: 14px; margin: 0 0 8px;">If you have any questions, you can reply directly to this email to reach the brand.</p>
    <p style="color: #9B9B95; font-size: 13px; margin-top: 32px; border-top: 1px solid #E8E6DF; padding-top: 20px;">
      — Caztiq
    </p>
  </div>
</body>
</html>
    `
  })
}
