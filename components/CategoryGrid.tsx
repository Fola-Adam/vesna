'use client'

import Link from 'next/link'
import CatalogImage from '@/components/CatalogImage'
import { useRevealOnScroll } from '@/hooks/use-reveal-on-scroll'

export interface CatalogCategory { name: string; image: string | null; count: number }

export default function CategoryGrid({ categories }: { categories: CatalogCategory[] }) {
  const sectionRef = useRevealOnScroll()
  if (!categories.length) return null
  return <section ref={sectionRef} className="reveal border-y border-ink/10 bg-paper-raised px-5 py-16 text-ink sm:px-8 lg:px-20 lg:py-20">
    <div className="mx-auto max-w-screen-xl">
      <div className="mb-8 max-w-2xl"><p className="mb-3 font-section-header text-ink-muted">Explore the collection</p><h2 className="font-display-hero text-3xl sm:text-4xl">Find your starting point</h2></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category) => <Link key={category.name} href={`/picks?category=${encodeURIComponent(category.name.toLowerCase())}`} className="group relative flex min-h-52 items-end overflow-hidden bg-ink p-5 focus-ring sm:min-h-64 sm:p-7">
        {category.image && <CatalogImage src={category.image} alt="" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="absolute inset-0 h-full w-full object-cover opacity-65 transition duration-300 group-hover:scale-[1.03] group-hover:opacity-75 motion-reduce:transform-none motion-reduce:transition-none" />}
        <span className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-ink/5" aria-hidden="true" />
        <span className="relative"><span className="block font-display-hero text-2xl text-paper">{category.name}</span><span className="mt-1 block font-button-label text-xs text-paper/85">{category.count} {category.count === 1 ? 'pick' : 'picks'} <span aria-hidden="true">→</span></span></span>
      </Link>)}</div>
    </div>
  </section>
}
