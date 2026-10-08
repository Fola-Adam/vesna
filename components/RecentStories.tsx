'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ARTICLES } from '@/lib/journal-data'
import { useRevealOnScroll } from '@/hooks/use-reveal-on-scroll'

export default function RecentStories() {
  const sectionRef = useRevealOnScroll()

  return (
    <section ref={sectionRef} className="reveal bg-paper px-5 py-16 text-ink sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-screen-xl">
        <div className="mb-8 flex items-end justify-between gap-6 sm:mb-10">
          <div>
            <p className="font-section-header mb-3 text-ink-muted">From the journal</p>
            <h2 className="font-display-hero text-3xl sm:text-4xl">Recent stories</h2>
          </div>
          <Link href="/journal" className="hidden border-b border-ink/40 pb-1 font-button-label text-xs uppercase tracking-wider text-ink hover:border-primary focus-ring sm:inline-flex">
            Visit the journal <span aria-hidden="true" className="ml-2">→</span>
          </Link>
        </div>
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {ARTICLES.slice(0, 3).map((article) => (
            <Link key={article.id} href="/journal" className="group focus-ring">
              <div className="relative mb-4 aspect-[4/3] overflow-hidden bg-paper-raised">
                <Image
                  src={article.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.025] group-focus-visible:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
                />
              </div>
              <p className="font-section-header mb-2 text-ink-muted">{article.categoryLabel}</p>
              <h3 className="font-display-hero mb-2 text-2xl text-ink group-hover:text-primary-ink">{article.title}</h3>
              <p className="line-clamp-2 font-body-main text-sm leading-relaxed text-ink-muted">{article.excerpt}</p>
            </Link>
          ))}
        </div>
        <Link href="/journal" className="mt-8 inline-flex border-b border-ink/40 pb-1 font-button-label text-xs uppercase tracking-wider text-ink focus-ring sm:hidden">
          Visit the journal <span aria-hidden="true" className="ml-2">→</span>
        </Link>
      </div>
    </section>
  )
}
