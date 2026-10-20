'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import VesnaWordmark from '@/components/VesnaWordmark'
import { ArrowUpRight, LockKeyhole } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) {
      setError('Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_* env vars).')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role === 'admin') {
        const requestedPath = new URLSearchParams(window.location.search).get('next')
        const nextPath = requestedPath?.startsWith('/admin/') && !requestedPath.startsWith('//')
          ? requestedPath
          : '/admin/dashboard'
        router.push(nextPath)
      } else {
        await supabase.auth.signOut()
        setError('Access denied. Admin access only.')
      }
    } catch (err: unknown) {
      setError((err as { message: string }).message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="admin-login min-h-[100svh] overflow-hidden px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-6xl flex-col justify-between gap-10 sm:min-h-[calc(100svh-6rem)]">
        <header className="flex items-center justify-between">
          <Link href="/" aria-label="Vesna home" className="font-display-hero text-2xl tracking-[0.13em] text-[#f6f0e5]"><VesnaWordmark /></Link>
          <Link href="/" className="inline-flex min-h-10 items-center gap-2 text-xs font-medium tracking-wide text-[#d5cfc3] transition-colors hover:text-white">Visit Vesna <ArrowUpRight size={14} /></Link>
        </header>

        <div className="grid flex-1 items-center gap-12 lg:grid-cols-[1fr_0.82fr] lg:gap-24">
          <section className="relative hidden min-h-[470px] flex-col justify-end overflow-hidden rounded-[2px] bg-[#10382d] p-10 text-[#f6f0e5] lg:flex xl:p-14">
            <div aria-hidden="true" className="admin-login-orbit absolute -right-24 -top-28 h-[460px] w-[460px] rounded-full border border-[#c3aa7b]/35" />
            <div aria-hidden="true" className="absolute -right-5 -top-9 h-[320px] w-[320px] rounded-full border border-[#c3aa7b]/20" />
            <p className="relative font-section-header text-[0.65rem] tracking-[0.24em] text-[#d8c59c]">THE VESNA EDIT</p>
            <h1 className="relative mt-5 max-w-xl font-display-hero text-6xl font-medium leading-[0.98] xl:text-7xl">A considered collection, thoughtfully kept.</h1>
            <p className="relative mt-6 max-w-md text-sm leading-7 text-[#d4d8cf]">The private studio for tending the picks, stories, and people behind Vesna.</p>
            <span className="relative mt-12 h-px w-20 bg-[#c3aa7b]" />
          </section>

          <section className="mx-auto w-full max-w-[440px] py-8 lg:py-0">
            <div className="mb-9">
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#c3aa7b]/40 bg-[#c3aa7b]/10 text-[#d4bc8a]"><LockKeyhole size={17} strokeWidth={1.5} /></div>
              <p className="font-section-header text-[0.65rem] tracking-[0.22em] text-[#c3aa7b]">CURATOR STUDIO</p>
              <h2 className="mt-3 font-display-hero text-4xl text-[#f6f0e5] sm:text-5xl">Admin access</h2>
              <p className="mt-3 text-sm leading-6 text-[#bdb7ab]">Sign in with the administrator account to continue.</p>
            </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.17em] text-[#e7e0d3]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              className="admin-login-input min-h-12 w-full border px-4 py-3 font-body-main text-[#f6f0e5] placeholder:text-[#898378] focus:outline-none focus:ring-2 focus:ring-[#79b89b]/50"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.17em] text-[#e7e0d3]">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="admin-login-input min-h-12 w-full border px-4 py-3 font-body-main text-[#f6f0e5] placeholder:text-[#898378] focus:outline-none focus:ring-2 focus:ring-[#79b89b]/50"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p role="alert" className="border border-[#b86455]/40 bg-[#6b3028]/20 px-4 py-3 text-sm leading-5 text-[#ffc4b7]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="min-h-12 w-full bg-[#c3aa7b] px-8 py-4 font-button-label text-xs font-semibold uppercase tracking-[0.2em] text-[#20231d] transition duration-300 hover:bg-[#d4bd91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6f0e5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#171a17] disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-7 flex items-center gap-2 text-xs leading-5 text-[#aaa497]"><LockKeyhole size={13} /> Authorized personnel only. Access is limited to Vesna’s administrator.</p>
          </section>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-[0.65rem] uppercase tracking-[0.14em] text-[#89867d]"><span>VESNA · CURATOR STUDIO</span><span>Thoughtfully selected. Carefully kept.</span></footer>
      </div>
    </main>
  )
}
