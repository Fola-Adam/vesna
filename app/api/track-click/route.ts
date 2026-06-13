import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function anonymizeIp(rawIp: string): string {
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(rawIp)) {
    return rawIp.replace(/\.\d+$/, '.0')
  }
  return '0.0.0.0'
}

export async function POST(request: Request) {
  try {
    const { productId, sessionId, referrer } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const userAgent = request.headers.get('user-agent')
    const forwarded = request.headers.get('x-forwarded-for')
    const rawIp = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
    const ipAddress = rawIp === 'unknown' ? 'unknown' : anonymizeIp(rawIp)

    const { error } = await supabase
      .from('click_tracking')
      .insert({
        product_id: productId,
        session_id: sessionId || null,
        referrer: referrer || null,
        user_agent: userAgent,
        ip_address: ipAddress,
      })

    if (error) {
      console.error('Click tracking error:', error)
      return NextResponse.json(
        { error: 'Failed to track click' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Track click error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
