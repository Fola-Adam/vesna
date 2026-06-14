'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = ['all', 'courses', 'ebooks', 'tools', 'templates', 'apps', 'finance', 'fashion', 'tech', 'home', 'food']
const ITEMS_PER_LOAD = 12

const CATEGORY_MAP: Record<string, string> = {
  'masterclass-digital-curation': 'courses',
  'the-heritage-silk-scarf': 'fashion',
  'the-heritage-silk-bag': 'fashion',
  'quiet-luxury-interiors': 'ebooks',
  'podcast-excellence-kit': 'tech',
  'vesna-signature-brewer': 'home',
  'quarterly-reset-system': 'templates',
  'leather-weekender-bag': 'fashion',
  'mechanical-keyboard-pro': 'tech',
  'heritage-leather-journal': 'tools',
  'artisan-ceramic-vessel': 'home',
  'brass-architect-lamp': 'home',
  'porcelain-ritual-mug': 'home',
  'dark-academia-desk': 'home',
  'masterclass-subscription-bundle': 'courses',
  'vintage-aviator-sunglasses': 'fashion',
  'handwoven-linen-throw': 'home',
  'artisan-coffee-subscription': 'food',
  'minimalist-wallet': 'fashion',
  'japanese-chef-knife-set': 'home',
  'cork-yoga-mat': 'fitness',
  'scented-soy-candle-trio': 'home',
  'wireless-charging-station': 'tech',
  'the-innovation-stack': 'ebooks',
  'italian-leather-backpack': 'fashion',
  'smart-plant-pot': 'home',
  'acoustic-guitar-limited': 'hobby',
  'productivity-planner': 'tools',
  'noise-canceling-headphones': 'tech',
  'handmade-throw-blanket': 'home',
  'digital-detox-kit': 'lifestyle',
  'standing-desk-converter': 'workspace',
  'vintage-film-camera': 'hobby',
  'the-daily-stoic-journal': 'ebooks',
  'kombucha-brewing-kit': 'food',
  'wool-travel-blanket': 'fashion',
  'blueprint-for-attention': 'courses',
  'espresso-machine-pro': 'home',
  'canvas-tote': 'fashion',
  'ergonomic-foot-rest': 'workspace',
  'saffron-starter-set': 'food',
  'resin-art-kit': 'hobby',
  'footwear-care-bundle': 'fashion',
  'hard-drive-enclosure': 'tech',
  'minimalist-desk-organizer': 'workspace',
  'heirloom-recipe-book': 'home',
  'indoor-herb-garden-kit': 'home',
  'the-curators-eye': 'ebooks',
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

interface Product {
  id: string
  name: string
  slug: string
  price: number | null
  image_urls: string[] | null
  item_type: string
  is_featured: boolean
  why_victory: string | null
  categories: { name: string }[] | null
}

export default function CuratedPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentCategory, setCurrentCategory] = useState('all')
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_LOAD)
  const supabase = createClient()

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, price, image_urls, item_type, is_featured, why_victory, categories(name)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setProducts(data as Product[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const filteredProducts = currentCategory === 'all' 
    ? products 
    : products.filter(p => p.item_type === currentCategory || p.categories?.[0]?.name === currentCategory || CATEGORY_MAP[toSlug(p.name)] === currentCategory)

  const displayedProducts = filteredProducts.slice(0, displayedCount)

  const handleCategoryChange = (category: string) => {
    setCurrentCategory(category)
    setDisplayedCount(ITEMS_PER_LOAD)
  }

  const handleLoadMore = () => {
    setDisplayedCount(prev => prev + ITEMS_PER_LOAD)
  }

  return (
    <div className="pt-20">
      {/* Hero Header */}
      <section className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-20 mb-16">
        <h1 className="font-display-hero text-4xl sm:text-5xl lg:text-6xl text-primary mb-4 italic">
          All picks
        </h1>
        <p className="font-body-main text-lg text-on-surface mb-6 opacity-70 font-light">
          Everything Victory recommends, in one place.
        </p>
        <span className="font-button-label text-xs tracking-widest text-outline uppercase">
          {products.length} picks
        </span>
      </section>

      {/* Filter Bar */}
      <div className="sticky top-[73px] z-40 bg-background py-6 mb-8 border-b border-outline-variant">
        <div className="px-5 sm:px-8 lg:px-20">
          <div className="flex items-center gap-4 overflow-x-auto hide-scrollbar">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`category-btn px-6 py-2 font-button-label uppercase text-[10px] tracking-widest whitespace-nowrap transition-colors ${
                  currentCategory === category
                    ? 'bg-primary text-on-primary'
                    : 'border border-outline-variant text-on-surface hover:border-primary'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Counter */}
      <div className="px-5 sm:px-8 lg:px-20 mb-8">
        <p className="font-button-label text-xs text-outline uppercase tracking-widest">
          Showing {displayedProducts.length} of {filteredProducts.length} picks
        </p>
      </div>

      {/* Product Grid */}
      <div className="px-5 sm:px-8 lg:px-20 mb-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface h-96 animate-pulse" />
            ))}
          </div>
        ) : displayedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-on-surface-variant py-12">
            No products found in this category.
          </p>
        )}
      </div>

      {/* Load More */}
      {displayedCount < filteredProducts.length && (
        <div className="flex justify-center mb-32 px-5 sm:px-8 lg:px-20">
          <button
            onClick={handleLoadMore}
            className="border border-outline-variant px-12 py-5 font-button-label uppercase tracking-[0.3em] text-[10px] hover:border-primary hover:text-primary transition-all"
          >
            Show more products
          </button>
        </div>
      )}
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/shop/${product.slug}`} className="group">
      <article className={`bg-surface flex flex-col ${product.is_featured ? 'border-t-2 border-primary' : ''}`}>
        {product.is_featured && (
          <div className="absolute top-4 left-4 z-10 bg-primary text-on-primary px-3 py-1 text-[9px] font-button-label uppercase tracking-widest">
            Featured
          </div>
        )}
        <div className="relative aspect-video overflow-hidden bg-surface-container">
          {product.image_urls?.[0] ? (
            <Image
              src={product.image_urls[0]}
              alt={product.name}
              fill
              className="object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-surface-container" />
          )}
        </div>
        <div className="p-8 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-4">
            <span className="text-primary font-button-label text-[10px] uppercase tracking-widest">
              {product.item_type}
            </span>
            <div className="text-right">
              <span className="text-primary text-sm font-medium">
                {product.price ? `$${product.price}` : 'Inquire'}
              </span>
            </div>
          </div>
          <h3 className="font-display-hero text-2xl text-on-surface mb-4">{product.name}</h3>
          {product.why_victory && (
            <p className="font-body-main text-on-surface-variant text-sm opacity-80 mb-8 line-clamp-2">
              {'"'}{product.why_victory}{'"'}
            </p>
          )}
          <button className="mt-auto w-full py-4 border border-primary text-primary font-button-label uppercase text-[10px] tracking-[0.2em] hover:bg-primary hover:text-on-primary transition-all duration-300">
            See this →
          </button>
        </div>
      </article>
    </Link>
  )
}