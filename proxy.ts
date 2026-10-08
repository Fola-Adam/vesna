import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// NOTE: In Next.js 16 the `middleware` file convention is deprecated in
// favor of `proxy` (same API, runs on Node runtime by default).
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: ['/admin/:path*'],
}
