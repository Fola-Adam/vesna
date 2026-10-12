import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'nodejs'
const TOKEN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const hits = new Map<string, number[]>()

// GET intentionally does nothing: email scanners must never unsubscribe readers.
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter(time => now - time < 60_000)
  if (recent.length >= 12) return Response.json({ error: 'Please wait a minute before trying again.' }, { status: 429, headers: { 'Retry-After': '60' } })
  hits.set(ip, [...recent, now])
  if (hits.size > 10_000) for (const [key, times] of hits) if (!times.some(time => now - time < 60_000)) hits.delete(key)
  if (Number(request.headers.get('content-length') ?? 0) > 2048) return Response.json({ error: 'Invalid request.' }, { status: 413 })
  let body: unknown
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid request.' }, { status: 400 }) }
  const token = body && typeof body === 'object' && 'token' in body ? body.token : null
  if (typeof token !== 'string' || !TOKEN.test(token)) return Response.json({ error: 'This unsubscribe link is incomplete or invalid.' }, { status: 400 })
  const supabase = createServiceClient()
  if (!supabase) return Response.json({ error: 'Preferences are temporarily unavailable. Please try again.' }, { status: 503 })
  const { data, error } = await supabase.from('email_subscribers').select('id,email,unsubscribed_at').eq('unsubscribe_token', token).maybeSingle()
  if (error) return Response.json({ error: 'Could not save your preference. Please try again.' }, { status: 503 })
  if (!data) return Response.json({ error: 'This unsubscribe link is no longer valid.' }, { status: 400 })
  const { error: updateError } = await supabase.from('email_subscribers').update({ unsubscribed_at: data.unsubscribed_at ?? new Date().toISOString() }).eq('id', data.id)
  if (updateError) return Response.json({ error: 'Could not save your preference. Please try again.' }, { status: 503 })
  // The local suppression is immediate even if the mailing provider is unavailable.
  if (process.env.BREVO_API_KEY) {
    try {
      const response = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(data.email)}`, {
        method: 'PUT', headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailBlacklisted: true }), signal: AbortSignal.timeout(8000),
      })
      if (!response.ok && response.status !== 404) return Response.json({ error: 'Your preference is saved, but the mailing service has not confirmed it yet. Please retry to complete the update.' }, { status: 503 })
    } catch { return Response.json({ error: 'Your preference is saved. Please retry shortly to confirm it with the mailing service.' }, { status: 503 }) }
  }
  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
}
