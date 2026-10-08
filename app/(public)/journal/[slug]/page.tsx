import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import ScrollProgress from '@/components/ScrollProgress'
import { ARTICLES, getArticleBySlug } from '@/lib/journal-data'

export function generateStaticParams() { return ARTICLES.map(({ slug }) => ({ slug })) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return { title: 'Story not found — Vesna' }
  return { title: `${article.title} — Vesna Journal`, description: article.excerpt, alternates: { canonical: `/journal/${article.slug}` } }
}

export default async function JournalStoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  return <main className="bg-paper text-ink">
    <ScrollProgress />
    <article>
      <header className="mx-auto max-w-4xl px-5 pb-10 pt-12 sm:px-8 sm:pt-16">
        <Link href="/journal" className="mb-10 inline-flex font-button-label text-xs uppercase tracking-wider text-primary-ink focus-ring">← All journal stories</Link>
        <p className="mb-4 font-section-header text-ink-muted">{article.categoryLabel} <span aria-hidden="true">·</span> {article.readTime}</p>
        <h1 className="font-display-hero text-4xl leading-tight sm:text-5xl lg:text-6xl">{article.title}</h1>
        <p className="mt-5 max-w-3xl font-body-main text-lg leading-relaxed text-ink-muted">{article.excerpt}</p>
      </header>
      <div className="relative mx-auto aspect-[16/9] max-w-6xl overflow-hidden bg-paper-raised"><Image src={article.image} alt="" fill priority sizes="(max-width: 1200px) 100vw, 1200px" className="object-cover" /></div>
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        {article.sections.map((section) => <section key={section.heading} className="mb-10 last:mb-0">
          <h2 className="mb-4 font-display-hero text-2xl sm:text-3xl">{section.heading}</h2>
          <div className="space-y-4 font-body-main text-base leading-8 text-ink-muted sm:text-lg">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </section>)}
      </div>
    </article>
    <aside className="border-t border-ink/10 bg-paper-raised px-5 py-12 text-center sm:px-8">
      <p className="font-section-header text-ink-muted">Continue exploring</p><h2 className="mt-2 font-display-hero text-3xl">Find something worth keeping.</h2>
      <div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/picks" className="bg-ink px-6 py-3 font-button-label text-xs uppercase tracking-wider text-paper transition-colors hover:bg-primary-ink focus-ring">Explore the picks</Link><Link href="/journal" className="border border-ink/25 px-6 py-3 font-button-label text-xs uppercase tracking-wider text-ink hover:border-ink focus-ring">More stories</Link></div>
    </aside>
  </main>
}
