import { createClient } from './server'
import { unstable_cache } from 'next/cache'

// Cache products list with 5 minute revalidation
export const getCachedProducts = unstable_cache(
  async (limit = 50, page = 1) => {
    const supabase = createClient()
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    const { data, count } = await supabase
      .from('products')
      .select('id, name, slug, price, image_urls, item_type, is_active, is_featured, created_at, categories(name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)
    
    return { data, count, totalPages: count ? Math.ceil(count / limit) : 0 }
  },
  ['products-list'],
  { revalidate: 300, tags: ['products'] } // 5 minutes
)

// Cache featured curated products
export const getCachedFeaturedProducts = unstable_cache(
  async (limit = 4) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('products')
      .select('id, name, slug, price, image_urls, why_victory, item_type')
      .eq('item_type', 'curated')
      .eq('is_featured', true)
      .eq('is_active', true)
      .limit(limit)
    
    return data
  },
  ['featured-products'],
  { revalidate: 300, tags: ['products', 'featured'] }
)

// Cache categories
export const getCachedCategories = unstable_cache(
  async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug, display_order')
      .eq('is_active', true)
      .order('display_order')
    
    return data
  },
  ['categories-list'],
  { revalidate: 600, tags: ['categories'] } // 10 minutes - categories change less frequently
)

// Cache single product by slug
export const getCachedProduct = unstable_cache(
  async (slug: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('slug', slug)
      .single()
    
    return data
  },
  ['product-detail'],
  { revalidate: 300, tags: ['products'] }
)

// Cache dashboard stats
export const getCachedDashboardStats = unstable_cache(
  async () => {
    const supabase = createClient()
    
    const [
      { count: productsCount },
      { count: curatedCount },
      { count: shopCount },
      { count: categoriesCount }
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('item_type', 'curated'),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('item_type', 'shop'),
      supabase.from('categories').select('*', { count: 'exact', head: true })
    ])
    
    return {
      products: productsCount || 0,
      curated: curatedCount || 0,
      shop: shopCount || 0,
      categories: categoriesCount || 0
    }
  },
  ['dashboard-stats'],
  { revalidate: 60, tags: ['stats'] } // 1 minute - stats change more frequently
)

// Cache revalidation helper
export async function revalidateCache(tag: string) {
  'use server'
  const { revalidateTag } = await import('next/cache')
  revalidateTag(tag)
}
