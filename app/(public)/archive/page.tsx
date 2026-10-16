import Icon from '@/components/Icon'
import type { Metadata } from 'next'
import Link from 'next/link'
import CatalogImage from '@/components/CatalogImage'
import { getArchivedProducts } from '@/lib/data'
import ScrollProgress from '@/components/ScrollProgress'

export const revalidate = 300
export const metadata: Metadata = {
  title: 'Archive — Vesna',
  description: 'A record of products that have been retired from the active Vesna collection.',
}

export default async function ArchivePage() {
  const products = await getArchivedProducts()
  return <main className="min-h-[65vh] bg-paper text-ink">
    <ScrollProgress />
    <header className="border-b border-ink/10 px-5 pb-14 pt-8 sm:px-8 sm:pb-20 sm:pt-12 lg:px-20">
      <div className="mx-auto max-w-screen-xl">
        <p className="mb-3 font-section-header text-ink-muted">Past the present collection</p>
        <h1 className="break-words font-display-hero text-[clamp(2.25rem,7.5vw,3.75rem)] leading-tight">The archive</h1>
        <p className="mt-4 max-w-2xl font-body-main leading-relaxed text-ink-muted">Products previously featured by Vesna. Availability and prices may have changed since they were listed.</p>
      </div>
    </header>
    {products.length ? <section className="mx-auto grid min-w-0 max-w-screen-xl gap-4 px-4 py-12 sm:grid-cols-2 sm:gap-6 sm:px-8 lg:grid-cols-3 lg:px-20">
      {products.map((product) => <article key={product.id} className="overflow-hidden border border-ink/10 bg-paper-raised">
        <div className="relative aspect-[4/3] overflow-hidden bg-paper"><CatalogImage src={product.image_urls?.[0]} alt={product.name} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" /></div>
        <div className="p-5"><p className="font-section-header text-ink-muted">{product.categories?.name ?? 'Collection'}</p><h2 className="mt-2 font-display-hero text-xl">{product.name}</h2>{product.description && <p className="mt-3 line-clamp-3 font-body-main text-sm leading-relaxed text-ink-muted">{product.description}</p>}</div>
      </article>)}
    </section> : <section className="px-5 py-16 sm:px-8 lg:px-20"><div className="mx-auto max-w-screen-xl border-l-2 border-primary-ink/50 pl-5"><h2 className="font-display-hero text-2xl">Nothing has been archived yet</h2><p className="mt-2 max-w-xl font-body-main leading-relaxed text-ink-muted">When products are intentionally retired from the collection, they will be listed here. For now, explore the current picks.</p><Link href="/picks" className="mt-5 inline-flex bg-ink px-5 py-3 font-button-label text-xs uppercase tracking-wider text-paper hover:bg-primary-ink focus-ring">Browse current picks <Icon name="arrow_forward" className="ml-2 align-middle" /></Link></div></section>}
  </main>
}
