'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { ProductRow } from '@/lib/data'
import { effectivePricing } from '@/lib/pricing'
import CatalogProductCard from '@/components/CatalogProductCard'

const ITEMS_PER_LOAD = 12
const keyFor = (name: string) => name.trim().toLowerCase()

export default function PicksBrowser({ products }: { products: ProductRow[] }) {
  const params = useSearchParams()
  const currentCategory = params.get('category') ?? 'all'
  const query = params.get('q') ?? ''
  const maxPrice = params.get('maxPrice') ?? ''
  const sort = params.get('sort') ?? 'recent'
  const pageKey = params.toString()
  const [pagination, setPagination] = useState({ key: pageKey, count: ITEMS_PER_LOAD })
  const displayedCount = pagination.key === pageKey ? pagination.count : ITEMS_PER_LOAD
  const categories = useMemo(() => [...new Set(products.map(product => product.categories?.name).filter((name): name is string => !!name))].sort(), [products])
  const filteredProducts = useMemo(() => {
    const budget = maxPrice !== '' && Number.isFinite(Number(maxPrice)) && Number(maxPrice) >= 0 ? Number(maxPrice) : null
    const search = query.trim().toLowerCase()
    const selected = products.filter(product => {
      const categoryMatches = currentCategory === 'all' || keyFor(product.categories?.name ?? '') === currentCategory
      const textMatches = [product.name, product.description, product.why_victory, product.categories?.name].some(text => text?.toLowerCase().includes(search))
      const price = effectivePricing(product).price
      return categoryMatches && textMatches && (budget == null || (price != null && price <= budget))
    })
    if (sort === 'price-low' || sort === 'price-high') selected.sort((a, b) => {
      const left = effectivePricing(a).price
      const right = effectivePricing(b).price
      if (left == null) return right == null ? 0 : 1
      if (right == null) return -1
      return sort === 'price-low' ? left - right : right - left
    })
    return selected
  }, [products, currentCategory, query, maxPrice, sort])

  function changeFilter(name: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (!value || value === 'all' || value === 'recent') next.delete(name)
    else next.set(name, value)
    // Next integrates the native history API with useSearchParams. Filter changes
    // need no server round-trip and are still shareable and reload-safe.
    const suffix = next.toString()
    window.history.pushState(null, '', `/picks${suffix ? `?${suffix}` : ''}`)
  }

  const fieldClass = 'w-full bg-surface-container border border-outline-variant px-4 py-3 text-on-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary'
  return (
    <main className="max-w-7xl mx-auto px-5 sm:px-8 pt-32 pb-24">
      <header className="max-w-3xl mb-10">
        <p className="font-section-header text-secondary mb-4">The collection</p>
        <h1 className="font-display-hero text-4xl sm:text-5xl lg:text-6xl mb-5">Victory&apos;s picks</h1>
        <p className="font-body-main text-on-surface-variant text-lg">Objects, tools, and experiences selected with intention.</p>
      </header>
      {products.some(product => product.id.startsWith('fallback-')) && <p className="border border-outline-variant p-4 mb-6 text-sm text-on-surface-variant">Preview collection. Prices and seller availability have not been verified.</p>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] gap-4 mb-6">
        <label className="text-sm space-y-2"><span className="block">Search picks</span><input type="search" value={query} onChange={event => changeFilter('q', event.target.value)} placeholder="A product, material, or idea…" className={fieldClass} /></label>
        <label className="text-sm space-y-2"><span className="block">Maximum price (USD)</span><input type="number" min="0" step="any" value={maxPrice} onChange={event => changeFilter('maxPrice', event.target.value)} placeholder="Any budget" className={fieldClass} /></label>
        <label className="text-sm space-y-2"><span className="block">Sort picks</span><select value={sort} onChange={event => changeFilter('sort', event.target.value)} className={fieldClass}><option value="recent">Recently added</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label>
      </div>
      <div className="flex flex-wrap gap-2 mb-8" aria-label="Product categories">
        {[{ key: 'all', name: 'All' }, ...categories.map(name => ({ key: keyFor(name), name }))].map(category => (
          <button key={category.key} aria-pressed={currentCategory === category.key} onClick={() => changeFilter('category', category.key)}
            className={`px-4 py-2 border text-sm capitalize focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${currentCategory === category.key ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant hover:border-primary'}`}>{category.name.charAt(0).toUpperCase() + category.name.slice(1)}</button>
        ))}
      </div>
      <p role="status" className="text-outline text-sm mb-6">Showing {Math.min(displayedCount, filteredProducts.length)} of {filteredProducts.length} picks</p>
      {filteredProducts.length ? <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.slice(0, displayedCount).map(product => <CatalogProductCard key={product.id} product={product} />)}
      </div> : <div className="py-16 text-center border border-outline-variant"><h2 className="font-spectral text-2xl mb-3">No picks match these filters</h2><p className="text-on-surface-variant mb-5">Try a broader search or a different budget.</p><button className="text-primary underline underline-offset-4" onClick={() => window.history.pushState(null, '', '/picks')}>Clear filters</button></div>}
      {displayedCount < filteredProducts.length && <div className="text-center mt-12"><button onClick={() => setPagination({ key: pageKey, count: displayedCount + ITEMS_PER_LOAD })} className="border border-primary text-primary px-8 py-4 hover:bg-primary hover:text-on-primary">Show more picks</button></div>}
    </main>
  )
}
