import type { ProductRow } from './data'

export type VenusAction =
  | { kind: 'save' | 'remove'; id: string; name: string; slug: string }
  | { kind: 'clear' }
  | { kind: 'navigate'; path: string }
export type VenusActionPlan = { action?: VenusAction; message: string }
const fold = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Only these browser actions are accepted from a completed response. */
export function validVenusAction(value: unknown): value is VenusAction {
  if (!value || typeof value !== 'object') return false
  const action = value as Record<string, unknown>
  if (action.kind === 'clear') return true
  if (action.kind === 'save' || action.kind === 'remove') return typeof action.id === 'string' && uuid.test(action.id) && typeof action.name === 'string' && action.name.length <= 300 && typeof action.slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(action.slug)
  if (action.kind !== 'navigate' || typeof action.path !== 'string') return false
  if (action.path === '/shortlist' || /^\/shop\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(action.path)) return true
  if (!action.path.startsWith('/picks?')) return false
  const params = new URLSearchParams(action.path.slice(7))
  return [...params].length > 0 && [...params].every(([key, item]) => key === 'category' ? /^[a-z0-9 -]{1,80}$/.test(item) : key === 'maxPrice' && item.trim() !== '' && Number.isFinite(Number(item)) && Number(item) >= 0 && Number(item) <= 1_000_000)
}

/** Explicit user commands, resolved against current catalog records; model output cannot invent actions. */
export function planVenusAction(catalog: ProductRow[], message: string, history: {role: string; content: string}[] = [], productSlug?: string | null, savedIds: string[] = []): VenusActionPlan | null {
  const command = message.trim().replace(/^(?:please\s+|(?:can|could|would) you\s+)+/i, '')
  if (/^(?:(?:clear|empty)\s+(?:my |the |your )?(?:shortlist|wishlist|saved picks)|remove all(?: picks)? from (?:my |the |your )?(?:shortlist|wishlist))[.!?]*$/i.test(command)) return { action: {kind: 'clear'}, message: 'Confirm below to clear your shortlist. You can undo it afterwards.' }
  if (/^(?:open|show|take me to|go to)\b/i.test(command) && /^(?:open|show|take me to|go to)\s+(?:my |the |your )?(?:shortlist|wishlist|saved picks)[.!?]*$/i.test(command)) return {action: {kind: 'navigate', path: '/shortlist'}, message: 'Opening your shortlist.'}
  const verb = command.match(/^(save|add|bookmark|remove|unsave|open|show)\b/i)?.[1]?.toLowerCase()
  if (!verb) return null
  const hasList = /\b(shortlist|wishlist|saved picks)\b/i.test(command)
  const modifying = ['save', 'add', 'bookmark', 'remove', 'unsave'].includes(verb)
  if (verb === 'add' && !hasList) return null
  if (verb === 'remove' && !hasList && !productSlug) return null
  const normalized = fold(command)
  const explicit = catalog.filter(p => normalized.includes(fold(p.name)) || normalized.includes(fold(p.slug)))
  const query = fold(command.replace(/^(save|add|bookmark|remove|unsave|open|show)\s+/i, '').replace(/\b(?:to|from|on|in) (?:my |the |your )?(?:shortlist|wishlist)\b/ig, '').replace(/\b(?:the|please|pick|product)\b/ig, ''))
  const partial = query.length >= 3 ? catalog.filter(p => fold(p.name).includes(query) || fold(p.slug).includes(query)) : []
  let candidates = explicit.length ? explicit : partial
  if (!candidates.length && /^(?:this|that|it|this one|that one)$/.test(query)) {
    candidates = productSlug ? catalog.filter(p => p.slug === productSlug) : catalog.filter(p => history.slice(-1).some(h => h.content.includes(`/shop/${p.slug}`)))
  }
  if (verb === 'remove' || verb === 'unsave') candidates = candidates.filter(p => savedIds.includes(p.id))
  if (candidates.length === 1) {
    const product = candidates[0]
    if (!uuid.test(product.id)) return {message: 'This preview pick cannot be saved. Choose an available catalog pick.'}
    if (modifying) return {action: {kind: verb === 'remove' || verb === 'unsave' ? 'remove' : 'save', id: product.id, name: product.name, slug: product.slug}, message: ''}
    return {action: {kind:'navigate', path:`/shop/${product.slug}`}, message:`Opening ${product.name}.`}
  }
  if (modifying) return {message: candidates.length > 1 ? 'Which pick do you mean? Give me its full product name so I change the right one.' : 'I could not identify that pick in the current collection. For removal, it must also be saved. Give me the product name, or open its page and ask me to save this pick.'}
  const category = [...new Set(catalog.map(p => p.categories?.name).filter((name): name is string => !!name))].find(name => new RegExp(`\\b${name.toLowerCase()}\\b`).test(command.toLowerCase()))
  const budget = command.match(/(?:under|below|up to|maximum)\s*\$?\s*(\d+(?:\.\d+)?)/i)
  if (verb === 'show' && (category || budget)) {
    const params = new URLSearchParams()
    if (category) params.set('category', category.toLowerCase())
    if (budget && Number(budget[1]) <= 1_000_000) params.set('maxPrice', budget[1])
    if (params.size) return {action:{kind:'navigate',path:`/picks?${params}`},message:'Opening the collection with those filters.'}
  }
  return null
}


/** Factual comparison template; no missing specifications or hands-on claims are inferred. */
export function compareVenusPicks(products: {name:string; slug:string; price:number|null; category?:string|null; why_victory?:string|null; best_for?:string|null; considerations?:string|null; specifications?:string|null}[]) {
  const cell = (value?: string|null) => value?.replace(/[|\r\n]/g, ' ').trim() || 'Not recorded'
  const rows = products.map(product => `| [${cell(product.name)}](/shop/${product.slug}) | ${product.price == null ? 'Not listed' : '$'+product.price.toFixed(2)} | ${cell(product.category)} | ${cell(product.best_for)} | ${cell(product.considerations)} |`)
  const notes = products.map(product => `**${cell(product.name)}**\n\n${product.why_victory ? cell(product.why_victory) : 'The curator has not recorded a selection note.'}\n\n${product.specifications ? 'Recorded specifications: '+cell(product.specifications) : 'Detailed specifications are not recorded.'}`).join('\n\n')
  return 'Here is a comparison using the details recorded in Vesna.\n\n| Pick | Listed price | Category | Who it suits | What to consider |\n| --- | --- | --- | --- | --- |\n'+rows.join('\n')+'\n\n'+notes+'\n\nPrices are listed catalog prices; check the seller for current price and availability. Missing details do not imply that a product lacks a feature.'
}
