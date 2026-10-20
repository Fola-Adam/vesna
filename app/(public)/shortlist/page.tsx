import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getProducts } from '@/lib/data'
import PicksBrowser from '../picks/picks-browser'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {title: 'Your Shortlist', description: 'Keep, compare, and revisit your favourite Vesna picks.', robots: {index:false,follow:false}}
export default async function ShortlistPage() {
  const client=await createClient()
  const {data:{user}}=await client.auth.getUser()
  if(!user || user.is_anonymous || !user.email_confirmed_at) redirect('/member?next=%2Fshortlist')
  const products = await getProducts()
  return <Suspense fallback={<p className="px-8 py-32">Loading your shortlist…</p>}><PicksBrowser products={products} shortlistMode /></Suspense>
}
