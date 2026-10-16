'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useMembership } from '@/components/MemberProvider'

export default function MemberPage() {
  const {user,loading,ids,signOut,error:membershipError}=useMembership()
  const [email,setEmail]=useState('');const [website,setWebsite]=useState('')
  const [pending,setPending]=useState(false);const [sent,setSent]=useState(false);const [error,setError]=useState('')
  async function submit(event:React.FormEvent) {
    event.preventDefault();if(pending)return;setPending(true);setError('')
    try {
      const next=new URLSearchParams(window.location.search).get('next') || '/shortlist'
      const response=await fetch('/api/member/link',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,website,next})});const data=await response.json()
      if(!response.ok) throw new Error(data.error || 'Could not send a sign-in link.')
      setSent(true)
    } catch(failure){setError(failure instanceof Error ? failure.message : 'Could not send a sign-in link.')}
    finally{setPending(false)}
  }
  return <main className="min-h-[75vh] bg-paper px-5 py-16 text-ink sm:py-24"><div className="mx-auto max-w-lg"><p className="text-xs font-semibold uppercase tracking-[.2em] text-primary-ink">Membership</p><h1 className="mt-5 font-display-hero text-5xl leading-tight">Your place in Vesna.</h1><p className="mt-5 text-base leading-8 text-ink-muted">A Vesnaian keeps a considered collection. Save the objects you love, compare your options, and return to your private shortlist across devices.</p>
    {loading ? <p role="status" className="mt-8">Checking your membership...</p> : user ? <section className="mt-9 border-y border-ink/15 py-7"><p className="text-sm font-medium">Signed in as {user.email}</p><p className="mt-2 text-sm text-ink-muted">{ids.length} saved picks in your account.</p><div className="mt-5 flex flex-wrap gap-4"><Link href="/shortlist" className="inline-flex min-h-12 items-center rounded-full bg-primary-ink px-6 text-sm text-paper focus-ring">Open your shortlist</Link><button onClick={async()=>{if(!await signOut())setError('Could not sign out. Please try again.')}} className="min-h-12 px-3 text-sm text-primary-ink underline focus-ring">Sign out</button></div></section> : sent ? <section role="status" className="mt-9 rounded-xl border border-primary-ink/20 bg-paper-raised p-6"><h2 className="font-display-hero text-3xl">Check your inbox.</h2><p className="mt-3 text-sm leading-7">We sent a one-time sign-in link to {email}. Open it and confirm to join or return to Vesna.</p><button onClick={()=>setSent(false)} className="mt-4 min-h-11 text-sm text-primary-ink underline focus-ring">Use another email or request a fresh link</button></section> : <form onSubmit={submit} className="mt-9 space-y-5"><div><label htmlFor="member-email" className="block text-sm font-medium">Your email</label><input id="member-email" type="email" autoComplete="email" value={email} onChange={event=>setEmail(event.target.value)} maxLength={254} required className="mt-2 min-h-12 w-full rounded-lg border border-ink/25 bg-paper-raised px-4 text-base text-ink placeholder:text-ink-muted focus-ring" placeholder="you@example.com" /></div><div hidden aria-hidden="true"><label htmlFor="member-website">Website</label><input id="member-website" value={website} onChange={event=>setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" /></div><button disabled={pending} className="min-h-12 w-full rounded-full bg-primary-ink px-6 text-sm font-medium text-paper focus-ring disabled:opacity-50">{pending ? 'Sending your link...' : 'Email my sign-in link'}</button><p className="text-xs leading-6 text-ink-muted">New here? Confirming your email creates your Vesnaian membership. No password to remember. Membership does not subscribe you to the Dispatch.</p></form>}
    {(error || membershipError) && <p role="alert" className="mt-5 text-sm text-ink">{error || membershipError}</p>}<Link href="/picks" className="mt-8 inline-flex min-h-11 items-center text-sm text-primary-ink underline focus-ring">Continue exploring the collection</Link>
  </div></main>
}
