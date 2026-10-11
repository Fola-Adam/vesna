'use client'

import VenusMark from './VenusMark'
import { useVenus } from './VenusProvider'

export default function VenusTriggerPill({ productName, productSlug, className = '' }: { productName: string; productSlug?: string; className?: string }) {
  const { openChat } = useVenus()
  return <button type="button" aria-label={`Ask Venus about ${productName}`}
    onClick={() => openChat(`Tell me about ${productName}. Who is it for, and what should I check before buying?`, productSlug)}
    className={`inline-flex min-h-11 items-center gap-2 border px-4 py-2.5 text-sm font-semibold focus-ring transition-colors ${className || 'border-primary-ink bg-primary-ink text-paper hover:bg-[#10382d]'}`}>
    <VenusMark className="h-7 w-8" /> <span>Ask Venus about this pick</span>
  </button>
}
