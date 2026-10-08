import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser Supabase client.
 *
 * Returns null when the public env vars are absent (e.g. during `next build`
 * page-data collection, where client components are evaluated in Node with no
 * .env). Callers in client components must guard for null — they only ever run
 * in a real browser where the vars are baked in at build/deploy time.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) return null
  return createBrowserClient(url, key)
}
