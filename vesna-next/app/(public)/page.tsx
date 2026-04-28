import Link from 'next/link'
import Image from 'next/image'
import { getCachedFeaturedProducts, getCachedCategories } from '@/lib/supabase/cached-queries'

// ISR: Revalidate page every 5 minutes
export const revalidate = 300

export default async function HomePage() {
  // Use cached queries for better performance
  const featuredProducts = await getCachedFeaturedProducts(4)
  const categories = await getCachedCategories()

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        
        <div className="relative z-10 w-full px-5 sm:px-8 lg:px-20 py-32">
          <div className="max-w-screen-xl mx-auto text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-primary mb-6">
              Oracle:Atlas
            </p>
            <h1 className="font-display-hero text-4xl sm:text-5xl lg:text-7xl text-on-background mb-6">
              Objects with Purpose
            </h1>
            <p className="font-body-main text-lg text-on-surface-variant max-w-2xl mx-auto mb-8">
              Each item tells a story. Each purchase supports independent curation. 
              Victory's handpicked selection of exceptional products.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/curated"
                className="inline-block bg-primary text-on-primary font-button-label text-xs uppercase tracking-[0.2em] px-10 py-4 hover:bg-primary/80 transition-all"
              >
                Explore Curated
              </Link>
              <Link
                href="/shop"
                className="inline-block border border-primary/50 text-primary font-button-label text-xs uppercase tracking-[0.2em] px-10 py-4 hover:bg-primary/10 transition-all"
              >
                Browse All
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 px-5 sm:px-8 lg:px-20">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="font-section-header text-xs text-primary uppercase tracking-[0.2em] mb-12">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories?.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className="group p-6 bg-surface border border-outline-variant/30 hover:border-primary/50 transition-all text-center"
              >
                <span className="font-button-label text-sm text-on-surface group-hover:text-primary transition-colors">
                  {category.name}
                </span>
              </Link>
            )) || (
              // Fallback categories
              <>
                <Link href="/shop?category=tech" className="p-6 bg-surface border border-outline-variant/30 text-center">
                  <span className="font-button-label text-sm text-on-surface">Tech</span>
                </Link>
                <Link href="/shop?category=audio" className="p-6 bg-surface border border-outline-variant/30 text-center">
                  <span className="font-button-label text-sm text-on-surface">Audio</span>
                </Link>
                <Link href="/shop?category=lifestyle" className="p-6 bg-surface border border-outline-variant/30 text-center">
                  <span className="font-button-label text-sm text-on-surface">Lifestyle</span>
                </Link>
                <Link href="/shop?category=workspace" className="p-6 bg-surface border border-outline-variant/30 text-center">
                  <span className="font-button-label text-sm text-on-surface">Workspace</span>
                </Link>
                <Link href="/shop?category=travel" className="p-6 bg-surface border border-outline-variant/30 text-center">
                  <span className="font-button-label text-sm text-on-surface">Travel</span>
                </Link>
                <Link href="/shop?category=home" className="p-6 bg-surface border border-outline-variant/30 text-center">
                  <span className="font-button-label text-sm text-on-surface">Home</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Featured Curated */}
      <section className="py-20 px-5 sm:px-8 lg:px-20 bg-surface-dim">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="font-section-header text-xs text-primary uppercase tracking-[0.2em]">
              Victory's Picks
            </h2>
            <Link href="/curated" className="text-sm text-primary hover:text-primary/80">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts?.map((product) => (
              <ProductCard key={product.id} product={product} />
            )) || (
              <p className="col-span-4 text-center text-on-surface-variant py-8">
                No featured products yet. Check back soon!
              </p>
            )}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20 px-5 sm:px-8 lg:px-20">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="aspect-[4/5] bg-surface relative">
              <Image
                src="/vesna-imgs/native-cinematic-vase.png"
                alt="Ebenezer Victory"
                fill
                className="object-cover opacity-80"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">
                The Curator
              </p>
              <h2 className="font-display-hero text-3xl md:text-4xl text-on-background mb-6">
                Victory Ebenezer
              </h2>
              <p className="font-body-main text-lg text-on-surface-variant mb-6 leading-relaxed">
                Every product on Vesna has been personally selected, tested, and approved by me. 
                I believe in objects that serve a purpose beyond their function—items that tell 
                a story and bring intention to your space.
              </p>
              <Link
                href="/about"
                className="inline-block border border-primary/50 text-primary font-button-label text-xs uppercase tracking-[0.2em] px-8 py-3 hover:bg-primary/10 transition-all"
              >
                Read My Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-5 sm:px-8 lg:px-20 border-t border-outline-variant">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display-hero text-2xl text-on-background mb-4">
            Join the Inner Circle
          </h2>
          <p className="text-on-surface-variant mb-8">
            Weekly curated finds. No spam, ever.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 h-12 px-4 bg-surface border border-outline-variant text-on-background placeholder:text-on-surface-variant focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="h-12 px-8 bg-primary text-on-primary font-button-label text-xs uppercase tracking-[0.2em] hover:bg-primary/80 transition-all"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}

function ProductCard({ product }: { product: any }) {
  return (
    <Link href={`/shop/${product.slug}`} className="group">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface mb-4">
        {product.image_urls?.[0] ? (
          <Image
            src={product.image_urls[0]}
            alt={product.name}
            fill
            className="object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-surface-container" />
        )}
        {product.why_victory && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-xs text-white line-clamp-2">{product.why_victory}</p>
          </div>
        )}
      </div>
      <h3 className="font-body-main text-lg text-on-background mb-1">{product.name}</h3>
      <p className="text-sm text-on-surface-variant">
        {product.price ? `$${product.price}` : 'Inquire for price'}
      </p>
    </Link>
  )
}
