'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMembership } from '@/components/MemberProvider'
export default function MemberConfirmPage() {
  const [token,setToken]=useState('');const [next,setNext]=useState('/shortlist');const [pending,setPending]=useState(false);const [error,setError]=useState('')
  const credentials=useRef<{token:string;next:string}|null>(null)
  const router=useRouter();const {refresh}=useMembership()
  useEffect(()=>{
    let cancelled=false
    if(!credentials.current) {
      const params=new URLSearchParams(window.location.hash.slice(1));const redirect=params.get('next')
      credentials.current={token:params.get('token_hash') || '',next:redirect && /^\/(?:shortlist|picks|shop\/[a-z0-9-]+)(?:\?[^#]*)?$/.test(redirect) ? redirect : '/shortlist'}
      window.history.replaceState(null,'',window.location.pathname)
    }
    const value=credentials.current
    void Promise.resolve().then(()=>{if(!cancelled){setToken(value.token);setNext(value.next)}})
    return()=>{cancelled=true}
  },[])
  async function confirm() {
    if(pending || !token) return;setPending(true);setError('')
    try {
      const response=await fetch('/api/member/confirm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})});const data=await response.json()
      if(!response.ok) throw new Error(data.error || 'Could not sign in.')
      setToken('');await refresh();router.replace(next);router.refresh()
    } catch(failure){setError(failure instanceof Error ? failure.message : 'Could not sign in.');setPending(false)}
  }
  return <main className="min-h-[70vh] bg-paper px-5 py-20 text-ink"><div className="mx-auto max-w-lg"><p className="text-xs font-semibold uppercase tracking-[.2em] text-primary-ink">Vesnaian membership</p><h1 className="mt-5 font-display-hero text-5xl">Welcome to your place.</h1><p className="mt-5 text-base leading-8 text-ink-muted">Confirm this sign-in to access your private shortlist.</p><button onClick={confirm} disabled={pending || !token} className="mt-8 min-h-12 rounded-full bg-primary-ink px-7 text-sm font-medium text-paper focus-ring disabled:opacity-50">{pending ? 'Signing you in...' : 'Continue to Vesna'}</button>{error && <p role="alert" className="mt-5 text-sm">{error}</p>}{!token && !pending && <p className="mt-5 text-sm text-ink-muted">No usable sign-in link is attached. Request a fresh one.</p>}<Link href="/member" className="mt-6 block py-3 text-sm text-primary-ink underline focus-ring">Request a new sign-in link</Link></div></main>
}
