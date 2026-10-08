import type { Metadata } from 'next'
import { getProducts } from '@/lib/data'
import PicksBrowser from './picks-browser'
import { Suspense } from 'react'

/** ISR: catalog refreshes every 5 min; admin edits land within one revalidation cycle. */
export const revalidate = 300


export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'All Picks — Vesna Curated Living',
    description:
      'Everything Victory recommends, in one place: curated objects, courses, tools and more.',
    alternates: { canonical: '/picks' },
  }
}

export default async function CuratedPage() {
  const products = await getProducts()
  return <Suspense fallback={<p className="px-8 py-32">Loading picks…</p>}><PicksBrowser products={products} /></Suspense>
}
