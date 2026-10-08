'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react'

const PAGE_SIZE = 20
interface Product { id: string; name: string; slug: string; price: number | null; image_urls: string[] | null; item_type: string; is_active: boolean; categories: { name: string }[] | null }

export default function ProductsPage() {
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [updating, setUpdating] = useState<string | null>(null)
  const search = useDebounce(query, 300)

  const fetchProducts = useCallback(async () => {
    if (!supabase) { setError('Supabase is not configured.'); setLoading(false); return }
    setLoading(true); setError(null)
    let request = supabase.from('products').select('id,name,slug,price,image_urls,item_type,is_active,categories(name)', { count: 'exact' }).order('created_at', { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
    if (search) request = request.ilike('name', `%${search}%`)
    if (status !== 'all') request = request.eq('is_active', status === 'active')
    if (type !== 'all') request = request.eq('item_type', type as 'curated' | 'shop' | 'archive')
    const { data, count: resultCount, error: requestError } = await request
    if (requestError) setError(requestError.message)
    else { setProducts((data as unknown as Product[]) || []); setCount(resultCount || 0) }
    setLoading(false)
  }, [supabase, page, search, status, type])

  useEffect(() => { void fetchProducts() }, [fetchProducts])
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE))

  async function togglePublished(product: Product) {
    if (!supabase) return
    setUpdating(product.id); setError(null)
    const { error: updateError } = await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id)
    if (updateError) setError(updateError.message)
    else setProducts((items) => items.map((item) => item.id === product.id ? { ...item, is_active: !item.is_active } : item))
    setUpdating(null)
  }

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.18em] text-ink-muted">Catalog</p><h1 className="mt-1 font-audiowide text-3xl text-ink">Products</h1><p className="mt-2 text-sm text-ink-muted">Manage the pieces in Vesna’s collection.</p></div><Button asChild><Link href="/admin/products/new"><Plus className="mr-2 h-4 w-4" />Add product</Link></Button></div>
    {error && <div role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
    <Card><CardContent className="p-0">
      <div className="flex flex-col gap-3 border-b border-outline-variant p-4 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" /><Input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder="Search products…" className="pl-9" /></div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} aria-label="Filter by publication status" className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="all">All statuses</option><option value="active">Published</option><option value="inactive">Offline</option></select>
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1) }} aria-label="Filter by collection" className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="all">All collections</option><option value="curated">Curated</option><option value="shop">Shop</option><option value="archive">Archive</option></select>
        <p className="shrink-0 text-sm text-on-surface-variant" aria-live="polite">{count} {count === 1 ? 'product' : 'products'}</p>
      </div>
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead><tr className="border-b border-outline-variant text-xs uppercase tracking-wider text-on-surface-variant"><th className="px-4 py-3 font-medium">Product</th><th className="px-4 py-3 font-medium">Category</th><th className="px-4 py-3 font-medium">Collection</th><th className="px-4 py-3 font-medium">Price</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 text-right font-medium">Manage</th></tr></thead>
      <tbody>{loading ? <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-on-surface-variant">Loading products…</td></tr> : products.length ? products.map((product) => <tr key={product.id} className="border-b border-outline-variant/60 last:border-0 hover:bg-surface-container/40"><td className="px-4 py-3"><div className="flex items-center gap-3">{product.image_urls?.[0] ? <div className="relative h-12 w-12 overflow-hidden rounded-md bg-background"><Image src={product.image_urls[0]} alt="" fill sizes="48px" className="object-cover" /></div> : <div className="h-12 w-12 rounded-md bg-background" />}<div><p className="font-medium text-on-background">{product.name}</p><p className="text-xs text-on-surface-variant">{product.slug}</p></div></div></td><td className="px-4 py-3 text-sm text-on-surface-variant">{product.categories?.[0]?.name || '—'}</td><td className="px-4 py-3 text-sm capitalize text-on-surface-variant">{product.item_type}</td><td className="px-4 py-3 text-sm text-on-background">{product.price == null ? '—' : `$${Number(product.price).toFixed(2)}`}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs ${product.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'}`}>{product.is_active ? 'Published' : 'Offline'}</span></td><td className="px-4 py-3"><div className="flex justify-end gap-2"><Button variant="outline" size="sm" disabled={updating === product.id} onClick={() => void togglePublished(product)}>{updating === product.id ? 'Saving…' : product.is_active ? 'Take offline' : 'Publish'}</Button><Button asChild size="sm"><Link href={`/admin/products/${product.id}/edit`}>Edit</Link></Button></div></td></tr>) : <tr><td colSpan={6} className="px-4 py-14 text-center"><p className="font-medium text-on-background">{count === 0 ? 'No products found' : 'No products on this page'}</p><p className="mt-1 text-sm text-on-surface-variant">Try clearing a filter or add a new product.</p></td></tr>}</tbody></table></div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant px-4 py-3"><p className="text-sm text-on-surface-variant">{count ? `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, count)} of ${count}` : 'No results'}</p><div className="flex items-center gap-2"><Button variant="outline" size="sm" aria-label="Previous page" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}><ChevronLeft className="h-4 w-4" /></Button><span className="text-sm text-on-surface-variant">{page} / {pages}</span><Button variant="outline" size="sm" aria-label="Next page" disabled={page >= pages || loading} onClick={() => setPage((current) => current + 1)}><ChevronRight className="h-4 w-4" /></Button></div></div>
    </CardContent></Card>
  </div>
}
