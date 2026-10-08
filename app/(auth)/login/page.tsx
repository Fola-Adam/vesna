'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
        router.push('/admin/dashboard')
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
    <div className="min-h-screen flex items-center justify-center bg-surface-dim px-5">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="font-audiowide text-3xl text-primary tracking-[0.3em] mb-4">
            VESNΛ
          </h1>
          <p className="font-button-label text-xs text-on-surface-variant uppercase tracking-widest">
            Admin Access
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block font-button-label text-xs uppercase tracking-widest text-on-surface mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container border border-outline/30 px-4 py-3 text-on-background placeholder:text-outline/50 focus:outline-none focus:border-primary font-body-main"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-button-label text-xs uppercase tracking-widest text-on-surface mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container border border-outline/30 px-4 py-3 text-on-background placeholder:text-outline/50 focus:outline-none focus:border-primary font-body-main"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-error text-sm font-body-main">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-button-label text-xs uppercase tracking-[0.2em] px-8 py-4 transition-all text-on-primary disabled:opacity-50"
            style={{ background: 'linear-gradient(90deg, #e6c364, #95d4b3)' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-outline/50 text-xs font-button-label mt-8 uppercase tracking-widest">
          Authorized personnel only
        </p>
      </div>
    </div>
  )
}
