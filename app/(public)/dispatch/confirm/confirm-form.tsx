'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Check, MailCheck } from 'lucide-react'

export default function ConfirmForm() {
  const [token, setToken] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const captured = useRef(false)
  useEffect(() => {
    if (captured.current) return
    captured.current = true
    const value = new URLSearchParams(window.location.hash.slice(1)).get('token') ?? ''
    // URL fragments are not included in HTTP requests or referrers. Remove the
    // fragment from the address bar and hold it only for this confirmation.
    window.history.replaceState(null, '', '/dispatch/confirm')
    queueMicrotask(() => setToken(value))
  }, [])
  async function confirm() {
    if (pending || !token) return
    setPending(true); setError(null)
    try {
      const response = await fetch('/api/dispatch/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      const result = await response.json()
      if (!response.ok || !result.ok) throw new Error(result.error ?? 'Could not confirm your email.')
      setSaved(true); setToken('')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Please try again.') }
    finally { setPending(false) }
  }
  return <div className="space-y-6">
    {saved ? <p role="status" className="flex items-start gap-3 leading-relaxed"><Check className="mt-1 shrink-0 text-primary-ink" size={20} />Your email is confirmed. You are part of the Dispatch—occasional picks and stories, selected with care.</p> : <>
      <p className="leading-relaxed text-ink-muted">{token === null ? 'Preparing your confirmation…' : token ? 'Confirm below to receive letters from Vesna. You can unsubscribe whenever you like.' : 'Open the confirmation link in your email. If it has expired, join the Dispatch again to request a fresh link.'}</p>
      {!!token && <button type="button" disabled={pending} onClick={() => void confirm()} className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-primary-ink px-5 py-3 text-sm font-medium text-paper focus-ring disabled:opacity-60"><MailCheck size={18} />{pending ? 'Confirming…' : 'Confirm my email'}</button>}
      {error && <p role="alert" className="text-sm leading-relaxed text-red-800">{error}</p>}
    </>}
    <Link href="/journal" className="inline-block text-sm text-primary-ink underline underline-offset-4 focus-ring">Explore the Journal</Link>
  </div>
}
