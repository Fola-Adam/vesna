import type { Metadata } from 'next'
import UnsubscribeForm from './unsubscribe-form'

export const metadata: Metadata = { title: 'Dispatch preferences', robots: { index: false, follow: false }, referrer: 'no-referrer' }
export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams
  return <main className="min-h-[70svh] bg-paper px-5 py-16 text-ink sm:py-24"><div className="mx-auto max-w-xl border border-ink/15 bg-paper-raised p-6 sm:p-10"><p className="mb-4 text-xs uppercase tracking-[0.18em] text-primary-ink">Letters from Vesna</p><h1 className="mb-5 font-display-hero text-4xl">Your Dispatch preferences</h1><UnsubscribeForm token={token ?? ''} /></div></main>
}
