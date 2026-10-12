import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse, type NextRequest } from 'next/server'
import { dispatchConfiguration, sendDispatchConfirmation } from '@/lib/dispatch-email'
import { issueConfirmation } from '@/lib/dispatch-token'

/**
 * POST /api/subscribe  { email, firstName?, source? }
 *
 * Stores signups using a server-only service key; public RLS stays closed.
 * Sends an email ownership confirmation before enabling a subscription.
 * Pending addresses are never added to a marketing list.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Very small in-memory limiter: max N signups per IP per window.
// (Per-instance only — fine at this traffic level; swap for Upstash when needed.)
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 5
const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_PER_WINDOW) return true
  recent.push(now)
  hits.set(ip, recent)
  // Prevent unbounded map growth
  if (hits.size > 10_000) {
    for (const [k, v] of hits) {
      if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k)
    }
  }
  return false
}

export async function POST(request: NextRequest) {
  if (Number(request.headers.get('content-length') ?? 0) > 2048) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 413 })
  }
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { email, firstName, source } = (body ?? {}) as {
    email?: unknown
    firstName?: unknown
    source?: unknown
  }

  if (typeof email !== 'string' || email.length > 254 || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }
  const safeName =
    typeof firstName === 'string' ? firstName.trim().slice(0, 80) || null : null
  const safeSource =
    typeof source === 'string' && ['website', 'about', 'journal', 'popup', 'checkout', 'footer'].includes(source)
      ? source
      : 'website'

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0'
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const unavailable = () => NextResponse.json(
    { error: 'Signup is temporarily unavailable. Please try again later.' }, { status: 503 },
  )
  const supabase = createServiceClient()
  const config = dispatchConfiguration()
  if (!supabase || !config?.apiKey) return unavailable()
  const normalizedEmail = email.trim().toLowerCase()
  // The same response for existing, pending, and new addresses avoids exposing
  // membership. A confirmed address receives no unnecessary confirmation email.
  const accepted = () => NextResponse.json({ ok: true }, { status: 202, headers: { 'Cache-Control': 'no-store' } })
  const fields = 'id,email,is_verified,unsubscribe_token,unsubscribed_at'
  try {
    const lookup = () => supabase.from('email_subscribers').select(fields).eq('email', normalizedEmail).maybeSingle()
    let { data: subscriber, error } = await lookup()
    if (error) return unavailable()
    if (!subscriber) {
      const inserted = await supabase.from('email_subscribers').insert({
        email: normalizedEmail, first_name: safeName, source: safeSource, is_verified: false,
      }).select(fields).single()
      if (inserted.error?.code === '23505') {
        // Another signup won the insert race. Reuse its row without changing consent.
        const existing = await lookup()
        subscriber = existing.data; error = existing.error
      } else { subscriber = inserted.data; error = inserted.error }
    }
    if (error || !subscriber) return unavailable()
    if (subscriber.is_verified && !subscriber.unsubscribed_at) return accepted()
    const token = issueConfirmation(subscriber, config.origin, config.secret)
    await sendDispatchConfirmation(normalizedEmail, `${config.origin}/dispatch/confirm#token=${encodeURIComponent(token)}`, config.apiKey)
    return accepted()
  } catch {
    console.error('[subscribe] Confirmation could not be delivered')
    return NextResponse.json({ error: 'We could not send your confirmation email. Please try again later.' }, { status: 503 })
  }
}
