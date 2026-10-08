import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { after } from 'next/server'
import { getProductById } from '@/lib/data'
import { sellerDetails } from '@/lib/affiliate'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function anonymizeIp(rawIp: string): string {
  const parts = rawIp.split('.')
  if (parts.length === 4 && parts.every((p) => /^\d{1,3}$/.test(p))) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.0` // zero last octet (IPv4)
  }
  if (rawIp.includes(':')) {
    // IPv6 — keep only the first two groups (/64 prefix is still coarse enough)
    return rawIp.split(':').slice(0, 2).join(':') + '::'
  }
  return 'unknown'
}

/** Only stored HTTP(S) seller URLs, without embedded credentials, are eligible. */
async function recordClick(request: NextRequest, productId: unknown) {
  // Best-effort fire-and-forget logging for the GET redirect flow.
  try {
    if (typeof productId !== 'string' || !UUID_RE.test(productId)) return
    const supabase = await createClient()
    const userAgent = request.headers.get('user-agent')?.slice(0, 512) ?? null
    const forwarded = request.headers.get('x-forwarded-for')
    const rawIp = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
    await supabase.from('click_tracking').insert({
      product_id: productId,
      referrer: request.referrer?.slice(0, 2048) ?? null,
      user_agent: userAgent,
      ip_address: rawIp === 'unknown' ? 'unknown' : anonymizeIp(rawIp),
    })
  } catch (e) {
    console.error('Click tracking error:', e)
  }
}

/**
 * GET — no-JS fallback used by server-rendered purchase links:
 *   /api/track-click?productId=<uuid>
 * Resolves an active listing's stored seller URL. Tracking runs after the response.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const productId = params.get('productId')
  if (!productId || !UUID_RE.test(productId)) {
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
  }
  try {
    const product = await getProductById(productId)
    const target = product?.item_type !== 'archive' ? sellerDetails(product?.affiliate_link ?? null)?.href : null
    if (!target) return NextResponse.json({ error: 'Seller link unavailable' }, { status: 404 })
    after(() => recordClick(request, productId))
    const response = NextResponse.redirect(target, 302)
    response.headers.set('Cache-Control', 'no-store')
    return response
  } catch {
    return NextResponse.json({ error: 'Seller link temporarily unavailable' }, { status: 503 })
  }
}

/** POST — legacy beacon endpoint (kept for Venus widget / older pages). */
export async function POST(request: NextRequest) {
  // This endpoint is unauthenticated and public — deny bots/abuse cheaply.
  if (request.headers.get('sec-fetch-mode') === 'navigate') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { productId, sessionId, referrer } = await request.json()

    // Validate types and shapes — this endpoint is public (unauthenticated
    // INSERT allowed by RLS), so every field must be strictly checked to
    // prevent storage exhaustion / malformed data.
    if (typeof productId !== 'string' || !UUID_RE.test(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }
    if (sessionId != null && (typeof sessionId !== 'string' || sessionId.length > 128)) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 })
    }
    if (referrer != null && (typeof referrer !== 'string' || referrer.length > 2048)) {
      return NextResponse.json({ error: 'Invalid referrer' }, { status: 400 })
    }

    const supabase = await createClient()

    const userAgent = request.headers.get('user-agent')?.slice(0, 512) ?? null
    const forwarded = request.headers.get('x-forwarded-for')
    const rawIp = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
    const ipAddress = rawIp === 'unknown' ? 'unknown' : anonymizeIp(rawIp)

    const { error } = await supabase.from('click_tracking').insert({
      product_id: productId,
      session_id: sessionId || null,
      referrer: referrer || null,
      user_agent: userAgent,
      ip_address: ipAddress,
    })

    if (error) {
      console.error('Click tracking error:', error)
      return NextResponse.json({ error: 'Failed to track click' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Track click error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
