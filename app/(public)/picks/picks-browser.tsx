'use client'

import { useMemo, useState, useSyncExternalStore } from 'react'
import { useSearchParams } from 'next/navigation'
import { Bookmark, Grid2X2, LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react'
import { useVenus } from '@/components/VenusProvider'
import Link from 'next/link'
import { useShortlist } from '@/lib/shortlist'
import { COLLECTIONS, inCollection } from '@/lib/catalog-collections'
import type { ProductRow } from '@/lib/data'
import { effectivePricing } from '@/lib/pricing'
import CatalogProductCard, { type CatalogLayout } from '@/components/CatalogProductCard'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const LAYOUT_KEY = 'vesna:picks-layout'
const LAYOUT_EVENT = 'vesna:picks-layout-change'
const LAYOUTS = [
  { value: 'gallery', label: 'Gallery', icon: LayoutGrid },
  { value: 'compact', label: 'Compact grid', icon: Grid2X2 },
  { value: 'list', label: 'List', icon: List },
] as const
function readLayout(): CatalogLayout {
  try {
    const value = window.localStorage.getItem(LAYOUT_KEY)
    return value === 'compact' || value === 'list' ? value : 'gallery'
  } catch { return 'gallery' }
}
function subscribeLayout(listener: () => void) {
  window.addEventListener('storage', listener)
  window.addEventListener(LAYOUT_EVENT, listener)
  return () => {
    window.removeEventListener('storage', listener)
    window.removeEventListener(LAYOUT_EVENT, listener)
  }
}
const serverLayout = (): CatalogLayout => 'gallery'
const ITEMS_PER_LOAD = 12
const keyFor = (name: string) => name.trim().toLowerCase()

type FilterControlsProps = {
  categories: string[]
  currentCategory: string
  query: string
  maxPrice: string
  sort: string
  fieldClass: string
  prefix: string
  showCategories: boolean
  changeFilter: (name: string, value: string) => void
}

function FilterControls({ categories, currentCategory, query, maxPrice, sort, fieldClass, prefix, showCategories, changeFilter }: FilterControlsProps) {
  return (
    <>
      <label htmlFor={`${prefix}-search`} className="space-y-2 text-sm">
        <span className="block">Search picks</span>
        <input id={`${prefix}-search`} type="search" value={query} onChange={event => changeFilter('q', event.target.value)} placeholder="A product, material, or idea…" className={fieldClass} />
      </label>
      <label htmlFor={`${prefix}-price`} className="space-y-2 text-sm">
        <span className="block">Maximum price (USD)</span>
        <input id={`${prefix}-price`} type="number" min="0" step="any" value={maxPrice} onChange={event => changeFilter('maxPrice', event.target.value)} placeholder="Any budget" className={fieldClass} />
      </label>
      <label htmlFor={`${prefix}-sort`} className="space-y-2 text-sm">
        <span className="block">Sort picks</span>
        <select id={`${prefix}-sort`} value={sort} onChange={event => changeFilter('sort', event.target.value)} className={fieldClass}>
          <option value="recent">Recently added</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
        </select>
      </label>
      {showCategories && <fieldset className="sm:col-span-2 lg:col-span-3">
        <legend className="mb-2 text-sm">Category</legend>
        <div className="flex flex-wrap gap-2">
          {[{ key: 'all', name: 'All' }, ...categories.map(name => ({ key: keyFor(name), name }))].map(category => (
            <button
              key={category.key}
              type="button"
              aria-pressed={currentCategory === category.key}
              onClick={() => changeFilter('category', category.key)}
              className={`min-h-10 border px-3 py-2 text-sm capitalize transition-colors focus-ring ${currentCategory === category.key ? 'border-primary bg-primary text-on-primary' : 'border-ink/25 text-ink hover:border-primary-ink'}`}
            >
              {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
            </button>
          ))}
        </div>
      </fieldset>}
    </>
  )
}

export default function PicksBrowser({ products, shortlistMode = false }: { products: ProductRow[]; shortlistMode?: boolean }) {
  const params = useSearchParams()
  const storedLayout = useSyncExternalStore(subscribeLayout, readLayout, serverLayout)
  const [selectedLayout, setSelectedLayout] = useState<CatalogLayout | null>(null)
  const layout = selectedLayout ?? storedLayout
  function chooseLayout(value: CatalogLayout) {
    setSelectedLayout(value)
    try {
      window.localStorage.setItem(LAYOUT_KEY, value)
      window.dispatchEvent(new Event(LAYOUT_EVENT))
    } catch { /* The selected layout still works when storage is unavailable. */ }
  }
  const currentCategory = params.get('category') ?? 'all'
  const query = params.get('q') ?? ''
  const maxPrice = params.get('maxPrice') ?? ''
  const sort = params.get('sort') ?? 'recent'
  const savedOnly = shortlistMode || params.get('saved') === '1'
  const collection = params.get('collection') ?? ''
  const { ids: savedIds, clear, undo, canUndo } = useShortlist()
  const { openChat } = useVenus()
  const [clearOpen, setClearOpen] = useState(false)
  const [shortlistError, setShortlistError] = useState('')
  const [comparison, setComparison] = useState<string[]>([])
  const compared = products.filter(product => savedIds.includes(product.id) && comparison.includes(product.id))
  function toggleCompare(id: string) {
    if (!comparison.includes(id) && compared.length >= 3) { setShortlistError('Choose up to three picks to compare.'); return }
    setShortlistError('')
    setComparison(current => current.includes(id) ? current.filter(item => item !== id) : [...current.filter(item => savedIds.includes(item)), id])
  }
  const savedCount = products.filter(product => savedIds.includes(product.id)).length
  const pageKey = params.toString()
  const [pagination, setPagination] = useState({ key: pageKey, count: ITEMS_PER_LOAD })
  const [filterOpen, setFilterOpen] = useState(false)
  const displayedCount = pagination.key === pageKey ? pagination.count : ITEMS_PER_LOAD
  const categories = useMemo(() => [...new Set(products.map(product => product.categories?.name).filter((name): name is string => !!name))].sort(), [products])

  const filteredProducts = useMemo(() => {
    const budget = maxPrice !== '' && Number.isFinite(Number(maxPrice)) && Number(maxPrice) >= 0 ? Number(maxPrice) : null
    const search = query.trim().toLowerCase()
    const selected = products.filter(product => {
      const categoryMatches = currentCategory === 'all' || keyFor(product.categories?.name ?? '') === currentCategory
      const textMatches = [product.name, product.description, product.why_victory, product.categories?.name].some(text => text?.toLowerCase().includes(search))
      const price = effectivePricing(product).price
      return inCollection(product, collection) && (!savedOnly || savedIds.includes(product.id)) && categoryMatches && textMatches && (budget == null || (price != null && price <= budget))
    })
    if (sort === 'price-low' || sort === 'price-high') selected.sort((a, b) => {
      const left = effectivePricing(a).price
      const right = effectivePricing(b).price
      if (left == null) return right == null ? 0 : 1
      if (right == null) return -1
      return sort === 'price-low' ? left - right : right - left
    })
    return selected
  }, [products, currentCategory, query, maxPrice, sort, savedOnly, savedIds, collection])

  function changeFilter(name: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (name === 'collection') next.delete('category')
    if (!value || value === 'all' || value === 'recent') next.delete(name)
    else next.set(name, value)
    const suffix = next.toString()
    window.history.pushState(null, '', `${shortlistMode ? '/shortlist' : '/picks'}${suffix ? `?${suffix}` : ''}`)
  }

  function clearFilters() {
    const next = new URLSearchParams(params.toString())
    for (const name of ['q', 'category', 'maxPrice', 'sort', 'collection']) next.delete(name)
    const suffix = next.toString()
    window.history.pushState(null, '', `${shortlistMode ? '/shortlist' : '/picks'}${suffix ? `?${suffix}` : ''}`)
  }

  const activeFilters = [
    ...(collection ? [{ key: 'collection', label: COLLECTIONS.find(item => item.slug === collection)?.title ?? collection }] : []),
    ...(query.trim() ? [{ key: 'q', label: `Search: ${query.trim()}` }] : []),
    ...(currentCategory !== 'all' ? [{ key: 'category', label: categories.find(name => keyFor(name) === currentCategory) ?? currentCategory }] : []),
    ...(maxPrice ? [{ key: 'maxPrice', label: `Under $${maxPrice}` }] : []),
    ...(sort !== 'recent' ? [{ key: 'sort', label: sort === 'price-low' ? 'Price: low to high' : 'Price: high to low' }] : []),
  ]
  const fieldClass = 'w-full bg-paper-raised border border-ink/25 px-4 py-3 text-ink placeholder:text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-ink'
  const controls = { categories, currentCategory, query, maxPrice, sort, fieldClass, changeFilter }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-8 sm:pt-12">
        <header className="mb-8 max-w-3xl sm:mb-10">
          <p className="font-section-header mb-3 text-ink-muted">{shortlistMode ? 'Your collection' : 'The collection'}</p>
          <h1 className="mb-4 break-words font-display-hero text-[clamp(2.25rem,7.5vw,3.75rem)] leading-tight">{shortlistMode ? 'Your shortlist' : <>Victory&apos;s picks</>}</h1>
          <p className="max-w-2xl font-body-main text-base leading-relaxed text-ink-muted sm:text-lg">{shortlistMode ? 'A place for the picks you’re considering. Compare your favourites and return when you’re ready.' : 'Objects, tools, and experiences selected with intention.'}</p>
        </header>
        {!shortlistMode && <section aria-label="Collections by purpose" className="-mx-4 mb-8 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
          {COLLECTIONS.map(item => {
            const count = products.filter(product => inCollection(product, item.slug)).length
            return count > 0 && <button key={item.slug} type="button" aria-pressed={collection === item.slug} onClick={() => changeFilter('collection', collection === item.slug ? '' : item.slug)} className={`group w-64 shrink-0 snap-start border p-5 text-left sm:w-auto sm:min-w-0 transition-colors focus-ring ${collection === item.slug ? 'border-primary-ink bg-green-wash' : 'border-ink/15 bg-paper-raised hover:border-primary-ink/50'}`}>
              <span className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-ink">{count} {count === 1 ? 'pick' : 'picks'}</span>
              <span className="block font-display-hero text-2xl leading-tight text-ink">{item.title}</span>
              <span className="mt-2 block text-sm leading-relaxed text-ink-muted">{item.description}</span>
            </button>
          })}
        </section>}
        {shortlistMode && <div className="mb-6 space-y-3"><div className="flex flex-wrap items-center gap-3"><Link href="/picks" className="inline-flex min-h-11 items-center border border-ink/25 px-4 text-sm font-medium text-primary-ink focus-ring">Explore more picks</Link><button type="button" disabled={compared.length < 2} onClick={() => openChat(`Compare these saved picks using their catalog details: ${compared.map(p => p.name).join('; ')}. Explain the differences, who each suits, and any unknowns.`)} className="min-h-11 bg-primary-ink px-4 text-sm font-medium text-paper focus-ring disabled:opacity-40">Compare selected ({compared.length}/3)</button>{canUndo && <button type="button" onClick={() => setShortlistError(undo() ? '' : 'Could not restore the picks. Check browser storage.')} className="min-h-11 px-3 text-sm text-primary-ink underline focus-ring">Undo removal</button>}<Dialog open={clearOpen} onOpenChange={setClearOpen}><DialogTrigger asChild><button type="button" disabled={!savedIds.length} className="min-h-11 px-3 text-sm text-ink-muted underline focus-ring disabled:opacity-40">Clear shortlist</button></DialogTrigger><DialogContent className="bg-paper-raised text-ink"><DialogHeader><DialogTitle>Clear your shortlist?</DialogTitle><DialogDescription>All saved picks in this browser will be removed. You can undo this afterwards.</DialogDescription></DialogHeader><div className="flex flex-wrap gap-3"><button type="button" onClick={() => { if (clear()) setClearOpen(false); else setShortlistError('Could not clear the shortlist. Check browser storage.') }} className="min-h-11 bg-primary-ink px-4 text-paper focus-ring">Clear all saved picks</button><DialogClose asChild><button type="button" className="min-h-11 border border-ink/25 px-4 focus-ring">Keep my picks</button></DialogClose></div></DialogContent></Dialog></div><p className="text-xs text-ink-muted">Saved in this browser. Select two or three picks for Venus to compare.</p>{savedIds.length > savedCount && <p className="text-sm text-ink-muted">{savedIds.length - savedCount} saved pick(s) are no longer available in the current collection.</p>}{shortlistError && <p role="status" className="text-sm text-ink">{shortlistError}</p>}</div>}
        {products.some(product => product.id.startsWith('fallback-')) && <p className="mb-6 border border-ink/20 bg-paper-raised p-4 text-sm text-ink-muted">Preview collection. Prices and seller availability have not been verified.</p>}
        {!shortlistMode && <div className="mb-6 flex flex-wrap items-center gap-3">
          <button type="button" aria-pressed={savedOnly} onClick={() => changeFilter('saved', savedOnly ? '' : '1')} className={`inline-flex min-h-11 items-center gap-2 border px-4 py-2 text-sm font-medium focus-ring ${savedOnly ? 'border-primary-ink bg-primary-ink text-paper' : 'border-ink/25 text-primary-ink hover:border-primary-ink'}`}><Bookmark size={16} aria-hidden="true" />{savedOnly ? 'Showing your shortlist' : 'Your shortlist'} ({savedCount})</button>
          <p className="text-xs text-ink-muted">Saved in this browser. No account needed.</p>
        </div>}

        <div className="hidden min-w-0 grid-cols-1 gap-4 border-y border-ink/15 py-5 sm:grid sm:grid-cols-2 lg:grid-cols-3">
          <FilterControls {...controls} prefix="desktop" showCategories={false} />
        </div>

        <div className="sticky top-16 z-30 -mx-4 mb-4 flex min-h-14 items-center justify-between gap-3 border-y border-ink/15 bg-paper/95 px-4 py-2 backdrop-blur sm:static sm:mx-0 sm:mb-3 sm:border-0 sm:bg-transparent sm:px-0 sm:py-3 sm:backdrop-blur-none">
          <p role="status" aria-live="polite" className="text-sm text-ink-muted">
            Showing <span className="font-semibold text-ink">{Math.min(displayedCount, filteredProducts.length)}</span> of <span className="font-semibold text-ink">{filteredProducts.length}</span> picks
          </p>
          <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
            <DialogTrigger asChild>
              <button type="button" className="inline-flex min-h-10 items-center gap-2 border border-ink/25 bg-paper-raised px-3 text-sm text-ink focus-ring sm:hidden">
                <SlidersHorizontal aria-hidden="true" size={16} /> Filters{activeFilters.length > 0 && <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-on-primary">{activeFilters.length}</span>}
              </button>
            </DialogTrigger>
            <DialogContent className="!bottom-0 !left-0 !top-auto !w-full !max-w-none !translate-x-0 !translate-y-0 grid gap-0 rounded-t-2xl border-0 bg-paper-raised p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-ink shadow-[0_-12px_40px_rgba(0,0,0,.2)] sm:hidden">
              <DialogHeader className="mb-5 pr-8 text-left">
                <DialogTitle className="font-display-hero text-2xl">Filter the picks</DialogTitle>
                <DialogDescription className="text-ink-muted">Adjust the collection to what you&apos;re looking for.</DialogDescription>
              </DialogHeader>
              <div className="grid max-h-[60svh] grid-cols-1 gap-5 overflow-y-auto pb-5">
                <FilterControls {...controls} prefix="mobile" showCategories />
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-ink/15 pt-4">
                <button type="button" onClick={clearFilters} className="text-sm text-ink-muted underline underline-offset-4 focus-ring">Clear all</button>
                <DialogClose asChild>
                  <button type="button" className="min-h-11 bg-primary px-5 text-sm text-on-primary focus-ring">Show {filteredProducts.length} picks</button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-medium text-ink-muted">Browse your way</span>
          <div role="group" aria-label="Browsing layout" className="inline-flex border border-ink/20 bg-paper-raised p-1">
            {LAYOUTS.map(({value, label, icon: LayoutIcon}) => <button key={value} type="button" aria-pressed={layout === value} onClick={() => chooseLayout(value)} className={`inline-flex min-h-10 items-center gap-2 px-3 text-xs font-semibold transition-colors focus-ring ${layout === value ? 'bg-primary-ink text-paper' : 'text-ink-muted hover:bg-green-wash hover:text-primary-ink'}`}><LayoutIcon size={16} aria-hidden="true" />{label}</button>)}
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="mb-7 flex flex-wrap items-center gap-2" aria-label="Active filters">
            {activeFilters.map(filter => (
              <button key={filter.key} type="button" onClick={() => changeFilter(filter.key, '')} className="inline-flex min-h-9 items-center gap-2 border border-ink/20 bg-paper-raised px-3 text-sm text-ink hover:border-primary-ink focus-ring">
                {filter.label}<X size={14} aria-hidden="true" className="text-ink-muted" /><span className="sr-only">Remove {filter.label} filter</span>
              </button>
            ))}
            <button type="button" onClick={clearFilters} className="min-h-9 px-2 text-sm text-ink-muted underline underline-offset-4 hover:text-primary-ink focus-ring">Clear all</button>
          </div>
        )}

        <div className="mb-7 hidden flex-wrap gap-2 sm:flex" aria-label="Product categories">
          {[{ key: 'all', name: 'All' }, ...categories.map(name => ({ key: keyFor(name), name }))].map(category => (
            <button key={category.key} aria-pressed={currentCategory === category.key} onClick={() => changeFilter('category', category.key)}
              className={`min-h-10 border px-4 py-2 text-sm capitalize transition-colors focus-ring ${currentCategory === category.key ? 'border-primary bg-primary text-on-primary' : 'border-ink/25 text-ink hover:border-primary-ink'}`}>{category.name.charAt(0).toUpperCase() + category.name.slice(1)}</button>
          ))}
        </div>

        {filteredProducts.length ? <div className={layout === 'list' ? 'grid min-w-0 grid-cols-1 gap-3' : layout === 'compact' ? 'grid min-w-0 grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4' : 'grid min-w-0 grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3'}>
          {filteredProducts.slice(0, displayedCount).map(product => <CatalogProductCard key={product.id} product={product} layout={layout} compareSelected={comparison.includes(product.id)} onCompareToggle={shortlistMode ? () => toggleCompare(product.id) : undefined} />)}
        </div> : <div className="border-y border-ink/15 py-16 text-center"><h2 className="font-display-hero mb-3 text-2xl">{savedOnly && savedCount === 0 ? 'Your shortlist is waiting' : 'No picks match these filters'}</h2><p className="mb-5 text-ink-muted">{savedOnly && savedCount === 0 ? 'Save a pick to keep it here while you consider your options.' : 'Try a broader search or a different budget.'}</p><button className="text-primary-ink underline underline-offset-4 focus-ring" onClick={() => savedOnly && savedCount === 0 ? window.history.pushState(null, '', '/picks') : clearFilters()}>{savedOnly && savedCount === 0 ? 'Browse all picks' : 'Clear filters'}</button></div>}
        {displayedCount < filteredProducts.length && <div className="mt-12 text-center"><button onClick={() => setPagination({ key: pageKey, count: displayedCount + ITEMS_PER_LOAD })} className="min-h-12 border border-primary-ink px-8 py-3 text-primary-ink transition-colors hover:bg-primary hover:text-on-primary focus-ring">Show more picks</button></div>}
      </div>
    </main>
  )
}
