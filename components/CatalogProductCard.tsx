import Link from 'next/link'
import type { ProductRow } from '@/lib/data'
import { effectivePricing, formatPrice } from '@/lib/pricing'
import CatalogImage from './CatalogImage'
import VenusTriggerPill from './VenusTriggerPill'

export default function CatalogProductCard({ product }: { product: ProductRow }) {
  const { price, strike } = effectivePricing(product)
  return (
    <article className="group flex h-full flex-col border border-ink/10 bg-paper-raised text-ink transition-colors hover:border-primary-ink/45">
      <Link href={`/shop/${product.slug}`} className="group flex flex-col flex-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
        <div className="relative aspect-[4/3] overflow-hidden bg-paper">
          <CatalogImage src={product.image_urls?.[0]} alt={product.name} sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
          {product.is_featured && <span className="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1 font-button-label text-xs">Featured</span>}
        </div>
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <p className="mb-2 font-section-header text-ink-muted">{product.categories?.name ?? 'Collection'}</p>
          <h2 className="mb-2 font-display-hero text-2xl">{product.name}</h2>
          <p className="mb-4 text-primary-ink">
            {strike != null && <span className="mr-2 text-sm text-ink-muted line-through">{formatPrice(strike)}</span>}
            {price == null ? 'Price not listed' : formatPrice(price)}
          </p>
          {(product.why_victory || product.description) && <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-ink-muted">{product.why_victory ?? product.description}</p>}
          <span className="mt-auto text-sm text-primary-ink underline underline-offset-4">View the pick →</span>
        </div>
      </Link>
      <div className="px-5 pb-4 sm:px-6"><VenusTriggerPill productName={product.name} productSlug={product.slug} className="text-ink-muted hover:text-primary-ink" /></div>
    </article>
  )
}
