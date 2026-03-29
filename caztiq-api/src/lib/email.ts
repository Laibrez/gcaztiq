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
    from: `Caztiq Payments <${process.env.FROM_EMAIL}>`,
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
    from: `Caztiq Payments <${process.env.FROM_EMAIL}>`,
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
export async function sendCreatorInviteEmail(data: {
  to: string
  brandName: string
}) {
  return resend.emails.send({
    from: 'Caztiq <payments@caztiq.com>',
    to: data.to,
    subject: `${data.brandName} added you as a creator`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background: #F9F8F4; margin: 0; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; border: 1px solid #E8E6DF;">
    <div style="width: 40px; height: 40px; background: #B6F542; border-radius: 8px; margin-bottom: 24px;"></div>
    <h2 style="margin: 0 0 8px; font-size: 22px; color: #1A1A18;">You've been added as a creator</h2>
    <p style="color: #6B6B65; margin: 0 0 24px;">
      <strong style="color: #1A1A18;">${data.brandName}</strong> has added you to their creator program on PayGrade.
    </p>
    <p style="color: #6B6B65; margin: 0 0 24px;">
      When they send you a payment, you'll receive an email with a link to claim it. No account required.
    </p>
    <p style="color: #9B9B95; font-size: 12px; margin-top: 24px;">
      You can choose PayPal, Venmo, Wise, or bank transfer when you claim your first payment.
    </p>
  </div>
</body>
</html>
    `
  })
}
