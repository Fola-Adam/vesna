import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getProducts } from '@/lib/data'
import ShopBrowser, { type ShopProduct } from './shop-browser'

/** ISR: catalog refreshes every 5 min; admin edits land within one revalidation cycle. */
export const revalidate = 300


export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Vesna Picks — Curated Products by Victory Ebenezer',
    description:
      "Victory's personal recommendations: courses, tools, fashion, tech and home objects with purpose.",
    alternates: { canonical: '/shop' },
    openGraph: {
      title: 'Vesna Picks',
      description: "Victory's personal recommendations — objects with purpose.",
      url: '/shop',
    },
  }
}

export default async function ShopPage() {
  const products = (await getProducts()) as unknown as ShopProduct[]

  return (
    <Suspense fallback={<ShopBrowser products={[]} loading />}>
      <ShopBrowser products={products} />
    </Suspense>
  )
}
