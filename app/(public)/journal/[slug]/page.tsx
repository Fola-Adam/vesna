import type { Metadata } from 'next'
import Link from 'next/link'
import JournalStoryContent from '@/components/JournalStoryContent'
import { notFound } from 'next/navigation'
import ScrollProgress from '@/components/ScrollProgress'
import { readPublishedStories } from '@/lib/journal-server'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = (await readPublishedStories()).find(story => story.slug === slug)
  if (!article) return { title: 'Story not found — Vesna' }
  return { title: `${article.title} — Vesna Journal`, description: article.excerpt, alternates: { canonical: `/journal/${article.slug}` } }
}

export default async function JournalStoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = (await readPublishedStories()).find(story => story.slug === slug)
  if (!article) notFound()

  return <main className="bg-paper text-ink">
    <ScrollProgress />
    <Link href="/journal" className="mx-auto block max-w-4xl px-5 pt-8 text-xs text-primary-ink focus-ring">All journal stories</Link>
    <JournalStoryContent article={article} />
    <aside className="border-t border-ink/10 bg-paper-raised px-5 py-12 text-center sm:px-8">
      <p className="font-section-header text-ink-muted">Continue exploring</p><h2 className="mt-2 font-display-hero text-3xl">Find something worth keeping.</h2>
      <div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/picks" className="bg-ink px-6 py-3 font-button-label text-xs uppercase tracking-wider text-paper transition-colors hover:bg-primary-ink focus-ring">Explore the picks</Link><Link href="/journal" className="border border-ink/25 px-6 py-3 font-button-label text-xs uppercase tracking-wider text-ink hover:border-ink focus-ring">More stories</Link></div>
    </aside>
  </main>
}
