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
  brand?: string | null
  uses?: string[]
  interests?: string[]
  occasions?: string[]
  recipient_tags?: string[]
  id: string
  slug: string
  name: string
  description: string | null
  price: number | null
  sale_price: number | null
  affiliate_link: string | null
  image_urls: string[] | null
  why_victory: string | null
  best_for?: string | null
  considerations?: string | null
  specifications?: string | null
  selection_basis?: string
  item_type: string
  is_featured: boolean
  categories: { name: string } | null
}

const SELECT_FIELDS = `
  id, slug, name, description, price, sale_price, affiliate_link,
  image_urls, why_victory, best_for, considerations, specifications, selection_basis, item_type, is_featured,
  brand, uses, interests, occasions, recipient_tags,
  categories ( name )
`

// Corrected manufacturer imagery is preview-only while the production catalog
// remains the source of truth. Never mirror these values back to Supabase.
const PREVIEW_IMAGE_OVERRIDES: Record<string, string[]> = {
  'sony-wh-1000xm6': [
    'https://d1ncau8tqf99kp.cloudfront.net/converted/128950_original_local_1200x1050_v3_converted.webp',
  ],
  'fellow-stagg-ekg-kettle': [
    'https://fellowproducts.com/cdn/shop/files/Web_PDP_StaggEKGElectricKettle-Pro_Woodland_Walnut_1.png?v=1773351258&width=1200',
  ],
  'cotopaxi-allpa-35l': [
    'https://cdn.shopify.com/s/files/1/0281/7544/files/1200x1200png-S26UAllpa35LTravelPackCotopaxiBlack_F_1200x.png?v=1770301311',
    'https://cdn.shopify.com/s/files/1/0281/7544/files/1200x1200png-S26UAllpa35LTravelPackCotopaxiBlack_B_1200x.png?v=1770301311',
    'https://cdn.shopify.com/s/files/1/0281/7544/files/1200x1200png-S26UAllpa35LTravelPackCotopaxiBlack_A1_1200x.png?v=1770301311',
  ],
  'benq-screenbar-halo-2': [
    'https://image.benq.com/is/image/benqco/comprehensive-lighting?$ResponsivePreset$',
  ],
}

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
  const product = row as unknown as ProductRow
  const previewImages = process.env.VESNA_NETLIFY_CONTEXT === 'deploy-preview'
    ? PREVIEW_IMAGE_OVERRIDES[product.slug]
    : undefined
  return {
    ...product,
    ...(previewImages ? { image_urls: previewImages } : {}),
    categories: Array.isArray(cats) ? cats[0] ?? null : cats ?? null,
  }
}

/** Active non-archive products, newest first. Memoized per request. */
export async function readActiveCatalog(): Promise<ProductRow[]> {
  const { data, error } = await createPublicClient().from('products').select(SELECT_FIELDS)
    .eq('is_active', true).neq('item_type', 'archive')
    .order('created_at', { ascending: false }).limit(200)
  if (error || !data) throw error ?? new Error('Catalog unavailable')
  return data.map(normalize)
}

export const getProducts = cache(async (): Promise<ProductRow[]> => {
  try {
    return await readActiveCatalog()
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

/** Bounded public detail reads; caller privileges cannot admit inactive/archive rows. */
export async function readVenusDetails(keys:string[],signal:AbortSignal,by:'id'|'slug'='id',confirmation=false):Promise<ProductRow[]> {
 const values=[...new Set(keys)].slice(0,confirmation?20:8)
 if(!values.length)return []
 const fields=confirmation?'id,name,slug,price,sale_price,item_type':SELECT_FIELDS
 const {data,error}=await createPublicClient().from('products').select(fields).in(by,values).eq('is_active',true).neq('item_type','archive').limit(confirmation?20:8).abortSignal(signal)
 if(error||!data)throw error??new Error('Product details unavailable')
 return data.map(row=>normalize(row as unknown as Record<string,unknown>))
}
export type VenusSearchSummary={id:string;slug:string;name:string;price:number|null;category:string|null;excerpt:string;uses:string[];interests:string[];score:number}
export async function searchVenusCatalog(input:{queryTerms:string[];boostTags:string[];excludedTags:string[];maxPrice:number|null;broad:boolean},signal:AbortSignal):Promise<VenusSearchSummary[]> {
 const {data,error}=await createPublicClient().rpc('venus_search_products',{search_terms:input.queryTerms,max_price:input.maxPrice,boost_tags:input.boostTags,excluded_tags:input.excludedTags,broad:input.broad,match_count:12}).abortSignal(signal)
 if(error||!data)throw error??new Error('Catalog search unavailable')
 return (data as VenusSearchSummary[]).slice(0,12)
}
