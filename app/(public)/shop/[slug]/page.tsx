import type { Metadata } from 'next'
import ProductGallery from '@/components/ProductGallery'
import ShortlistButton from '@/components/ShortlistButton'
import VenusTriggerPill from '@/components/VenusTriggerPill'
import { sellerDetails } from '@/lib/affiliate'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductBySlug, getProductSlugs } from '@/lib/data'
import { formatPrice, effectivePricing } from '@/lib/pricing'
import { SELECTION_BASES, specificationRows, type SelectionBasis } from '@/lib/product-editorial'

/** ISR: catalog refreshes every 5 min; admin edits land within one revalidation cycle. */
export const revalidate = 300


// Pre-render known product pages at build; new/renamed slugs render on demand + cache.
export async function generateStaticParams() {
  const slugs = await getProductSlugs()
  return slugs.map((slug) => ({ slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Product Not Found — Vesna' }

  return {
    title: `${product.name} — Vesna Picks`,
    description: product.why_victory ?? product.description ?? `Victory's pick: ${product.name}`,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.why_victory ?? undefined,
      images: product.image_urls?.[0] ? [{ url: product.image_urls[0] }] : undefined,
      type: 'website',
    },
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const { price, strike } = effectivePricing(product)
  const category = product.categories?.name ?? 'Collection'
  const specs = specificationRows(product.specifications)
  const basis = product.selection_basis && product.selection_basis !== 'not_recorded'
    ? SELECTION_BASES[product.selection_basis as SelectionBasis] : null
  const seller = product.item_type !== 'archive' ? sellerDetails(product.affiliate_link) : null

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-screen-xl px-5 pb-16 pt-4 sm:px-8 sm:pb-20 sm:pt-6 lg:px-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 font-button-label text-xs uppercase tracking-wider text-ink-muted">
          <Link href="/picks" className="transition-colors hover:text-primary-ink focus-ring">Picks</Link>
          <span>/</span>
          <span className="text-ink">{category}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
          <ProductGallery images={product.image_urls} name={product.name} featured={product.is_featured} />

          {/* Details */}
          <div className="flex flex-col justify-center">
            <span className="mb-3 font-section-header text-ink-muted">{category}</span>
            <h1 className="mb-4 break-words font-display-hero text-[clamp(1.875rem,6vw,3rem)] leading-tight">{product.name}</h1>

            <div className="mb-6 flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-2">
              <span className="font-button-label text-xl text-ink">{price == null ? 'Price not listed' : formatPrice(price)}</span>
              {strike != null && (
                <span className="font-body-main text-sm text-ink-muted line-through">{formatPrice(strike)}</span>
              )}
            </div>

            {product.why_victory && <section className="mb-6 border-t border-ink/15 pt-6">
              <h2 className="mb-3 font-display-hero text-2xl">Why this pick</h2>
              <p className="font-body-main leading-relaxed text-ink-muted">{product.why_victory}</p>
            </section>}
            {product.description && product.description !== product.why_victory && <section className="mb-6">
              <h2 className="mb-3 font-display-hero text-2xl">About this pick</h2>
              <p className="whitespace-pre-line font-body-main leading-relaxed text-ink-muted">{product.description}</p>
            </section>}
            <div className="mb-8"><VenusTriggerPill productName={product.name} productSlug={product.slug} /></div>
            <div className="mb-6"><ShortlistButton id={product.id} name={product.name} /></div>
            {(product.best_for || product.considerations || specs.length > 0 || basis) && <section className="mb-8 space-y-5 border-y border-ink/15 py-6">
              {basis && <p className="text-xs font-medium uppercase tracking-wider text-primary-ink">{basis}</p>}
              {product.best_for && <div><h2 className="mb-2 font-display-hero text-2xl">A good fit for</h2><p className="whitespace-pre-line text-sm leading-relaxed text-ink">{product.best_for}</p></div>}
              {product.considerations && <div><h2 className="mb-2 font-display-hero text-2xl">Before you choose</h2><p className="whitespace-pre-line text-sm leading-relaxed text-ink">{product.considerations}</p></div>}
              {specs.length > 0 && <div><h2 className="mb-3 font-display-hero text-2xl">The details</h2><dl className="divide-y divide-ink/10">{specs.map((spec, index) => <div key={index} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-4 py-3 text-sm"><dt className="break-words text-ink-muted">{spec.label}</dt><dd className="break-words text-ink">{spec.value}</dd></div>)}</dl></div>}
            </section>}
            {seller ? <>
              <a href={`/api/track-click?productId=${encodeURIComponent(product.id)}`} rel="sponsored noopener noreferrer" target="_blank"
                className="block w-full bg-ink py-4 text-center font-button-label text-xs uppercase tracking-wider text-paper transition-colors hover:bg-primary-ink focus-ring">
                Visit seller — {seller.name}
              </a>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">Confirm the current price, availability, and purchase terms with the seller. Vesna may earn a commission from qualifying purchases.</p>
            </> : <div className="border border-ink/15 bg-paper-raised p-5">
              <p className="mb-2 font-display-hero text-xl">{product.item_type === 'archive' ? 'An archive piece' : 'Seller link unavailable'}</p>
              <p className="mb-4 text-sm leading-relaxed text-ink-muted">{product.item_type === 'archive' ? 'This piece is part of the archive and is not offered for sale here.' : 'A seller link has not been added for this pick yet.'}</p>
              <Link href="/picks" className="text-sm text-primary-ink underline underline-offset-4">Explore other picks</Link>
            </div>}
          </div>
        </div>
      </div>
    </main>
  )
}
