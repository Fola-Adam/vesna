'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { useDebounce } from '@/hooks/use-debounce'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const ITEMS_PER_PAGE = 20

interface Product {
  id: string
  name: string
  slug: string
  price: number | null
  image_urls: string[] | null
  item_type: string
  is_active: boolean
  categories: { name: string }[] | null
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  const debouncedSearch = useDebounce(searchQuery, 300)
  const supabase = createClient()
  
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    
    const from = (currentPage - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1
    
    let query = supabase
      .from('products')
      .select('id, name, slug, price, image_urls, item_type, is_active, categories(name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)
    
    if (debouncedSearch) {
      query = query.ilike('name', `%${debouncedSearch}%`)
    }
    
    const { data, count, error } = await query
    
    if (!error) {
      setProducts((data as unknown as Product[]) || [])
      setTotalCount(count || 0)
    }
    
    setLoading(false)
  }, [debouncedSearch, currentPage, supabase])
  
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])
  
  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch])
  
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-on-background">Products</h2>
        <Link href="/admin/products/new" prefetch={false}>
          <Button>Add Product</Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search products..."
              className="max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {loading && <span className="text-sm text-on-surface-variant">Loading...</span>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">Price</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-on-surface-variant">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  // Skeleton loading state
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-outline-variant/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-10 h-10 rounded" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="py-3 px-4 text-right"><Skeleton className="h-8 w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-outline-variant/30 hover:bg-surface-container/50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {product.image_urls?.[0] ? (
                            <div className="relative w-10 h-10 rounded overflow-hidden">
                              <Image
                                src={product.image_urls[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded bg-surface-container" />
                          )}
                          <div>
                            <p className="font-medium text-on-background">{product.name}</p>
                            <p className="text-sm text-on-surface-variant">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant">
                        {product.categories?.[0]?.name || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {product.item_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-on-background">
                        {product.price ? `$${product.price}` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.is_active
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-stone-500/10 text-stone-500'
                          }`}
                        >
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/admin/products/${product.id}/edit`} prefetch={false}>
                          <Button className="h-8 px-3 text-sm">
                            Edit
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-on-surface-variant">
                      {debouncedSearch ? 'No products match your search.' : 'No products yet. Add your first product to get started.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-outline-variant">
              <p className="text-sm text-on-surface-variant">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  className="h-8 w-8 p-0 border border-outline-variant"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-on-surface-variant px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  className="h-8 w-8 p-0 border border-outline-variant"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
