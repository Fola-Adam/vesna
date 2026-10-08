import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const login = () => {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', request.nextUrl.pathname)
    const response = NextResponse.redirect(url)
    response.headers.set('Cache-Control', 'no-store')
    return response
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) return login()

  let response = NextResponse.next({ request })
  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    })
    const { data: { user }, error } = await supabase.auth.getUser()
    if (!user || error) return login()
    const { data: profile, error: profileError } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    if (profileError || profile?.role !== 'admin') return login()
    response.headers.set('Cache-Control', 'no-store')
    return response
  } catch {
    return login()
  }
}
