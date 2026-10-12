import { createServiceClient } from '@/lib/supabase/service'
import { dispatchConfiguration } from '@/lib/dispatch-email'
import { consentFingerprint, emailFingerprint, readConfirmation } from '@/lib/dispatch-token'

export const runtime = 'nodejs'
// Confirmation needs an explicit POST; mail scanners cannot subscribe a reader.
export async function POST(request: Request) {
  if (Number(request.headers.get('content-length') ?? 0) > 2048) return Response.json({ error: 'Invalid request.' }, { status: 413 })
  let body: unknown
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid request.' }, { status: 400 }) }
  const token = body && typeof body === 'object' && 'token' in body ? body.token : null
  const config = dispatchConfiguration()
  const supabase = createServiceClient()
  if (!config || !supabase) return Response.json({ error: 'Confirmation is temporarily unavailable. Please try again.' }, { status: 503 })
  const claims = readConfirmation(token, config.origin, config.secret)
  const invalid = () => Response.json({ error: 'This confirmation link is invalid or has expired. Join the Dispatch again to receive a new one.' }, { status: 400 })
  if (!claims) return invalid()
  const { data: row, error } = await supabase.from('email_subscribers')
    .select('id,email,is_verified,unsubscribed_at,unsubscribe_token').eq('id', claims.id).maybeSingle()
  if (error) return Response.json({ error: 'Could not confirm your email. Please try again.' }, { status: 503 })
  if (!row || emailFingerprint(row.email) !== claims.emailHash) return invalid()
  if (row.is_verified && row.unsubscribed_at === null) return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
  if (consentFingerprint(row) !== claims.state) return invalid()
  let update = supabase.from('email_subscribers').update({ is_verified: true, unsubscribed_at: null })
    .eq('id', row.id).eq('unsubscribe_token', row.unsubscribe_token)
  update = row.is_verified === null ? update.is('is_verified', null) : update.eq('is_verified', row.is_verified)
  update = row.unsubscribed_at === null ? update.is('unsubscribed_at', null) : update.eq('unsubscribed_at', row.unsubscribed_at)
  const result = await update.select('id').maybeSingle()
  if (result.error) return Response.json({ error: 'Could not confirm your email. Please try again.' }, { status: 503 })
  if (!result.data) return invalid()
  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
}
