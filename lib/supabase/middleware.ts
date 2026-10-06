import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Server-side gate for /admin: reject anonymous users and non-admins before
// the (client-rendered) admin pages ever load. Defense-in-depth — RLS still
// protects the data, but this prevents exposing the admin UI shell and
// wasting a round-trip on guaranteed-denied queries.
async function isAdmin(supabase: ReturnType<typeof createServerClient>) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string) {
          request.cookies.set({ name, value })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value })
        },
        remove(name: string) {
          request.cookies.set({ name, value: '' })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', maxAge: 0 })
        },
      },
    }
  )

  await supabase.auth.getUser()

  // Enforce admin access at the edge for all /admin routes.
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!(await isAdmin(supabase))) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}
