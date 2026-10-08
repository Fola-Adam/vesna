'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ProductRow } from '@/lib/data'
import { useRevealOnScroll } from '@/hooks/use-reveal-on-scroll'
import CatalogImage from './CatalogImage'
import { effectivePricing, formatPrice } from '@/lib/pricing'

export default function ProductSlider({ products }: { products: ProductRow[] }) {
  const sliderRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRevealOnScroll()
  const featured = products.filter(product => product.is_featured)
  const selected = (featured.length ? featured : products).slice(0, 8)
  if (!selected.length) return null
  const scrollByCard = (direction: -1 | 1) => {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    sliderRef.current?.scrollBy({ left: direction * 320, behavior })
  }
  return (
    <section ref={sectionRef} className="reveal bg-paper px-5 py-16 text-ink sm:px-8 lg:px-20 lg:py-20">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-end justify-between gap-6 mb-8">
          <div><p className="font-section-header text-ink-muted mb-3">Chosen with intention</p><h2 className="font-display-hero text-3xl lg:text-4xl">Selected picks</h2></div>
          <div className="flex gap-2">
            <button aria-label="Previous picks" className="border border-ink/25 p-3 text-ink transition-colors hover:border-primary-ink hover:text-primary-ink focus-ring" onClick={() => scrollByCard(-1)}><ChevronLeft aria-hidden="true" size={20} /></button>
            <button aria-label="Next picks" className="border border-ink/25 p-3 text-ink transition-colors hover:border-primary-ink hover:text-primary-ink focus-ring" onClick={() => scrollByCard(1)}><ChevronRight aria-hidden="true" size={20} /></button>
          </div>
        </div>
        <div ref={sliderRef} className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory">
          {selected.map(product => <Link key={product.id} href={`/shop/${product.slug}`} className="group w-64 flex-shrink-0 snap-start sm:w-72 focus-ring">
            <div className="relative mb-4 aspect-[4/3] overflow-hidden bg-paper-raised"><CatalogImage src={product.image_urls?.[0]} alt={product.name} sizes="288px" /></div>
            <p className="font-section-header mb-2 text-ink-muted">{product.categories?.name ?? 'Selected object'}</p>
            <h3 className="font-display-hero mb-2 text-2xl text-ink transition-colors group-hover:text-primary-ink">{product.name}</h3>
            <p className="mb-2 text-sm text-primary-ink">{formatPrice(effectivePricing(product).price)}</p>
            {product.why_victory && <p className="font-body-main text-sm leading-relaxed text-ink-muted line-clamp-3">{product.why_victory}</p>}
            <p className="mt-3 text-sm text-primary-ink">View the pick <span aria-hidden="true">→</span></p>
          </Link>)}
        </div>
        <Link href="/picks" className="inline-block mt-5 border-b border-ink/40 pb-1 text-sm text-ink hover:border-primary-ink hover:text-primary-ink focus-ring">Explore all picks <span aria-hidden="true">→</span></Link>
      </div>
    </section>
  )
}
