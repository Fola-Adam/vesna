'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'

export default function UnsubscribeForm({ token }: { token: string }) {
  const [pending, setPending] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function unsubscribe() {
    if (pending) return
    setPending(true); setError(null)
    try {
      const response = await fetch('/api/unsubscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      const result = await response.json()
      if (!response.ok || !result.ok) throw new Error(result.error ?? 'Could not save your preference.')
      setSaved(true)
      window.history.replaceState(null, '', '/unsubscribe')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Please try again.') }
    finally { setPending(false) }
  }
  return <div className="space-y-6">
    {saved ? <p role="status" className="flex items-start gap-3 leading-relaxed"><Check className="mt-1 shrink-0 text-primary-ink" size={20} />You are unsubscribed from the Dispatch. You can still explore every pick and story on Vesna.</p> : <>
      <p className="leading-relaxed text-ink-muted">{token ? 'Choose below to stop receiving the Dispatch. Opening this page has not changed your preference.' : 'Use the personal unsubscribe link in your Dispatch email to manage your preference.'}</p>
      {token && <button type="button" disabled={pending} onClick={unsubscribe} className="min-h-12 w-full bg-primary-ink px-5 py-3 text-sm font-medium text-paper focus-ring disabled:opacity-60">{pending ? 'Saving your preference…' : 'Unsubscribe from the Dispatch'}</button>}
      {error && <p role="alert" className="text-sm leading-relaxed text-red-800">{error}</p>}
    </>}
    <Link href="/journal" className="inline-block text-sm text-primary-ink underline underline-offset-4 focus-ring">Return to the Journal</Link>
  </div>
}
