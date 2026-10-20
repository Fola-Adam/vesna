import type { Metadata } from 'next'
import ConfirmForm from './confirm-form'

export const metadata: Metadata = { title: 'Confirm your Dispatch subscription', robots: { index: false, follow: false } }
export default function ConfirmPage() {
  return <main className="min-h-[70svh] bg-paper px-5 py-16 text-ink sm:py-24"><div className="mx-auto max-w-xl border border-ink/15 bg-paper-raised p-6 sm:p-10"><p className="mb-4 text-xs uppercase tracking-[0.18em] text-primary-ink">Letters from Vesna</p><h1 className="mb-5 font-display-hero text-4xl">A place in the Dispatch.</h1><ConfirmForm /></div></main>
}
