import Link from 'next/link'
import type { ProductRow } from '@/lib/data'
import { effectivePricing, formatPrice } from '@/lib/pricing'
import CatalogImage from './CatalogImage'
import VenusTriggerPill from './VenusTriggerPill'

export default function CatalogProductCard({ product }: { product: ProductRow }) {
  const { price, strike } = effectivePricing(product)
  return (
    <article className={`group bg-surface-container-low flex flex-col h-full border ${product.is_featured ? 'border-primary/50' : 'border-outline-variant'}`}>
      <Link href={`/shop/${product.slug}`} className="flex flex-col flex-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
          <CatalogImage src={product.image_urls?.[0]} alt={product.name} sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
          {product.is_featured && <span className="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1 font-button-label text-xs">Featured</span>}
        </div>
        <div className="p-6 flex flex-col flex-1">
          <p className="text-secondary text-xs font-button-label uppercase tracking-wider mb-3">{product.categories?.name ?? 'Collection'}</p>
          <h2 className="font-display-hero text-2xl mb-3">{product.name}</h2>
          <p className="text-primary mb-4">
            {strike != null && <span className="line-through text-outline text-sm mr-2">{formatPrice(strike)}</span>}
            {price == null ? 'Price not listed' : formatPrice(price)}
          </p>
          {(product.why_victory || product.description) && <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-3 mb-6">{product.why_victory ?? product.description}</p>}
          <span className="mt-auto text-primary text-sm underline underline-offset-4">View the pick →</span>
        </div>
      </Link>
      <div className="px-6 pb-6"><VenusTriggerPill productName={product.name} productSlug={product.slug} /></div>
    </article>
  )
}
