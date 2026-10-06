import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/product-form'

/** Admin pages read live data per request — never prerender at build time. */
export const dynamic = 'force-dynamic'


export default async function EditProductPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const [productResult, categoriesResult] = await Promise.all([
    supabase.from('products').select('*').eq('id', params.id).single(),
    supabase.from('categories').select('id, name').eq('is_active', true).order('display_order'),
  ])

  if (!productResult.data) {
    notFound()
  }

  const product = productResult.data

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-section-header text-on-surface-variant text-xs tracking-[0.2em] mb-1">Products</h2>
        <p className="font-audiowide text-2xl text-on-background">Edit Product</p>
      </div>

      <ProductForm
        categories={categoriesResult.data || []}
        initialData={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price?.toString() || '',
          sale_price: product.sale_price?.toString() || '',
          affiliate_link: product.affiliate_link,
          category_id: product.category_id,
          image_urls: product.image_urls || [],
          why_victory: product.why_victory,
          item_type: product.item_type,
          is_featured: product.is_featured,
          is_active: product.is_active,
        }}
      />
    </div>
  )
}
