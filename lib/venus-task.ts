import { readDiscovery, type DiscoveryBrief } from './venus-discovery'
import type { ProductRow } from './data'
import { effectivePricing } from './pricing'
import type { VenusActionPlan } from './venus-actions'

export type VenusActivity = { id: string; label: string; state: 'running' | 'complete' | 'failed' }
export type VenusSelection = { label: string; products: { id: string; name: string; slug: string; price: number | null; evidence: string; rationale?:string }[] }
export type VenusTaskState = { brief: string; refinements: string[]; selectionIds: string[]; updatedAt: number; discovery?: DiscoveryBrief }
export function readVenusTask(value: unknown): VenusTaskState | null {
  if (!value || typeof value !== 'object') return null
  const task = value as VenusTaskState
  if (typeof task.brief !== 'string' || task.brief.length > 2000 || !Array.isArray(task.refinements) || task.refinements.length > 8 || !task.refinements.every(item=>typeof item==='string' && item.length<=500) || !Array.isArray(task.selectionIds) || task.selectionIds.length>20 || !task.selectionIds.every(id=>typeof id==='string' && /^[0-9a-f-]{36}$/i.test(id)) || !Number.isFinite(task.updatedAt) || task.updatedAt>Date.now()+60000 || Date.now()-task.updatedAt>86400000) return null
  if(task.discovery!==undefined && !readDiscovery(task.discovery))return null
  return task
}
export function advanceVenusTask(value: unknown, message: string): VenusTaskState {
  const previous = readVenusTask(value)
  const followup = /\b(?:these|those|them|it|that|this|cheaper|instead|exclude|except|without|refine|swap|replace|keep|remaining|previous|both)\b/i.test(message) || /^(?:yes|yep|yeah|sure|okay|ok|go ahead|do it|under|below|budget|only|prioritize|make it)\b/i.test(message)
  return previous && (followup || !!previous.discovery) ? {...previous,refinements:[...previous.refinements,message.slice(0,500)].slice(-8),updatedAt:Date.now()} : {brief:message,refinements:[],selectionIds:[],updatedAt:Date.now()}
}
export function taskBudget(task: VenusTaskState) {
  if(task.discovery) return task.discovery.budget?.currency==='USD' ? {amount:task.discovery.budget.amount,mode:task.discovery.budget.mode} : null
  const entries=[task.brief,...task.refinements]
  let budget:{amount:number;mode:'total'|'per-item'}|null=null
  let lastMode:'total'|'per-item'='per-item'
  for (const text of entries) {
    if (/\b(?:no budget limit|ignore (?:the )?budget|any budget)\b/i.test(text)) {budget=null;continue}
    const match=text.match(/(?:under|below|less than|up to|maximum|max|budget(?: of)?)\s*\$?\s*([\d,]+(?:\.\d+)?)/i)
    if (!match) continue
    const amount=Number(match[1].replaceAll(',',''))
    if (!Number.isFinite(amount) || amount<0 || amount>1000000) continue
    const mode:'total'|'per-item'=/\b(?:each|per item|per pick|per product|individual)\b/i.test(text) ? 'per-item' : /\b(?:total|altogether|combined|overall|whole|entire|set|kit|setup|starter|all together)\b/i.test(text) ? 'total' : lastMode
    lastMode=mode
    budget={amount,mode}
  }
  return budget
}
const fields = ['name', 'description', 'why_victory', 'best_for', 'specifications'] as const
const normalize = (value: string) => value.normalize('NFKC').replace(/\s+/g, ' ').trim().toLowerCase()

