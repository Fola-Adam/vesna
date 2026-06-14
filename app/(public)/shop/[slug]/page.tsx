'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { PICKS, toSlug } from '@/lib/shop-data'

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const product = useMemo(() => {
    return PICKS.find((p) => toSlug(p.name) === slug) || null
  }, [slug])

  if (!product) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-5">
        <div className="text-center">
          <h1 className="font-audiowide text-4xl text-primary mb-4">Product Not Found</h1>
          <p className="font-body-main text-on-surface-variant mb-8">This pick doesn&apos;t seem to exist.</p>
          <Link href="/shop" className="border border-primary px-8 py-4 text-primary font-button-label text-xs uppercase tracking-widest hover:bg-primary hover:text-black transition-all">
            Back to Shop
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-12 font-button-label text-[10px] uppercase tracking-widest text-outline">
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-primary">{product.category}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover grayscale-[10%]"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {product.badge && (
              <div className={`absolute top-4 left-4 z-10 px-3 py-1 text-[9px] font-button-label uppercase tracking-widest ${
                product.badge === "Victory's pick" ? 'bg-primary text-black' : 'bg-secondary-container text-on-secondary-container'
              }`}>
                {product.badge}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <span className="text-primary font-button-label text-[10px] uppercase tracking-widest mb-4">{product.category}</span>
            <h1 className="font-audiowide text-2xl lg:text-3xl text-on-background mb-4">{product.name}</h1>

            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-spectral text-xl text-primary">{product.price}</span>
              {product.originalPrice && (
                <span className="font-spectral text-sm text-outline line-through">{product.originalPrice}</span>
              )}
            </div>

            <p className="font-playfair text-on-surface-variant text-sm italic leading-relaxed mb-8">
              &ldquo;{product.quote}&rdquo;
            </p>

            {product.category === 'courses' && (
              <div className="border-t border-outline-variant pt-8 mb-8">
                <h3 className="font-button-label text-[10px] uppercase tracking-widest text-outline mb-4">What&apos;s Included</h3>
                <ul className="space-y-3 font-body-main text-sm text-on-surface-variant">
                  <li className="flex items-center gap-3">
                    <span className="w-1 h-1 bg-primary rounded-full" />
                    Lifetime access with future updates
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1 h-1 bg-primary rounded-full" />
                    Downloadable resources and templates
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1 h-1 bg-primary rounded-full" />
                    Community access
                  </li>
                </ul>
              </div>
            )}

            <button className="w-full py-5 border border-primary text-primary font-button-label uppercase text-xs tracking-[0.2em] hover:bg-primary hover:text-black transition-all duration-300">
              Purchase &mdash; {product.price}
            </button>

            <p className="text-center text-outline/50 text-[10px] font-button-label mt-4 uppercase tracking-wider">
              Secure checkout via affiliate partner
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
