'use client'

import VenusMark from './VenusMark'
import { useVenus } from './VenusProvider'

export default function VenusTriggerPill({ productName, productSlug, className = '' }: { productName: string; productSlug?: string; className?: string }) {
  const { openChat } = useVenus()
  return <button type="button" aria-label={`Ask Venus about ${productName}`}
    onClick={() => openChat(`Tell me about ${productName}. Who is it for, and what should I check before buying?`, productSlug)}
    className={`inline-flex items-center gap-2 text-sm focus-ring py-2 ${className || 'text-secondary hover:text-primary'}`}>
    <VenusMark className="h-6 w-7" /> Ask Venus about this pick
  </button>
}
