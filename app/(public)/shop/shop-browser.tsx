'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import VenusTriggerPill from '@/components/VenusTriggerPill'
import { formatPrice, effectivePricing } from '@/lib/pricing'

export interface ShopProduct {
  id: string
  slug: string
  name: string
  price: number | null
  sale_price: number | null
  image_urls: string[] | null
  why_victory: string | null
  item_type: string
  is_featured: boolean
  categories: { name: string } | null
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'courses', label: 'Courses' },
  { id: 'ebooks', label: 'Ebooks' },
  { id: 'tools', label: 'Tools' },
  { id: 'templates', label: 'Templates' },
  { id: 'apps', label: 'Apps' },
  { id: 'finance', label: 'Finance' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'tech', label: 'Tech' },
  { id: 'home', label: 'Home' },
  { id: 'food', label: 'Food' },
]

const ITEMS_PER_PAGE = 12

export default function ShopBrowser({
  products,
  loading = false,
}: {
  products: ShopProduct[]
  loading?: boolean
}) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE)

  const filteredProducts = useMemo(
    () =>
      activeCategory === 'all'
        ? products
        : products.filter((p) => p.categories?.name?.toLowerCase() === activeCategory),
    [products, activeCategory]
  )

  const displayedProducts = filteredProducts.slice(0, displayedCount)
  const hasMore = displayedCount < filteredProducts.length

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    setDisplayedCount(ITEMS_PER_PAGE)
  }

  return (
    <>
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <main className="bg-background font-[family-name:var(--font-spectral)] antialiased selection:bg-primary selection:text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
          {/* Hero Header */}
          <section className="max-w-3xl mb-16">
            <h1 className="font-audiowide text-4xl text-primary mb-4">Vesna Picks</h1>
            <p className="font-[family-name:var(--font-spectral)] text-base text-on-background mb-6 opacity-70 font-light">
              Victory&apos;s personal recommendations.
            </p>
            <span className="font-[family-name:var(--font-tenor-sans)] text-xs tracking-widest text-outline uppercase">
              {loading ? 'Loading…' : `${products.length} picks`}
            </span>
          </section>

          {/* Filter Bar */}
          <div className="sticky top-[97px] z-40 bg-background py-6 mb-8 border-b border-outline-variant">
            <div className="flex items-center gap-4 overflow-x-auto hide-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-6 py-2 font-[family-name:var(--font-tenor-sans)] uppercase text-[10px] tracking-widest whitespace-nowrap transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-primary text-black'
                      : 'border border-outline-variant text-on-background hover:border-primary'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Counter */}
          <div className="mb-8">
            <p className="font-[family-name:var(--font-tenor-sans)] text-xs text-outline uppercase tracking-widest">
              Showing {displayedProducts.length} of {filteredProducts.length} picks
            </p>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-6 mb-12">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-surface-container h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-6 mb-12">
              {displayedProducts.map((product) => {
                const { price, strike } = effectivePricing(product as never)
                return (
                  <Link key={product.id} href={`/shop/${product.slug}`} className="block">
                    <article
                      className={`bg-surface-container group relative flex flex-col ${
                        product.is_featured ? 'border-t-2 border-primary' : ''
                      }`}
                    >
                      {product.is_featured && (
                        <div className="absolute top-4 left-4 z-10 px-3 py-1 text-[9px] font-[family-name:var(--font-tenor-sans)] uppercase tracking-widest bg-primary text-black">
                          Victory&apos;s pick
                        </div>
                      )}
                      <div className="relative aspect-video overflow-hidden cursor-pointer">
                        {product.image_urls?.[0] ? (
                          <Image
                            alt={product.name}
                            src={product.image_urls[0]}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-surface-container" />
                        )}
                        <VenusTriggerPill productName={product.name} />
                      </div>
                      <div className="p-5 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-primary font-[family-name:var(--font-tenor-sans)] text-[10px] uppercase tracking-widest">
                            {product.categories?.name ?? product.item_type}
                          </span>
                          <div className="text-right">
                            {strike != null && (
                              <span className="text-outline line-through text-xs mr-2 font-[family-name:var(--font-spectral)]">
                                {formatPrice(strike)}
                              </span>
                            )}
                            <span className="text-primary text-sm font-medium font-[family-name:var(--font-spectral)]">
                              {formatPrice(price)}
                            </span>
                          </div>
                        </div>
                        <h3 className="font-audiowide text-lg text-on-background mb-3">
                          {product.name}
                        </h3>
                        {product.why_victory && (
                          <p className="font-[family-name:var(--font-playfair)] text-on-surface-variant text-sm italic opacity-80 mb-4 line-clamp-2">
                            &ldquo;{product.why_victory}&rdquo;
                          </p>
                        )}
                        <span className="mt-auto w-full py-4 text-center border border-primary text-primary font-[family-name:var(--font-tenor-sans)] uppercase text-[10px] tracking-[0.2em] group-hover:bg-primary group-hover:text-black transition-all duration-300">
                          See this →
                        </span>
                      </div>
                    </article>
                  </Link>
                )
              })}
              {filteredProducts.length === 0 && (
                <p className="col-span-full text-center text-on-surface-variant py-12">
                  No products found in this category.
                </p>
              )}
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mb-32">
              <button
                onClick={() => setDisplayedCount((prev) => prev + ITEMS_PER_PAGE)}
                className="border border-outline-variant px-12 py-5 font-[family-name:var(--font-tenor-sans)] uppercase tracking-[0.3em] text-[10px] hover:border-primary hover:text-primary transition-all text-on-background"
              >
                Show more products
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
