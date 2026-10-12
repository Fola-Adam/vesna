import type { ProductRow } from './data'

export const COLLECTIONS = [
  { slug: 'considered-workspace', title: 'A considered workspace', description: 'Lighting, input tools, and charging for the place you work.', categories: ['workspace'], terms: ['charger', 'mouse', 'keyboard'] },
  { slug: 'slower-mornings', title: 'Slower mornings', description: 'Objects for brewing, listening, and the rituals of home.', categories: ['home'], terms: ['hatch-restore', 'sonos-era'] },
  { slug: 'on-the-move', title: 'On the move', description: 'Carry, listening, and everyday essentials for leaving home.', categories: ['travel'], terms: ['headphone', 'sony-wh', 'hydro-flask', 'charger'] },
] as const

export function inCollection(product: ProductRow, slug: string) {
  const collection = COLLECTIONS.find(item => item.slug === slug)
  if (!collection) return true
  const category = product.categories?.name.toLowerCase() ?? ''
  return (collection.categories as readonly string[]).includes(category) || collection.terms.some(term => `${product.slug} ${product.name}`.toLowerCase().includes(term))
}
