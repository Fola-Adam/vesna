import type { ProductRow } from './data'
import { effectivePricing } from './pricing'

export type VenusActivity = { id: string; label: string; state: 'running' | 'complete' | 'failed' }
export type VenusSelection = { label: string; products: { id: string; name: string; slug: string; price: number | null; evidence: string }[] }
const fields = ['name', 'description', 'why_victory', 'best_for', 'specifications'] as const
const normalize = (value: string) => value.normalize('NFKC').replace(/\s+/g, ' ').trim().toLowerCase()

/** A model may select only current records and quote evidence actually recorded for them. */
export function validateSelection(catalog: ProductRow[], value: unknown, message = ''): VenusSelection | null {
  if (!value || typeof value !== 'object') return null
  const input = value as { label?: unknown; products?: unknown }
  if (typeof input.label !== 'string' || !input.label.trim() || input.label.length > 150 || !Array.isArray(input.products) || !input.products.length || input.products.length > 20) return null
  const budget = message.match(/(?:under|below|less than|up to|maximum|max|budget(?: of)?)\s*\$?\s*([\d,]+(?:\.\d+)?)/i)
  const ceiling = budget ? Number(budget[1].replaceAll(',','')) : null
  const products: VenusSelection['products'] = []
  for (const item of input.products) {
    if (!item || typeof item !== 'object' || typeof item.slug !== 'string' || typeof item.evidence !== 'string') return null
    const product = catalog.find(product => product.slug === item.slug && product.item_type !== 'archive')
    const evidence = item.evidence.trim()
    const price = product ? effectivePricing(product).price : null
    if (ceiling !== null && (price === null || price > ceiling)) return null
    if (!product || evidence.length < 12 || evidence.length > 500 || products.some(item => item.id === product.id)) return null
    if (!fields.some(field => typeof product[field] === 'string' && normalize(product[field]!).includes(normalize(evidence)))) return null
    products.push({ id: product.id, name: product.name, slug: product.slug, price, evidence })
  }
  return { label: input.label, products }
}

/** Full bounded catalog, not a fixed activity/category allowlist. Descriptions remain untrusted data. */
export function catalogToolRecords(catalog: ProductRow[]) {
  return catalog.filter(product => product.item_type !== 'archive').map(product => ({
    slug: product.slug, name: product.name, category: product.categories?.name ?? null,
    price: effectivePricing(product).price, description: product.description?.slice(0, 1000),
    best_for: product.best_for?.slice(0, 1000), why_victory: product.why_victory?.slice(0, 1000),
    specifications: product.specifications?.slice(0, 1500), considerations: product.considerations?.slice(0, 1000),
  }))
}
