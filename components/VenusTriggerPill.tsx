'use client'

import { Sparkles } from 'lucide-react'
import { useVenus } from './VenusProvider'

export default function VenusTriggerPill({ productName, productSlug }: { productName: string; productSlug?: string }) {
  const { openChat } = useVenus()
  return <button type="button" aria-label={`Ask Venus about ${productName}`}
    onClick={() => openChat(`Tell me about ${productName}. Who is it for, and what should I check before buying?`, productSlug)}
    className="inline-flex items-center gap-2 text-secondary text-sm hover:text-primary focus-ring py-2">
    <Sparkles aria-hidden="true" size={16} /> Ask Venus about this pick
  </button>
}
