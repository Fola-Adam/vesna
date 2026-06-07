import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

// ISR: Revalidate page every hour
export const revalidate = 3600

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number | null
  image_urls: string[] | null
  item_type: string
  is_active: boolean
  why_victory: string | null
  material: string | null
  dimensions: string | null
  categories: { name: string }[] | null
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  
  const { data: product, error } = await supabase
    .from('products')
    .select('id, name, slug, description, price, image_urls, item_type, is_active, why_victory, material, dimensions, categories(name)')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (error || !product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.id, product.categories?.[0]?.name)

  return (
    <div>
      {/* Product Hero Section */}
      <section className="flex flex-col md:flex-row min-h-[600px]">
        {/* Left Image Column (60%) */}
        <div className="w-full md:w-[60%] h-[400px] md:h-auto relative overflow-hidden bg-surface-container-lowest">
          {product.image_urls?.[0] ? (
            <Image
              src={product.image_urls[0]}
              alt={product.name}
              fill
              className="object-cover object-center hover:scale-105 transition-transform duration-1000"
              priority
            />
          ) : (
            <div className="w-full h-full bg-surface-container" />
          )}
        </div>
        
        {/* Right Info Column (40%) */}
        <div className="w-full md:w-[40%] flex flex-col justify-center px-8 md:px-16 py-16 bg-stone-950">
          <span className="font-button-label text-xs text-outline mb-6 tracking-[0.3em] uppercase">
            {product.item_type}
          </span>
          <h1 className="font-display-hero text-3xl md:text-4xl lg:text-5xl italic text-on-background mb-4 leading-tight">
            {product.name}
          </h1>
          <p className="font-display-hero text-2xl text-primary mb-12 tracking-wide">
            {product.price ? `$${product.price}` : 'Inquire for price'}
          </p>
          
          {product.why_victory && (
            <div className="mb-12 border-l border-primary/30 pl-6">
              <p className="font-body-main text-on-surface-variant leading-relaxed opacity-80 italic">
                {'“'}{product.why_victory}{'”'}
              </p>
              <cite className="block mt-4 font-button-label text-[10px] uppercase tracking-widest text-outline not-italic">
                — Ebenezer Victory
              </cite>
            </div>
          )}
          
          <div className="flex flex-col gap-8">
            <button className="bg-primary text-on-primary font-button-label py-5 px-10 tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-primary/80 transition-all duration-300 transform active:scale-95">
              GET THIS
              <span className="material-symbols-outlined text-lg">arrow_right_alt</span>
            </button>
            
            <div className="flex items-center gap-12 pt-8 opacity-40">
              {product.material && (
                <div className="flex flex-col gap-2">
                  <span className="font-button-label text-[10px] tracking-widest uppercase">Material</span>
                  <span className="font-button-label text-[9px]">{product.material}</span>
                </div>
              )}
              {product.dimensions && (
                <div className="flex flex-col gap-2">
                  <span className="font-button-label text-[10px] tracking-widest uppercase">Dimensions</span>
                  <span className="font-button-label text-[9px]">{product.dimensions}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Sections */}
      {product.description && (
        <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-20 py-20 lg:py-32 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          <div className="space-y-8">
            <h3 className="font-button-label text-xs tracking-[0.4em] text-primary border-b border-primary/20 pb-4 inline-block">
              WHAT IT IS
            </h3>
            <p className="font-body-main text-on-surface-variant leading-loose whitespace-pre-line">
              {product.description}
            </p>
          </div>
          <div className="space-y-8">
            <h3 className="font-button-label text-xs tracking-[0.4em] text-primary border-b border-primary/20 pb-4 inline-block">
              WHO IT&apos;S FOR
            </h3>
            <p className="font-body-main text-on-surface-variant leading-loose">
              Designed for the intentional minimalist and the connoisseur of
              quality. Whether you are elevating your daily rituals or seeking
              a piece that speaks to your aesthetic philosophy, this object is
              for those who find beauty in the permanent and the meaningful.
            </p>
          </div>
        </section>
      )}

      {/* Editorial Feature */}
      <section className="px-5 sm:px-8 lg:px-20 pb-20 lg:pb-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 relative h-[400px] md:h-[500px] overflow-hidden">
            <Image
              src="/vesna-imgs/editorial-luxurious-workspace.png"
              alt="Atelier workspace"
              fill
              className="object-cover grayscale opacity-50"
            />
            <div className="absolute inset-0 bg-stone-950/40 flex items-center px-8 md:px-16">
              <div className="max-w-md">
                <h2 className="font-display-hero text-2xl md:text-3xl lg:text-4xl italic mb-6">
                  Born of Fire & Silence
                </h2>
                <p className="font-body-main text-sm md:text-base text-on-surface-variant mb-8 leading-relaxed">
                  Discover the journey of exceptional craftsmanship from raw
                  materials to your space.
                </p>
                <Link
                  href="/journal"
                  className="font-button-label text-xs text-primary border-b border-primary hover:text-white hover:border-white transition-all"
                >
                  READ THE EDITORIAL
                </Link>
              </div>
            </div>
          </div>
          <div className="md:col-span-4 bg-surface-container/10 backdrop-blur border border-primary/20 p-8 md:p-12 flex flex-col justify-end">
            <span className="material-symbols-outlined text-primary mb-6 text-4xl">
              workspace_premium
            </span>
            <h4 className="font-button-label text-xs mb-4 tracking-widest text-white uppercase">
              ATELIER GUARANTEE
            </h4>
            <p className="font-body-main text-sm text-stone-400">
              Every piece comes with a certificate of authenticity and our
              commitment to quality and customer satisfaction.
            </p>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="bg-surface-container-lowest py-20 lg:py-32 px-5 sm:px-8 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display-hero text-3xl md:text-4xl italic text-center mb-16 tracking-widest">
              You might also like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {relatedProducts.map((related) => (
                <Link key={related.id} href={`/shop/${related.slug}`} className="group cursor-pointer">
                  <div className="aspect-[3/4] overflow-hidden mb-6 bg-surface border border-outline-variant">
                    {related.image_urls?.[0] ? (
                      <Image
                        src={related.image_urls[0]}
                        alt={related.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-container" />
                    )}
                  </div>
                  <p className="font-button-label text-[10px] tracking-widest text-outline mb-2 uppercase">
                    {related.item_type}
                  </p>
                  <h3 className="font-display-hero text-xl mb-2">{related.name}</h3>
                  <p className="font-body-main text-primary">
                    {related.price ? `$${related.price}` : 'Inquire'}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

async function getRelatedProducts(currentId: string) {
  const supabase = createClient()
  
  const { data } = await supabase
    .from('products')
    .select('id, name, slug, price, image_urls, item_type')
    .neq('id', currentId)
    .eq('is_active', true)
    .limit(3)

  return data as Product[] | null
}
