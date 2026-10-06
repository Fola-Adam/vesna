import type { Metadata } from 'next'
import Image from 'next/image'
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
  const category = product.categories?.name ?? product.item_type

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-12 font-button-label text-[10px] uppercase tracking-widest text-outline">
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-primary">{category}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
            {product.image_urls?.[0] && (
              <Image
                src={product.image_urls[0]}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover grayscale-[10%]"
                priority
              />
            )}
            {product.is_featured && (
              <div className="absolute top-4 left-4 z-10 px-3 py-1 text-[9px] font-button-label uppercase tracking-widest bg-primary text-black">
                Victory&apos;s pick
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <span className="text-primary font-button-label text-[10px] uppercase tracking-widest mb-4">{category}</span>
            <h1 className="font-audiowide text-2xl lg:text-3xl text-on-background mb-4">{product.name}</h1>

            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-spectral text-xl text-primary">{formatPrice(price)}</span>
              {strike != null && (
                <span className="font-spectral text-sm text-outline line-through">{formatPrice(strike)}</span>
              )}
            </div>

            {(product.why_victory || product.description) && (
              <p className="font-playfair text-on-surface-variant text-sm italic leading-relaxed mb-8">
                &ldquo;{product.why_victory ?? product.description}&rdquo;
              </p>
            )}

            {category === 'courses' && (
              <div className="border-t border-outline-variant pt-8 mb-8">
                <h3 className="font-button-label text-[10px] uppercase tracking-widest text-outline mb-4">What&apos;s Included</h3>
                <ul className="space-y-3 font-body-main text-sm text-on-surface-variant">
                  <li className="flex items-center gap-3">
                    <span className="w-1 h-1 bg-primary rounded-full" />
                    Lifetime access with future updates
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1 h-1 bg-primary rounded-full" />
                    Downloadable resources and templates
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1 h-1 bg-primary rounded-full" />
                    Community access
                  </li>
                </ul>
              </div>
            )}

            {product.affiliate_link && !isFallback ? (
              <a
                href={`/api/track-click?productId=${encodeURIComponent(product.id)}&to=${encodeURIComponent(product.affiliate_link)}`}
                target="_blank"
                rel="noopener noreferrer sponsored nofollow"
                className="block w-full py-5 text-center border border-primary text-primary font-button-label uppercase text-xs tracking-[0.2em] hover:bg-primary hover:text-black transition-all duration-300"
              >
                Purchase &mdash; {formatPrice(price)}
              </a>
            ) : (
              <button
                disabled
                title={isFallback ? 'Connect Supabase to enable purchase links' : 'No affiliate link configured yet'}
                className="w-full py-5 border border-outline-variant text-outline font-button-label uppercase text-xs tracking-[0.2em] cursor-not-allowed"
              >
                {price == null ? 'Inquire' : `Purchase — ${formatPrice(price)}`}
              </button>
            )}

            <p className="text-center text-outline/50 text-[10px] font-button-label mt-4 uppercase tracking-wider">
              Secure checkout via affiliate partner
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
