'use client'

import Link from 'next/link'
import { ArrowUpRight, BookOpen } from 'lucide-react'
import type { VenusProduct, VenusReading } from '@/lib/venus-stream'
import { formatPrice } from '@/lib/pricing'
import CatalogImage from './CatalogImage'

export default function VenusRecommendations({ products = [], readings = [], onNavigate }: {
  products?: VenusProduct[]; readings?: VenusReading[]; onNavigate: () => void
}) {
  return <div className="w-full space-y-6">
    {products.length > 0 && <section aria-label="Recommended picks" className="mt-5">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.18em] text-primary-ink">From the collection</p>
      <div className="grid gap-3">{products.slice(0, 3).map(product => <Link key={product.slug} href={`/shop/${encodeURIComponent(product.slug)}`} onClick={onNavigate} className="group flex overflow-hidden rounded-xl border border-[#292720]/10 bg-paper-raised transition-colors hover:border-[#1b5a45]/35 hover:bg-white focus-ring">
        <div className="relative w-[100px] shrink-0 sm:w-[120px]"><CatalogImage src={product.image_urls?.[0]} alt={product.name} sizes="120px" /></div>
        <div className="min-w-0 flex-1 p-4">
          {product.category && <p className="text-[10px] font-medium uppercase tracking-[.12em] text-ink-muted">{product.category}</p>}
          <h3 className="mt-1 text-sm font-semibold leading-5 text-ink">{product.name}</h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-ink-muted">{product.why_victory || product.description}</p>
          <div className="mt-3 flex items-center justify-between gap-2"><span className="text-sm font-semibold text-primary-ink">{formatPrice(product.price)}</span><ArrowUpRight aria-hidden="true" size={17} strokeWidth={1.5} className="text-primary-ink transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" /></div>
        </div>
      </Link>)}</div>
    </section>}
    {readings.length > 0 && <section aria-label="Suggested reading" className="mt-5">
      <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-primary-ink"><BookOpen aria-hidden="true" size={13} />A little further reading</p>
      <div className="space-y-3">{readings.slice(0, 3).map(reading => <Link key={reading.slug} href={`/journal/${encodeURIComponent(reading.slug)}`} onClick={onNavigate} className="group block rounded-xl border border-[#292720]/10 bg-paper-raised p-4 transition-colors hover:border-[#1b5a45]/35 hover:bg-white focus-ring">
        <div className="flex items-start gap-4"><div className="min-w-0 flex-1"><p className="text-[10px] font-medium uppercase tracking-[.1em] text-primary-ink">{reading.categoryLabel}</p><h3 className="mt-2 font-display-hero text-[23px] font-semibold leading-tight text-ink">{reading.title}</h3></div><div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md"><CatalogImage src={reading.image} alt="" sizes="64px" /></div></div>
        <p className="mt-3 text-xs leading-5 text-ink-muted">{reading.excerpt}</p><span className="mt-3 flex items-center justify-between text-xs font-medium text-primary-ink"><span>Read the story <span className="ml-2 text-ink-muted">{reading.readTime}</span></span><ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.5} /></span>
      </Link>)}</div>
    </section>}
  </div>
}
