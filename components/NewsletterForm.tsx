'use client'

import { useId, useState } from 'react'
import { Check } from 'lucide-react'

export default function NewsletterForm({ source = 'website' }: { source?: 'website' | 'about' | 'journal' }) {
  const id = useId()
  const [email, setEmail] = useState('')
  const [pending, setPending] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function subscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setPending(true)
    setError(null)
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || result?.ok !== true) {
        throw new Error(result?.error ?? 'Signup failed. Please try again later.')
      }
      setSaved(true)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Signup failed. Please try again later.')
    } finally {
      setPending(false)
    }
  }

  if (saved) return (
    <p role="status" className="flex items-center justify-center gap-2 text-primary font-body-main py-4">
      <Check aria-hidden="true" size={20} /> Thanks—your signup is saved.
    </p>
  )

  return (
    <form onSubmit={subscribe} className="max-w-xl mx-auto text-left" aria-busy={pending}>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <label htmlFor={id} className="sr-only">Email address</label>
          <input id={id} type="email" autoComplete="email" maxLength={254} required
            value={email} onChange={event => setEmail(event.target.value)}
            placeholder="Your email address" disabled={pending}
            aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined}
            className="w-full bg-surface-container border border-outline/50 px-4 py-4 text-on-background placeholder:text-outline font-body-main focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          />
        </div>
        <button type="submit" disabled={pending}
          className="bg-primary text-on-primary px-6 py-4 font-button-label text-xs uppercase tracking-widest hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4 disabled:opacity-60">
          {pending ? 'Joining…' : 'Join the Dispatch'}
        </button>
      </div>
      {error && <p id={`${id}-error`} role="alert" className="mt-3 text-error text-sm font-body-main">{error}</p>}
    </form>
  )
}
