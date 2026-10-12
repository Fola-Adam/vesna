import { createClient } from '@/lib/supabase/server'
import { dispatchConfiguration } from '@/lib/dispatch-email'

export const runtime = 'nodejs'
export async function GET() {
  const client = await createClient()
  const { data: { user }, error } = await client.auth.getUser()
  if (!user || error) return Response.json({ error: 'Please sign in again.' }, { status: 401 })
  const { data: profile } = await client.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return Response.json({ error: 'Admin access required.' }, { status: 403 })
  const result = (connected: boolean, message: string) => Response.json({ connected, message }, { headers: { 'Cache-Control': 'private, no-store' } })
  const config = dispatchConfiguration()
  if (!config?.apiKey) return result(false, 'Email delivery needs configuration. Signup will remain unavailable until the connection is ready.')
  try {
    const response = await fetch('https://api.brevo.com/v3/senders', { headers: { 'api-key': config.apiKey }, signal: AbortSignal.timeout(8000), cache: 'no-store' })
    if (!response.ok) {
      const failure = await response.json().catch(() => null) as { message?: string } | null
      const message = typeof failure?.message === 'string' ? failure.message : ''
      // Classify provider errors without returning raw messages, credentials,
      // network addresses, or other account details to the browser.
      if (/unrecogni[sz]ed IP|unauthori[sz]ed IP|IP address|IP restriction/i.test(message)) return result(false, 'Brevo is blocking this preview server through its IP security settings. Review the API key’s allowed IPs in Brevo.')
      if (response.status === 401) return result(false, 'Brevo does not accept this API key. Check that BREVO_API_KEY is an active Brevo API key, rather than an SMTP key, and save the complete value.')
      return result(false, `Brevo rejected the connection (HTTP ${response.status}). Check the API key and sender settings.`)
    }
    const data = await response.json() as { senders?: { id: number; active: boolean }[] }
    const active = data.senders?.filter(sender => sender.active) ?? []
    const configured = Number(process.env.BREVO_SENDER_ID)
    const ready = Number.isSafeInteger(configured) && configured > 0 ? active.some(sender => sender.id === configured) : active.length === 1
    return ready ? result(true, 'Email service connected. A verified sender is available for confirmation emails.') : result(false, 'Choose an active verified sender for Dispatch confirmation emails.')
  } catch { return result(false, 'The email service could not be reached. Please retry shortly.') }
}
