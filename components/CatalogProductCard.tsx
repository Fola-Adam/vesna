import Link from 'next/link'
import type { ProductRow } from '@/lib/data'
import { effectivePricing, formatPrice } from '@/lib/pricing'
import CatalogImage from './CatalogImage'
import ShortlistButton from './ShortlistButton'

export type CatalogLayout = 'gallery' | 'compact' | 'list'

export default function CatalogProductCard({ product, layout = 'gallery', compareSelected, onCompareToggle }: { product: ProductRow; layout?: CatalogLayout; compareSelected?: boolean; onCompareToggle?: () => void }) {
  const { price, strike } = effectivePricing(product)
  const list = layout === 'list'
  const compact = layout === 'compact'
  const note = product.why_victory || product.description

  return (
    <article className={`group relative min-w-0 border border-ink/15 bg-paper-raised text-ink transition-colors duration-200 hover:border-primary-ink/40 motion-reduce:transition-none ${list ? 'grid grid-cols-[100px_minmax(0,1fr)] gap-3 p-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6 sm:p-4' : 'flex h-full flex-col'}`}>
      <Link href={`/shop/${product.slug}`} aria-label={`View ${product.name}`} className={`relative block overflow-hidden bg-paper focus-ring ${list ? 'aspect-square self-start' : compact ? 'aspect-square' : 'aspect-[4/3]'}`}>
        <CatalogImage src={product.image_urls?.[0]} alt={product.name} className={`object-contain transition-transform duration-300 group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none ${compact || list ? 'p-3' : 'p-5'}`} sizes={list ? '(max-width: 640px) 100px, 160px' : compact ? '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw' : '(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw'} />
        {product.is_featured && !compact && !list && <span className="absolute bottom-3 left-3 bg-ink px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-paper">Featured pick</span>}
      </Link>
      <div className={`min-w-0 ${list ? 'py-1 pr-11 sm:py-3' : compact ? 'p-3 sm:p-4' : 'p-4 sm:p-5'}`}>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">{product.categories?.name ?? 'Selected object'}</p>
        <h2 className={`break-words font-semibold leading-snug text-ink ${compact ? 'text-sm sm:text-base' : 'font-display-hero text-base sm:text-xl'}`}><Link href={`/shop/${product.slug}`} className="transition-colors hover:text-primary-ink focus-ring">{product.name}</Link></h2>
        <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm font-semibold text-ink">
          {price == null ? 'Price not listed' : formatPrice(price)}
          {strike != null && <span className="text-xs font-normal text-ink-muted line-through">{formatPrice(strike)}</span>}
        </p>
        {note && !compact && <p className={`mt-3 text-sm leading-relaxed text-ink-muted ${list ? 'hidden line-clamp-2 sm:block' : 'line-clamp-2'}`}>{note}</p>}
      </div>
      {onCompareToggle && <label className={`flex min-h-11 cursor-pointer items-center gap-2 border-t border-ink/10 px-4 text-xs font-medium text-primary-ink ${list ? 'col-span-2' : ''}`}><input type="checkbox" checked={!!compareSelected} onChange={onCompareToggle} aria-label={`Select ${product.name} for comparison`} className="h-4 w-4 accent-primary-ink" />Compare</label>}
      <div className="absolute right-2 top-2 sm:right-3 sm:top-3"><ShortlistButton id={product.id} name={product.name} compact /></div>
    </article>
  )
}
