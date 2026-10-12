import 'server-only'

export function dispatchConfiguration() {
  const secret = process.env.DISPATCH_SIGNING_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  const origin = process.env.VESNA_DISPATCH_ORIGIN || process.env.DISPATCH_SITE_URL
  if (!secret || !origin) return null
  try {
    const url = new URL(origin)
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && url.hostname === 'localhost')) return null
    return { secret, origin: url.origin, apiKey: process.env.BREVO_API_KEY }
  } catch { return null }
}

export async function sendDispatchConfirmation(email: string, confirmationUrl: string, apiKey: string) {
  const headers = { 'api-key': apiKey, 'Content-Type': 'application/json' }
  // An explicit sender wins. Auto-select only when this account has one active
  // sender, so an unrelated brand is never chosen from a multi-brand account.
  const configured = Number(process.env.BREVO_SENDER_ID)
  let senderId = Number.isSafeInteger(configured) && configured > 0 ? configured : null
  if (!senderId) {
    const response = await fetch('https://api.brevo.com/v3/senders', { headers, signal: AbortSignal.timeout(8000) })
    if (!response.ok) throw new Error('Email sender unavailable')
    const data = await response.json() as { senders?: { id: number; active: boolean }[] }
    const active = data.senders?.filter(sender => sender.active) ?? []
    if (active.length !== 1) throw new Error('Choose a verified Dispatch sender')
    senderId = active[0].id
  }
  const safeUrl = confirmationUrl.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST', headers, signal: AbortSignal.timeout(8000),
    body: JSON.stringify({
      sender: { id: senderId }, to: [{ email }], subject: 'Confirm your place in the Vesna Dispatch', tags: ['vesna-dispatch-confirmation'],
      textContent: `A considered selection, occasionally.\n\nConfirm your email to receive Victory's picks and stories from Vesna:\n${confirmationUrl}\n\nThe link expires in 24 hours. If you did not request this, ignore this email. Your subscription will not change.`,
      htmlContent: `<html><body style="margin:0;background:#f1eee5;color:#292820;font-family:Arial,sans-serif"><div style="max-width:540px;margin:40px auto;padding:40px;background:#faf8f1;border:1px solid #d8d3c6"><p style="letter-spacing:5px;color:#153e32;font-size:22px">VESNA</p><p style="font-size:11px;letter-spacing:2px">LETTERS FROM VESNA</p><h1 style="font-family:Georgia,serif;font-weight:400;font-size:32px">A little intention in your inbox.</h1><p style="line-height:1.7">Confirm your email to receive Victory's considered picks, useful finds, and new stories. Occasionally, and with care.</p><p style="margin:30px 0"><a href="${safeUrl}" style="display:inline-block;background:#153e32;color:#faf8f1;padding:16px 24px;text-decoration:none">Confirm my email</a></p><p style="font-size:12px;line-height:1.7">This link expires in 24 hours. If you didn't request it, you can ignore this email. Your subscription will not change.</p></div></body></html>`,
    }),
  })
  if (!response.ok) throw new Error('Confirmation delivery unavailable')
}
