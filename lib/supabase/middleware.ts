import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

  return response
}
