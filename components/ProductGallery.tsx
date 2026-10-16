'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import CatalogImage from './CatalogImage'

export default function ProductGallery({ images, name, featured }: { images: string[] | null; name: string; featured: boolean }) {
  const sources = [...new Set((images ?? []).filter(source => source.trim()))]
  const [selected, setSelected] = useState(0)
  const index = Math.min(selected, Math.max(0, sources.length - 1))
  const move = (step: number) => setSelected((index + step + sources.length) % sources.length)
  return <section aria-label={`${name} photographs`} className="min-w-0">
    <div tabIndex={sources.length > 1 ? 0 : undefined} onKeyDown={event => {
      if (sources.length < 2) return
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1) }
    }} className="relative aspect-[4/3] overflow-hidden bg-paper-raised focus-ring">
      <CatalogImage key={sources[index] ?? 'empty'} src={sources[index]} alt={`${name}${sources.length > 1 ? `, photograph ${index + 1} of ${sources.length}` : ''}`} sizes="(max-width: 1024px) 100vw, 50vw" priority={index === 0} className="object-contain p-5 sm:p-8" />
      {featured && <span className="absolute left-4 top-4 bg-ink px-3 py-2 font-button-label text-[10px] uppercase tracking-wider text-paper">Victory&apos;s pick</span>}
      {sources.length > 1 && <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3">
        <button type="button" aria-label="Previous photograph" onClick={() => move(-1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-paper-raised text-ink shadow-sm focus-ring"><ChevronLeft size={19} strokeWidth={1.5} aria-hidden="true" /></button>
        <span aria-live="polite" className="rounded-full bg-paper-raised px-3 py-1.5 text-xs text-ink">{index + 1} / {sources.length}</span>
        <button type="button" aria-label="Next photograph" onClick={() => move(1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-paper-raised text-ink shadow-sm focus-ring"><ChevronRight size={19} strokeWidth={1.5} aria-hidden="true" /></button>
      </div>}
    </div>
    {sources.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-2" aria-label="Choose a photograph">{sources.map((source, imageIndex) => <button type="button" key={source} aria-label={`Show photograph ${imageIndex + 1}`} aria-pressed={index === imageIndex} onClick={() => setSelected(imageIndex)} className={`relative h-16 w-20 shrink-0 overflow-hidden border bg-paper-raised focus-ring ${index === imageIndex ? 'border-primary-ink ring-1 ring-primary-ink' : 'border-ink/15 hover:border-primary-ink/50'}`}><CatalogImage src={source} alt="" sizes="80px" className="object-contain p-1" /></button>)}</div>}
  </section>
}
