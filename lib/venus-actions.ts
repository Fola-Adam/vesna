import type { ProductRow } from './data'

export type VenusAction =
  | { kind: 'save' | 'remove'; id: string; name: string; slug: string }
  | { kind: 'clear' }
  | { kind: 'navigate'; path: string }
export type VenusActionPlan = { action?: VenusAction; message: string }
const fold = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const compact = (text: string) => fold(text).replaceAll(' ', '')
const mentions = (text: string, product: Pick<ProductRow,'name'|'slug'>) => compact(text).includes(compact(product.name)) || compact(text).includes(compact(product.slug))
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
  if (/\b(?:do not|don't|dont|never)\b/i.test(message) || /\b(?:how (?:can|do|to)|should i)\b/i.test(message)) return null
  const previous = history.at(-1)
  const previousAssistant = previous?.role === 'assistant' ? previous.content : ''
  const previousNames = catalog.filter(product => mentions(previousAssistant, product))
  const proposal = /\b(?:would you like|shall i|do you want|want me to|should i)\b/i.test(previousAssistant) && /\b(?:shortlist|wishlist)\b/i.test(previousAssistant)
  if (/^(?:yes|yep|yeah|sure|okay|ok|go ahead|do it|please do)(?: please)?[.!]*$/i.test(command)) {
    if (proposal && previousNames.length === 1 && /\b(?:add|save|remove|unsave)\b/i.test(previousAssistant)) {
      const product = previousNames[0]
      const kind = /\b(?:remove|unsave)\b/i.test(previousAssistant) ? 'remove' : 'save'
      if (!uuid.test(product.id)) return {message:'That pick is not available for saving.'}
      return {action:{kind,id:product.id,name:product.name,slug:product.slug},message:''}
    }
    return {message:'What would you like me to do? Name the pick and the action so I change the right thing.'}
  }
  if (/^(?:no|no thanks|cancel|never mind|nevermind)[.!]*$/i.test(command) && proposal) return {message:'Kept your shortlist as it is.'}
  if (/^(?:done|did you (?:add|save|remove) (?:it|that)|is it (?:done|saved|added))[?! .]*$/i.test(command)) {
    const reference = [...history].reverse().find(entry => entry.role === 'assistant' && /\b(?:shortlist|wishlist)\b/i.test(entry.content) && catalog.some(product => mentions(entry.content, product)))
    const named = reference ? catalog.filter(product => mentions(reference.content, product)) : []
    if (named.length === 1) return {message:savedIds.includes(named[0].id) ? `${named[0].name} is currently in your shortlist.` : `${named[0].name} is not in your shortlist. Would you like me to add ${named[0].name} to your shortlist?`}
    return {message:'I cannot verify which pick you mean. Give me the product name and I will check your current shortlist.'}
  }
  const bare = catalog.filter(product => compact(command) === compact(product.name) || compact(command) === compact(product.slug))
  if (bare.length === 1) {
    const product = bare[0]
    if (/\b(?:which|what|name)\b/i.test(previousAssistant) && /\b(?:save|add)\b/i.test(previousAssistant) && /\b(?:shortlist|wishlist)\b/i.test(previousAssistant) && uuid.test(product.id)) return {action:{kind:'save',id:product.id,name:product.name,slug:product.slug},message:''}
    return {message:`Would you like me to add ${product.name} to your shortlist?`}
  }

  if (/^(?:(?:clear|empty)\s+(?:my |the |your )?(?:shortlist|wishlist|saved picks)|remove all(?: picks)? from (?:my |the |your )?(?:shortlist|wishlist))[.!?]*$/i.test(command)) return { action: {kind: 'clear'}, message: 'Confirm below to clear your shortlist. You can undo it afterwards.' }
  if (/^(?:open|show|take me to|go to)\b/i.test(command) && /^(?:open|show|take me to|go to)\s+(?:my |the |your )?(?:shortlist|wishlist|saved picks)[.!?]*$/i.test(command)) return {action: {kind: 'navigate', path: '/shortlist'}, message: 'Opening your shortlist.'}
  const verb = command.match(/^(save|add|bookmark|remove|unsave|open|show)\b/i)?.[1]?.toLowerCase()
  if (!verb) return null
  const hasList = /\b(shortlist|wishlist|saved picks)\b/i.test(command)
  const modifying = ['save', 'add', 'bookmark', 'remove', 'unsave'].includes(verb)
  if (verb === 'add' && !hasList) return null
  if (verb === 'remove' && !hasList && !productSlug) return null
  const normalized = fold(command)
  const explicit = catalog.filter(p => mentions(normalized, p))
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


/** Map provider tool requests to the same bounded actions, with server-side catalog and user-intent checks. */
export function resolveVenusTool(catalog: ProductRow[], name: string, args: unknown, message: string, history: {role:string;content:string}[] = [], productSlug?: string|null, savedIds: string[] = []): VenusActionPlan {
  if (!args || typeof args !== 'object' || Array.isArray(args)) return {message:'I could not validate that action. Please try again.'}
  const parameters = args as Record<string,unknown>
  if (/\b(?:do not|don't|dont|never)\b/i.test(message) || /\b(?:should i|how (?:can|do|to))\b/i.test(message)) return {message:'I have not changed your shortlist. Tell me directly if you want a pick saved or removed.'}
  const existingPlan = planVenusAction(catalog,message,history,productSlug,savedIds)
  if (existingPlan?.action) return existingPlan
  if (name === 'open_shortlist' && /\b(?:open|show|take|go|view)\b/i.test(message)) return {action:{kind:'navigate',path:'/shortlist'},message:'Opening your shortlist.'}
  if (name === 'clear_shortlist' && /\b(?:clear|empty|remove all)\b/i.test(message) && /\b(?:shortlist|wishlist)\b/i.test(message)) return {action:{kind:'clear'},message:'Confirm below to clear your shortlist. You can undo this afterwards.'}
  if (name === 'filter_picks' && /\b(?:show|browse|filter|open)\b/i.test(message)) {
    const params = new URLSearchParams()
    const category = catalog.map(product => product.categories?.name).find(category => category && category.toLowerCase() === parameters.category)
    if (category) params.set('category',category.toLowerCase())
    if (typeof parameters.maxPrice === 'number' && Number.isFinite(parameters.maxPrice) && parameters.maxPrice >= 0 && parameters.maxPrice <= 1_000_000) params.set('maxPrice',String(parameters.maxPrice))
    const action: VenusAction = {kind:'navigate',path:`/picks?${params}`}
    return validVenusAction(action) ? {action,message:'Opening the collection with those filters.'} : {message:'Which category or budget would you like to browse?'}
  }
  const product = typeof parameters.slug === 'string' ? catalog.find(product => product.slug === parameters.slug && product.item_type !== 'archive') : null
  if (!product || !uuid.test(product.id)) return {message:'That pick is not available in the current catalog. Choose a current pick.'}
  const explicitlyNamed = catalog.filter(item => mentions(message, item))
  if (explicitlyNamed.length === 1 && explicitlyNamed[0].id !== product.id) return {message:'I could not match that action to the pick you named. Please try its full product name.'}
  if (name === 'remove_pick' && !savedIds.includes(product.id)) return {message:`${product.name} is not currently in your shortlist.`}
  if (explicitlyNamed.length > 1) return {message:'Please choose one pick at a time so I can confirm each update.'}
  if (/\b(?:it|that|this|one)\b/i.test(message) && !explicitlyNamed.length && !productSlug) {
    const previous = history.at(-1)?.content ?? ''
    const referenced = catalog.filter(item => mentions(previous, item))
    if (referenced.length !== 1 || referenced[0].id !== product.id) return {message:'Which pick do you mean? Give me its product name.'}
  }
  if (name === 'save_pick' && /\b(?:save|add|bookmark|put|pop|keep)\b/i.test(message)) return {action:{kind:'save',id:product.id,name:product.name,slug:product.slug},message:''}
  if (name === 'remove_pick' && /\b(?:remove|unsave|delete|take off)\b/i.test(message)) return {action:{kind:'remove',id:product.id,name:product.name,slug:product.slug},message:''}
  if (name === 'open_pick' && /\b(?:open|show|view|take)\b/i.test(message)) return {action:{kind:'navigate',path:`/shop/${product.slug}`},message:`Opening ${product.name}.`}
  return {message:'I have not changed anything. Tell me the action you want for that pick.'}
}

export function actionClaimWithoutReceipt(text: string) {
  return /\b(?:shortlist|wishlist|request)\b[\s\S]{0,100}\b(?:processed|updated|completed|saved|added|removed|cleared)\b|\b(?:added|saved|removed|cleared|updated)\b[\s\S]{0,100}\b(?:shortlist|wishlist)\b|\b(?:i have|i've|successfully)\s+(?:added|saved|removed|cleared)\b/i.test(text)
}
