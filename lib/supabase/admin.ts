import 'server-only'
import { redirect } from 'next/navigation'
import { createClient } from './server'

/** Every admin render must authorize on the server, independently of proxy.ts. */
export async function requireAdmin() {
  let authorized = false
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (user && !error) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles').select('role').eq('id', user.id).single()
      authorized = !profileError && profile?.role === 'admin'
    }
  } catch {
    // Missing configuration or an auth outage must never grant access.
    console.error('[admin] Authorization unavailable')
  }
  if (!authorized) redirect('/login')
}
