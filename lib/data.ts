import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cache } from 'react'

/**
 * Server-side data access layer.
 *
 * All public product reads go through here so pages render on the server
 * (SEO metadata, streaming, no client waterfalls). Supabase outages return
 * an empty result instead of exposing retired bundled catalog content.
 *
 * Caching: standard ISR (`export const revalidate = 300` on the pages that
 * consume this layer) plus per-request memoization via React `cache()` so a
 * single page render hits Supabase at most once. We deliberately avoid the
 * newer 'use cache' Cache Components because they conflict with the Node
 * `runtime` export required by /api/venus (ONNX embeddings).
 */

export interface ProductRow {
  id: string
  slug: string
  name: string
  description: string | null
  price: number | null
  sale_price: number | null
  affiliate_link: string | null
  image_urls: string[] | null
  why_victory: string | null
  item_type: string
  is_featured: boolean
  categories: { name: string } | null
}

const SELECT_FIELDS = `
  id, slug, name, description, price, sale_price, affiliate_link,
  image_urls, why_victory, item_type, is_featured,
  categories ( name )
`

/**
 * Public catalog reads must not depend on request cookies: these functions are
 * also called by generateStaticParams and statically rendered pages. The anon
 * key is subject to the same public RLS policies as the browser client.
 */
function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) {
    throw new Error('Missing Supabase public environment variables')
  }
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}

/** Normalizes a Supabase row (categories may come back as an array or object). */
function normalize(row: Record<string, unknown>): ProductRow {
  const cats = row.categories as { name: string }[] | { name: string } | null
  return {
    ...(row as unknown as ProductRow),
    categories: Array.isArray(cats) ? cats[0] ?? null : cats ?? null,
  }
}

/** Active non-archive products, newest first. Memoized per request. */
export const getProducts = cache(async (): Promise<ProductRow[]> => {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('products')
      .select(SELECT_FIELDS)
      .eq('is_active', true)
      .neq('item_type', 'archive')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error || !data) throw error ?? new Error('No data')
    return data.map(normalize)
  } catch (e) {
    console.error('[data] getProducts failed:', (e as Error).message)
    return []
  }
})

/** Archived items are shown only when an administrator has explicitly marked them archived. */
export const getArchivedProducts = cache(async (): Promise<ProductRow[]> => {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('products')
      .select(SELECT_FIELDS)
      .eq('is_active', true)
      .eq('item_type', 'archive')
      .order('created_at', { ascending: false })
      .limit(200)
    if (error || !data) throw error ?? new Error('No data')
    return data.map(normalize)
  } catch (e) {
    console.error('[data] getArchivedProducts failed:', (e as Error).message)
    return []
  }
})

/** A single active product by slug, or null. Memoized per (request, slug). */
export const getProductBySlug = cache(async (slug: string): Promise<ProductRow | null> => {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('products')
      .select(SELECT_FIELDS)
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()

    if (error) throw error
    return data ? normalize(data as Record<string, unknown>) : null
  } catch (e) {
    console.error('[data] getProductBySlug failed:', (e as Error).message)
    return null
  }
})

/** Seller redirects require a live, active listing; never use demonstration data. */
export async function getProductById(id: string): Promise<ProductRow | null> {
  const { data, error } = await createPublicClient().from('products')
    .select(SELECT_FIELDS).eq('id', id).eq('is_active', true).maybeSingle()
  if (error) throw error
  return data ? normalize(data as Record<string, unknown>) : null
}

/** Slugs for generateStaticParams (pre-rendering of /shop/[slug]). */
export async function getProductSlugs(): Promise<string[]> {
  const products = await getProducts()
  return products.map((p) => p.slug)
}
