import { effectivePricing } from './pricing'
import type { ProductRow } from './data'

const STOP_WORDS = new Set('a an the this that these those it its me my you your i we our is are was to of and or for with tell about what which should check before buying help pick picks choose looking want need please can could would compare available show find something options recommend recommendation recommendations under below less than budget maximum max up most considered thoughtful gift gifts two'.split(' '))
const ALIASES: Record<string, string[]> = {
  audio: ['headphone', 'headphones', 'earbuds', 'listening', 'music', 'sound'],
  workspace: ['desk', 'office', 'work', 'working', 'productivity'],
  travel: ['trip', 'trips', 'carry', 'packing', 'backpack', 'commute'],
  home: ['kitchen', 'coffee', 'brewing', 'room'],
  tech: ['technology', 'mouse', 'computer', 'charger', 'charging'],
}
const words = (text: string) => text.toLowerCase().match(/[a-z0-9]+/g) ?? []

/** Ranking uses the same active catalog as Picks, without trusting client product data. */
export function selectVenusProducts(catalog: ProductRow[], message: string, history: { role: string; content: string }[] = [], productSlug?: string | null, limit = 8) {
  const followup = /\b(it|this|that|these|those|them|other|another|cheaper|instead|both)\b/i.test(message)
  const context = followup ? history.slice(-4).map(entry => entry.content).join(' ') : ''
  const terms = [...new Set(words(message).filter(word => word.length > 2 && !STOP_WORDS.has(word) && !/^\d+$/.test(word)))]
  const contextualTerms = [...new Set(words(context).filter(word => word.length > 2 && !STOP_WORDS.has(word)))]
  const budgetMatch = message.match(/(?:under|below|less than|up to|budget(?: of)?|maximum|max)\s*\$?\s*([\d,]+(?:\.\d+)?)/i)
  const budget = budgetMatch ? Number(budgetMatch[1].replaceAll(',', '')) : null
  const eligible = catalog.filter(product => product.item_type !== 'archive' && (budget == null || (effectivePricing(product).price != null && effectivePricing(product).price! <= budget)))
  const ranked = eligible.map(product => {
    const category = product.categories?.name.toLowerCase() ?? ''
    const name = `${product.name} ${product.slug}`.toLowerCase()
    const detail = `${product.description ?? ''} ${product.why_victory ?? ''}`.toLowerCase()
    const match = (term: string) => (name.includes(term) ? 8 : 0) + (category.includes(term) ? 6 : 0) + (detail.includes(term) ? 2 : 0) + ((ALIASES[category] ?? []).includes(term) ? 6 : 0)
    const relevance = terms.reduce((score, term) => score + match(term), 0)
    const contextualRelevance = contextualTerms.reduce((score, term) => score + match(term), 0)
    return { product, relevance: relevance + (followup ? contextualRelevance * 0.2 : 0), score: relevance + (followup ? contextualRelevance * 0.2 : 0) + (product.is_featured ? 0.5 : 0) }
  }).filter(row => terms.length === 0 || row.relevance > 0 || row.product.slug === productSlug)
    .sort((a, b) => b.score - a.score)
  const selected = ranked.find(row => row.product.slug === productSlug)
  return (selected ? [selected, ...ranked.filter(row => row !== selected)] : ranked).slice(0, limit).map(({ product }) => ({
    name: product.name, slug: product.slug, price: effectivePricing(product).price,
    image_urls: product.image_urls, description: product.description,
    item_type: product.item_type, why_victory: product.why_victory,
    category: product.categories?.name ?? null, similarity: 0,
  }))
}
