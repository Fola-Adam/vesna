import type { ProductRow } from './data'
import { effectivePricing } from './pricing'
import type { VenusActionPlan } from './venus-actions'

export type VenusActivity = { id: string; label: string; state: 'running' | 'complete' | 'failed' }
export type VenusSelection = { label: string; products: { id: string; name: string; slug: string; price: number | null; evidence: string }[] }
const fields = ['name', 'description', 'why_victory', 'best_for', 'specifications'] as const
const normalize = (value: string) => value.normalize('NFKC').replace(/\s+/g, ' ').trim().toLowerCase()

/** Confirmation does not need another model call. The set must already be concrete. */
export function confirmVenusSelection(catalog: ProductRow[], message: string, selectionIds: string[], history: {role:string;content:string}[]): VenusActionPlan | null {
  const command = message.trim().replace(/[.!?,]+$/g, '').replace(/\s+/g,' ')
  const affirmative = /^(?:yes|yep|yeah|sure|okay|ok|go ahead|do it)(?:\s+(?:please|pls|plz))?(?:\s*[,;:]?\s*(?:add|save)(?:\s+(?:these|those|them)(?:\s+(?:three|all|\d+))?(?:\s+picks)?|\s+(?:all|the)(?:\s+three)?)(?:\s+to\s+my\s+(?:shortlist|wishlist))?)?$/i.test(command)
    || /^(?:save|add)\s+(?:these|those|them)(?:\s+(?:three|all|\d+))?(?:\s+picks)?(?:\s+to\s+my\s+(?:shortlist|wishlist))?(?:\s+(?:please|pls|plz))?$/i.test(command)
  if (!affirmative) return null
  let selected = catalog.filter(product=>selectionIds.includes(product.id))
  if (selectionIds.length && selected.length !== selectionIds.length) return {message:'Some selected picks are no longer available. Ask me to refresh the set before saving.'}
  if (!selectionIds.length) {
    const previous = history.at(-1)
    if (previous?.role !== 'assistant' || !/\b(?:would you like|shall i|do you want)\b/i.test(previous.content) || !/\b(?:add|save)\b/i.test(previous.content) || !/\b(?:shortlist|wishlist)\b/i.test(previous.content)) return null
    const compact = (value:string)=>normalize(value).replace(/[^a-z0-9]/g,'')
    const offered = compact(previous.content)
    selected = catalog.filter(product=>offered.includes(compact(product.name)) || offered.includes(compact('/shop/'+product.slug)))
    // Legacy prose can be recovered only when every item in the numbered offer resolves.
    const count = previous.content.match(/\b(?:these|those|here are)\s+(three|two|\d+)\b/i)?.[1]
    const expected = count === 'three' ? 3 : count === 'two' ? 2 : count ? Number(count) : null
    if (!selected.length || (expected !== null && selected.length !== expected)) return {message:'That earlier reply did not create a complete, verifiable selection. Ask me to find the picks again; I will show the exact set before saving.'}
    if (selected.length > 1 && expected === null) return {message:'That earlier offer is ambiguous. Ask me to refresh the selection before saving several picks.'}
  }
  if (!selected.length || selected.length > 20) return {message:'Ask me to find a set of up to 20 current picks first.'}
  return {message:'',action:{kind:'save_many',label:'your confirmed selection',products:selected.map(({id,name,slug})=>({id,name,slug}))}}
}

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
