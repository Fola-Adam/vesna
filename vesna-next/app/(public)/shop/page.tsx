'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = ['all', 'tech', 'audio', 'lifestyle', 'workspace', 'travel', 'home']

interface Product {
  id: string
  name: string
  slug: string
  price: number | null
  image_urls: string[] | null
  item_type: string
  is_active: boolean
  why_victory: string | null
  categories: { name: string }[] | null
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentCategory, setCurrentCategory] = useState('all')
  const supabase = createClient()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, price, image_urls, item_type, is_active, why_victory, categories(name)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setProducts(data as Product[])
    }
    setLoading(false)
  }

  const filteredProducts = currentCategory === 'all'
    ? products
    : products.filter(p => p.item_type === currentCategory || p.categories?.[0]?.name === currentCategory)

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center bg-surface-dim">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/vesna-imgs/editorial-luxurious-workspace.png"
            alt="Shop"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background" />
        </div>
        <div className="relative z-10 text-center px-5 max-w-4xl mx-auto pt-24">
          <p className="font-button-label text-xs text-secondary uppercase tracking-[0.3em] mb-4">
            The Collection
          </p>
          <h1 className="font-display-hero text-4xl sm:text-5xl lg:text-6xl text-on-background mb-6">
            Shop All
          </h1>
          <p className="font-body-main text-lg text-on-surface-variant max-w-2xl mx-auto">
            Browse our curated selection of exceptional objects for intentional living.
          </p>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-8 px-5 sm:px-8 lg:px-20 border-b border-surface-container">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-wrap gap-4 justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCurrentCategory(cat)}
                className={`font-button-label text-xs uppercase tracking-[0.15em] px-4 py-2 border border-outline/30 transition-all ${
                  currentCategory === cat
                    ? 'text-primary border-primary'
                    : 'text-on-surface-variant hover:text-primary hover:border-primary'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-16 lg:py-24 px-5 sm:px-8 lg:px-20">
        <div className="max-w-screen-xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-surface h-96 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-on-surface-variant py-12">
              No products found in this category.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/shop/${product.slug}`} className="group">
      <article className="bg-surface flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
          {product.image_urls?.[0] ? (
            <Image
              src={product.image_urls[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-surface-container" />
          )}
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <span className="text-primary font-button-label text-[10px] uppercase tracking-widest mb-2">
            {product.item_type}
          </span>
          <h3 className="font-display-hero text-xl text-on-background mb-3 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {product.why_victory && (
            <p className="font-body-main text-sm text-on-surface-variant mb-4 line-clamp-2">
              "{product.why_victory}"
            </p>
          )}
          <div className="mt-auto flex justify-between items-center">
            <span className="text-primary text-sm font-medium">
              {product.price ? `$${product.price}` : 'Inquire'}
            </span>
            <span className="material-symbols-outlined text-primary text-sm">arrow_forward</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
