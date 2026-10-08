import type { Metadata } from 'next'
import CatalogImage from '@/components/CatalogImage'
import VenusTriggerPill from '@/components/VenusTriggerPill'
import { sellerDetails } from '@/lib/affiliate'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductBySlug, getProductSlugs } from '@/lib/data'
import { formatPrice, effectivePricing } from '@/lib/pricing'

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
  const isFallback = product.id.startsWith('fallback-')
  const category = product.categories?.name ?? 'Collection'
  const seller = !isFallback && product.item_type !== 'archive' ? sellerDetails(product.affiliate_link) : null

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-12 font-button-label text-[10px] uppercase tracking-widest text-outline">
          <Link href="/picks" className="hover:text-primary transition-colors">Picks</Link>
          <span>/</span>
          <span className="text-primary">{category}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
            <CatalogImage src={product.image_urls?.[0]} alt={product.name} sizes="(max-width: 1024px) 100vw, 50vw" priority />
            {product.is_featured && (
              <div className="absolute top-4 left-4 z-10 px-3 py-1 text-[9px] font-button-label uppercase tracking-widest bg-primary text-black">
                Victory&apos;s pick
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <span className="text-primary font-button-label text-[10px] uppercase tracking-widest mb-4">{category}</span>
            <h1 className="font-display-hero text-3xl lg:text-4xl text-on-background mb-4">{product.name}</h1>

            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-spectral text-xl text-primary">{price == null ? 'Price not listed' : formatPrice(price)}</span>
              {strike != null && (
                <span className="font-spectral text-sm text-outline line-through">{formatPrice(strike)}</span>
              )}
            </div>

            {isFallback && <p className="text-outline text-sm mb-6">Preview pick. Prices and seller availability have not been verified.</p>}
            {product.why_victory && <section className="border-t border-outline-variant pt-6 mb-6">
              <h2 className="font-spectral text-xl mb-3">Why Victory chose it</h2>
              <p className="text-on-surface-variant font-body-main leading-relaxed">{product.why_victory}</p>
            </section>}
            {product.description && product.description !== product.why_victory && <section className="mb-6">
              <h2 className="font-spectral text-xl mb-3">About this pick</h2>
              <p className="text-on-surface-variant font-body-main leading-relaxed whitespace-pre-line">{product.description}</p>
            </section>}
            <div className="mb-8"><VenusTriggerPill productName={product.name} productSlug={product.slug} /></div>
            {seller ? <>
              <a href={`/api/track-click?productId=${encodeURIComponent(product.id)}`} rel="sponsored noopener noreferrer" target="_blank"
                className="w-full block text-center py-5 bg-primary text-on-primary font-button-label text-xs uppercase tracking-wider hover:bg-primary/90 focus-ring">
                Visit seller — {seller.name}
              </a>
              <p className="text-sm text-outline mt-4 leading-relaxed">Confirm the current price, availability, and purchase terms with the seller. Vesna may earn a commission from qualifying purchases.</p>
            </> : <div className="border border-outline-variant p-5">
              <p className="font-spectral text-xl mb-2">{product.item_type === 'archive' ? 'An archive piece' : 'Seller link unavailable'}</p>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-4">{product.item_type === 'archive' ? 'This piece is part of the archive and is not offered for sale here.' : 'A seller link has not been added for this pick yet.'}</p>
              <Link href="/picks" className="text-primary underline underline-offset-4 text-sm">Explore other picks</Link>
            </div>}
          </div>
        </div>
      </div>
    </main>
  )
}
