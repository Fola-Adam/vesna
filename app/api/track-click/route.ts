import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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
    
    // Get user if authenticated
    const { data: { user } } = await supabase.auth.getUser()
    
    // Get request metadata
    const userAgent = request.headers.get('user-agent')
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'
    
    // Insert click tracking record
    const { error } = await supabase
      .from('click_tracking')
      .insert({
        product_id: productId,
        user_id: user?.id || null,
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
