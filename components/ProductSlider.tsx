'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ProductRow } from '@/lib/data'
import { useRevealOnScroll } from '@/hooks/use-reveal-on-scroll'
import CatalogImage from './CatalogImage'

export default function ProductSlider({ products }: { products: ProductRow[] }) {
  const sliderRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRevealOnScroll()
  const featured = products.filter(product => product.is_featured)
  const selected = (featured.length ? featured : products).slice(0, 8)
  if (!selected.length) return null
  return (
    <section ref={sectionRef} className="py-20 lg:py-32 px-5 sm:px-8 lg:px-20 reveal">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div><p className="font-section-header text-secondary mb-4">From the collection</p><h2 className="font-display-hero text-3xl lg:text-4xl">Selected picks</h2></div>
          <div className="flex gap-2">
            <button aria-label="Previous picks" className="border border-outline-variant p-3 hover:text-primary focus-ring" onClick={() => sliderRef.current?.scrollBy({ left: -320, behavior: 'smooth' })}><ChevronLeft aria-hidden="true" size={20} /></button>
            <button aria-label="Next picks" className="border border-outline-variant p-3 hover:text-primary focus-ring" onClick={() => sliderRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}><ChevronRight aria-hidden="true" size={20} /></button>
          </div>
        </div>
        <div ref={sliderRef} className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory">
          {selected.map(product => <Link key={product.id} href={`/shop/${product.slug}`} className="group w-64 sm:w-72 flex-shrink-0 snap-start focus-ring">
            <div className="relative aspect-[4/3] mb-5 overflow-hidden"><CatalogImage src={product.image_urls?.[0]} alt={product.name} sizes="288px" /></div>
            <h3 className="font-spectral text-2xl mb-3">{product.name}</h3>
            {product.why_victory && <p className="font-body-main text-sm text-on-surface-variant leading-relaxed line-clamp-3">{product.why_victory}</p>}
            <p className="text-primary text-sm mt-4">View the pick →</p>
          </Link>)}
        </div>
        <Link href="/picks" className="inline-block mt-6 text-primary underline underline-offset-4">Explore all picks</Link>
      </div>
    </section>
  )
}