/** Confirmation does not need another model call. The set must already be concrete. */
export function confirmVenusSelection(catalog: ProductRow[], message: string, selectionIds: string[], history: {role:string;content:string}[]): VenusActionPlan | null {
  const command = message.trim().replace(/[.!?,]+$/g, '').replace(/\s+/g,' ')
  const affirmative = /^(?:yes|yep|yeah|sure|okay|ok|go ahead|do it)(?:\s+(?:please|pls|plz))?(?:\s*[,;:]?\s*(?:add|save)(?:\s+(?:these|those|them)(?:\s+(?:two|three|all|\d+))?(?:\s+picks)?|\s+(?:all|the)(?:\s+three)?)(?:\s+to\s+my\s+(?:shortlist|wishlist))?)?$/i.test(command)
    || /^(?:save|add)\s+(?:these|those|them)(?:\s+(?:two|three|all|\d+))?(?:\s+picks)?(?:\s+to\s+my\s+(?:shortlist|wishlist))?(?:\s+(?:please|pls|plz))?$/i.test(command)
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
  const requestedCount=command.match(/\b(?:these|those)\s+(two|three|\d+)\b/i)?.[1]
  const count=requestedCount==='two' ? 2 : requestedCount==='three' ? 3 : requestedCount ? Number(requestedCount) : null
  if(count!==null && count!==selected.length) return {message:`The current selection has ${selected.length} picks, rather than ${count}. Confirm the displayed set or ask me to refine it first.`}
  if (!selected.length || selected.length > 20) return {message:'Ask me to find a set of up to 20 current picks first.'}
  return {message:'',action:{kind:'save_many',label:'your confirmed selection',products:selected.map(({id,name,slug})=>({id,name,slug}))}}
}

/** A model may select only current records and quote evidence actually recorded for them. */
export function validateSelection(catalog: ProductRow[], value: unknown, message = '', task?: VenusTaskState): VenusSelection | null {
  if (!value || typeof value !== 'object') return null
  const input = value as { label?: unknown; products?: unknown }
  if (typeof input.label !== 'string' || !input.label.trim() || input.label.length > 150 || !Array.isArray(input.products) || !input.products.length || input.products.length > 20) return null
  const budget = taskBudget(task ?? advanceVenusTask(null,message))
  const ceiling = budget?.amount ?? null
  const products: VenusSelection['products'] = []
  for (const item of input.products) {
    if (!item || typeof item !== 'object' || typeof item.slug !== 'string' || typeof item.evidence !== 'string' && typeof item.evidenceField !== 'string') return null
    const product = catalog.find(product => product.slug === item.slug && product.item_type !== 'archive')
    const requestedField=typeof item.evidenceField==='string' && ['description','why_victory','best_for','specifications'].includes(item.evidenceField) ? item.evidenceField as typeof fields[number] : null
    const evidence = requestedField && product && typeof product[requestedField]==='string' ? product[requestedField]!.trim().slice(0,500) : typeof item.evidence==='string' ? item.evidence.trim() : ''
    const price = product ? effectivePricing(product).price : null
    if (ceiling !== null && (price === null || price > ceiling)) return null
    if (!product || evidence.length < 12 || evidence.length > 500 || products.some(item => item.id === product.id)) return null
    if (!fields.some(field => typeof product[field] === 'string' && normalize(product[field]!).includes(normalize(evidence)))) return null
    products.push({ id: product.id, name: product.name, slug: product.slug, price, evidence })
  }
  if (budget?.mode==='total' && products.reduce((sum,product)=>sum+Math.round(product.price!*100),0)>Math.round(budget.amount*100)) return null
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

/** Discovery proposes slugs; source evidence is selected from populated real fields. */
export function groundSelectionEvidence(catalog: ProductRow[], value: unknown): unknown {
  if(!value || typeof value!=='object' || !('products' in value) || !Array.isArray(value.products)) return value
  return {...value,products:value.products.map(item=>{
    if(!item || typeof item!=='object' || typeof item.slug!=='string') return item
    const product=catalog.find(product=>product.slug===item.slug)
    const field=(['best_for','description','why_victory','specifications'] as const).find(field=>product && typeof product[field]==='string' && product[field]!.trim().length>=12)
    return {...item,evidenceField:field ?? ''}
  })}
}
