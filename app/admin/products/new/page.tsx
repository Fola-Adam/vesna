import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/product-form'

/** Admin pages read live data per request — never prerender at build time. */
export const dynamic = 'force-dynamic'


export default async function NewProductPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('is_active', true)
    .order('display_order')

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-section-header text-on-surface-variant text-xs tracking-[0.2em] mb-1">Products</h2>
        <p className="font-audiowide text-2xl text-on-background">New Product</p>
      </div>

      <ProductForm categories={categories || []} />
    </div>
  )
}
