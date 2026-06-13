import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600

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

  const { data: related } = await supabase
    .from('products')
    .select('id, name, slug, price, image_urls, item_type')
    .neq('id', product.id)
    .eq('is_active', true)
    .limit(4)

  const relatedProducts = related ?? []

  return (
    <div>
      {/* Product Hero */}
      <section className="flex flex-col md:flex-row min-h-[600px]">
        <div className="w-full md:w-[60%] h-[400px] md:h-auto relative overflow-hidden bg-surface-container-lowest">
          {product.image_urls?.[0] ? (
            <Image src={product.image_urls[0]} alt={product.name} fill className="object-cover object-center hover:scale-105 transition-transform duration-1000" priority sizes="(max-width: 768px) 100vw, 60vw" />
          ) : (
            <div className="w-full h-full bg-surface-container" />
          )}
        </div>
        <div className="w-full md:w-[40%] flex flex-col justify-center px-8 md:px-16 py-16 bg-stone-950">
          <p className="text-xs text-[#95d4b3] uppercase tracking-[0.3em] mb-4 font-[family-name:var(--font-tenor-sans)]">{product.item_type}</p>
          <h1 className="font-audiowide text-4xl text-[#e5e2e1] mb-6">{product.name}</h1>
          <p className="font-[family-name:var(--font-spectral)] text-[#d0c5b2] leading-relaxed mb-8">{product.description}</p>
          <p className="text-2xl text-[#e6c364] font-medium mb-8">{product.price ? `$${product.price}` : 'Inquire'}</p>
          <a href="#" className="inline-block border border-[#95d4b3] text-[#95d4b3] px-8 py-3 text-xs uppercase tracking-[0.3em] hover:bg-[#95d4b3] hover:text-stone-950 transition-all">View Details</a>
        </div>
      </section>

      {/* Details */}
      <section className="px-5 sm:px-8 lg:px-20 py-24 max-w-screen-xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-[family-name:var(--font-cinzel)] text-sm uppercase tracking-[0.2em] text-[#e6c364] mb-4">Why Victory Chose This</h3>
            <p className="font-[family-name:var(--font-spectral)] text-[#c4b9a8] leading-relaxed">{product.why_victory || 'A carefully selected piece that embodies the Vesna standard.'}</p>
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-cinzel)] text-sm uppercase tracking-[0.2em] text-[#e6c364] mb-4">Details</h3>
            <p className="font-[family-name:var(--font-spectral)] text-[#c4b9a8] leading-relaxed">{product.material || 'Premium materials.'}</p>
            <p className="font-[family-name:var(--font-spectral)] text-[#c4b9a8] leading-relaxed mt-2">{product.dimensions || 'Standard dimensions.'}</p>
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-cinzel)] text-sm uppercase tracking-[0.2em] text-[#e6c364] mb-4">Category</h3>
            <p className="font-[family-name:var(--font-spectral)] text-[#c4b9a8] leading-relaxed">{product.categories?.[0]?.name || product.item_type}</p>
          </div>
        </div>
      </section>

      {/* Related */}
      {relatedProducts.length > 0 && (
        <section className="px-5 sm:px-8 lg:px-20 pb-32 max-w-screen-xl mx-auto">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl uppercase tracking-[0.3em] text-[#e5e2e1] mb-12">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <Link key={p.id} href={`/shop/${p.slug}`} className="group">
                <div className="aspect-square overflow-hidden bg-surface-container mb-4">
                  {p.image_urls?.[0] && <Image src={p.image_urls[0]} alt={p.name} fill className="object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 50vw, 25vw" />}
                </div>
                <p className="text-xs text-[#95d4b3] uppercase tracking-widest mb-1">{p.item_type}</p>
                <p className="font-audiowide text-lg text-[#e5e2e1] group-hover:text-[#e6c364] transition-colors">{p.name}</p>
                {p.price && <p className="text-sm text-[#d0c5b2] mt-1">${p.price}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}