'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import NewsletterForm from '@/components/NewsletterForm'
import ScrollProgress from '@/components/ScrollProgress'
import { ARTICLES, JOURNAL_CATEGORIES } from '@/lib/journal-data'

export default function JournalBrowser() {
  const [active, setActive] = useState('all')
  const articles = useMemo(() => active === 'all' ? ARTICLES : ARTICLES.filter((item) => item.category === active), [active])
  const [lead, ...rest] = articles

  return (
    <main className="bg-paper text-ink">
      <ScrollProgress />
      <header className="border-b border-ink/10 px-5 pb-12 pt-16 sm:px-8 sm:pb-16 sm:pt-20 lg:px-20">
        <div className="mx-auto max-w-screen-xl">
          <p className="mb-3 font-section-header text-ink-muted">Ideas for considered living</p>
          <h1 className="max-w-3xl font-display-hero text-4xl leading-tight sm:text-5xl lg:text-6xl">The Vesna journal</h1>
          <p className="mt-5 max-w-2xl font-body-main text-base leading-relaxed text-ink-muted sm:text-lg">Notes on useful objects, thoughtful spaces, and choosing with care.</p>
        </div>
      </header>

      <section className="px-5 py-8 sm:px-8 lg:px-20" aria-label="Filter journal stories">
        <div className="mx-auto flex max-w-screen-xl flex-wrap items-center gap-2">
          {JOURNAL_CATEGORIES.map((category) => <button key={category.id} type="button" aria-pressed={active === category.id} onClick={() => setActive(category.id)} className={`border px-4 py-2 font-button-label text-xs transition-colors focus-ring ${active === category.id ? 'border-ink bg-ink text-paper' : 'border-ink/20 text-ink hover:border-primary-ink hover:text-primary-ink'}`}>{category.label}</button>)}
          <span className="ml-auto font-button-label text-xs text-ink-muted" aria-live="polite">{articles.length} {articles.length === 1 ? 'story' : 'stories'}</span>
        </div>
      </section>

      {lead ? <section className="px-5 pb-16 sm:px-8 lg:px-20 lg:pb-24">
        <div className="mx-auto max-w-screen-xl">
          <Link href={`/journal/${lead.slug}`} className="group grid gap-7 border-y border-ink/10 py-7 focus-ring sm:grid-cols-5 sm:items-center sm:gap-10 sm:py-10">
            <div className="relative aspect-[16/10] overflow-hidden bg-paper-raised sm:col-span-3">
              <Image src={lead.image} alt="" fill sizes="(max-width: 640px) 100vw, 60vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none" />
            </div>
            <div className="sm:col-span-2">
              <p className="mb-3 font-section-header text-ink-muted">{lead.categoryLabel} <span aria-hidden="true">·</span> {lead.readTime}</p>
              <h2 className="font-display-hero text-3xl leading-tight transition-colors group-hover:text-primary-ink sm:text-4xl">{lead.title}</h2>
              <p className="mt-4 font-body-main leading-relaxed text-ink-muted">{lead.excerpt}</p>
              <span className="mt-6 inline-flex font-button-label text-xs uppercase tracking-wider text-primary-ink">Read story <span className="ml-2" aria-hidden="true">→</span></span>
            </div>
          </Link>
          {rest.length > 0 && <div className="grid gap-8 pt-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            {rest.map((article) => <Link key={article.slug} href={`/journal/${article.slug}`} className="group focus-ring">
              <div className="relative mb-4 aspect-[4/3] overflow-hidden bg-paper-raised"><Image src={article.image} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none" /></div>
              <p className="mb-2 font-section-header text-ink-muted">{article.categoryLabel} <span aria-hidden="true">·</span> {article.readTime}</p>
              <h3 className="font-display-hero text-2xl leading-snug transition-colors group-hover:text-primary-ink">{article.title}</h3>
              <p className="mt-3 line-clamp-3 font-body-main text-sm leading-relaxed text-ink-muted">{article.excerpt}</p>
            </Link>)}
          </div>}
        </div>
      </section> : <p className="mx-auto max-w-screen-xl px-5 py-16 text-ink-muted">No stories in this section yet.</p>}

      <section className="border-t border-ink/10 bg-paper-raised px-5 py-16 text-center sm:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl"><h2 className="font-display-hero text-3xl">A considered note, now and then</h2><p className="mt-3 font-body-main leading-relaxed text-ink-muted">Occasional essays and new discoveries from Vesna.</p><div className="mt-7"><NewsletterForm source="journal" /></div></div>
      </section>
    </main>
  )
}
