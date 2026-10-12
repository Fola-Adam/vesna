import Icon from '@/components/Icon'
import Link from 'next/link'
import type { ProductRow } from '@/lib/data'
import { effectivePricing, formatPrice } from '@/lib/pricing'
import CatalogImage from './CatalogImage'
import VenusTriggerPill from './VenusTriggerPill'
import ShortlistButton from './ShortlistButton'

export default function CatalogProductCard({ product }: { product: ProductRow }) {
  const { price, strike } = effectivePricing(product)

  return (
    <article className="flex h-full flex-col overflow-hidden border border-ink/10 bg-paper-raised text-ink transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-primary-ink/40 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none">
      <Link href={`/shop/${product.slug}`} className="group flex flex-1 flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink">
        <div className="relative aspect-[4/3] overflow-hidden bg-paper">
          <CatalogImage src={product.image_urls?.[0]} alt={product.name} className="object-contain p-5 transition-transform duration-300 group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
          {product.is_featured && <span className="absolute left-3 top-3 bg-ink px-3 py-1.5 font-button-label text-[10px] uppercase tracking-[0.12em] text-paper">Featured pick</span>}
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-6">
          <p className="mb-2 font-section-header font-semibold text-[#514a40]">{product.categories?.name ?? 'Selected object'}</p>
          <h2 className="mb-3 break-words font-display-hero text-xl font-semibold leading-snug text-ink transition-colors group-hover:text-primary-ink sm:text-2xl">{product.name}</h2>
          <p className="mb-4 flex flex-wrap items-baseline gap-x-2 gap-y-1 font-button-label text-sm font-semibold text-ink">
            {price == null ? 'Price not listed' : formatPrice(price)}
            {strike != null && <span className="text-xs text-ink-muted line-through">{formatPrice(strike)}</span>}
          </p>
          {(product.why_victory || product.description) && <p className="mb-5 line-clamp-3 font-body-main text-sm leading-relaxed text-[#514a40]">{product.why_victory ?? product.description}</p>}
          <span className="mt-auto inline-flex items-center gap-2 font-button-label text-xs font-semibold uppercase tracking-wider text-primary-ink">View the pick <Icon name="arrow_forward" className="align-middle" /></span>
        </div>
      </Link>
      <div className="border-t border-ink/10 px-5 py-3 sm:px-6"><VenusTriggerPill productName={product.name} productSlug={product.slug} className="w-full justify-center rounded-sm border border-primary-ink/25 bg-green-wash px-3 py-2.5 font-semibold text-primary-ink transition-colors hover:bg-primary-ink hover:text-paper" /></div>
      <div className="px-5 pb-4 sm:px-6"><ShortlistButton id={product.id} name={product.name} /></div>
    </article>
  )
}
