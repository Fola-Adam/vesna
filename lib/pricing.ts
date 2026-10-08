/**
 * Pure presentation helpers — safe to import from BOTH server and client
 * components (no next/headers, no SDK singletons).
 */

export interface PricingInput {
  price: number | null
  sale_price?: number | null
}

/** Sale price shown struck-through BEFORE the current price (legacy card order). */
export function effectivePricing(p: PricingInput): {
  price: number | null
  strike: number | null
} {
  if (p.sale_price != null && p.price != null && p.sale_price < p.price) {
    return { price: p.sale_price, strike: p.price }
  }
  return { price: p.price, strike: null }
}

export function formatPrice(price: number | null): string {
  if (price == null) return 'Inquire'
  return `$${price.toLocaleString('en-US')}`
}
