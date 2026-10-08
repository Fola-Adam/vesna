import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * POST /api/subscribe  { email, firstName?, source? }
 *
 * Stores signups using a server-only service key; public RLS stays closed.
 * Optionally forwards to Brevo when
 * BREVO_API_KEY is configured; Supabase remains the source of truth so the
 * admin "Subscribers" page keeps working even without a Brevo account.
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

  if (typeof email !== 'string' || email.length > 254 || !EMAIL_RE.test(email)) {
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
  if (!supabase) return unavailable()
  const normalizedEmail = email.trim().toLowerCase()
  try {
    const { error } = await supabase.from('email_subscribers').insert({
      email: normalizedEmail, first_name: safeName, source: safeSource,
    })
    if (error?.code === '23505') {
      const { error: updateError } = await supabase.from('email_subscribers')
        .update({ unsubscribed_at: null }).eq('email', normalizedEmail)
      if (updateError) return unavailable()
    } else if (error) {
      console.error('[subscribe] Persistence failed')
      return unavailable()
    }
  } catch {
    return unavailable()
  }

  // Best-effort sync to Brevo (never blocks/fails the signup).
  const brevoKey = process.env.BREVO_API_KEY
  if (brevoKey) {
    try {
      await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'api-key': brevoKey,
          'Content-Type': 'application/json',
          'accept-version': 'v3',
        },
        body: JSON.stringify({
          email: normalizedEmail,
          firstName: safeName ?? undefined,
          attributes: { VESNA_SOURCE: safeSource },
          updateEnabled: true,
          listIds: process.env.BREVO_LIST_ID && /^\d+$/.test(process.env.BREVO_LIST_ID)
            ? [Number(process.env.BREVO_LIST_ID)] : [],
        }),
      })
    } catch {
      // ignore — Supabase row is the record of truth
    }
  }

  return NextResponse.json({ ok: true })
}
