import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import { AlertCircle, ArrowUpRight, Mail, MousePointerClick, Plus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Admin pages read live data per request — never prerender at build time. */
export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const [productsResult, offlineResult, subscribersResult, clicksResult, recentProductsResult, recentClicksResult] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', false),
    supabase.from('email_subscribers').select('id', { count: 'exact', head: true }).is('unsubscribed_at', null).eq('is_verified', true),
    supabase.from('click_tracking').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id,name,item_type,image_urls,created_at,is_active').order('created_at', { ascending: false }).limit(5),
    supabase.from('click_tracking').select('id,product_id,referrer,clicked_at').order('clicked_at', { ascending: false }).limit(5),
  ])

  const results = [productsResult, offlineResult, subscribersResult, clicksResult, recentProductsResult, recentClicksResult]
  const errors = results.flatMap((result) => result.error ? [result.error.message] : [])
  const clickedProductIds = [...new Set((recentClicksResult.data ?? []).map((click) => click.product_id).filter((id): id is string => Boolean(id)))]
  const clickProductsResult = clickedProductIds.length
    ? await supabase.from('products').select('id,name').in('id', clickedProductIds)
    : { data: [], error: null }
  if (clickProductsResult.error) errors.push(clickProductsResult.error.message)
  const clickProductNames = new Map((clickProductsResult.data ?? []).map((product) => [product.id, product.name]))
  const activeCount = productsResult.error ? null : productsResult.count ?? 0
  const subscriberCount = subscribersResult.error ? null : subscribersResult.count ?? 0
  const clickCount = clicksResult.error ? null : clicksResult.count ?? 0
  const offlineCount = offlineResult.error ? null : offlineResult.count ?? 0

  const stats = [
    { label: 'Active Products', value: activeCount, href: '/admin/products', icon: <ShoppingBag aria-hidden="true" size={19} strokeWidth={1.5} /> },
    { label: 'Confirmed Readers', value: subscriberCount, href: '/admin/subscribers', icon: <Mail aria-hidden="true" size={19} strokeWidth={1.5} /> },
    { label: 'Total Clicks', value: clickCount, href: '/admin/analytics', icon: <MousePointerClick aria-hidden="true" size={19} strokeWidth={1.5} /> },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="mb-1 font-section-header text-xs tracking-[0.2em] text-ink-muted">OVERVIEW</h2>
          <p className="font-display-hero text-4xl text-ink sm:text-5xl">Curator studio</p>
          <p className="mt-2 text-sm text-ink-muted">A quick view of your collection and readership.</p>
        </div>
        <Button asChild><Link href="/admin/products/new"><Plus className="mr-2 h-4 w-4" />Add a product</Link></Button>
      </div>

      {errors.length > 0 && <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"><p className="flex items-center gap-2 font-medium"><AlertCircle className="h-4 w-4" />Some dashboard data could not be loaded.</p><ul className="mt-2 list-inside list-disc text-amber-900">{[...new Set(errors)].map((error) => <li key={error}>{error}</li>)}</ul></div>}

      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="min-w-0 last:col-span-full lg:last:col-span-1">
            <Card className="group cursor-pointer transition-colors hover:border-primary/40">
              <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="font-section-header text-xs tracking-[0.15em] text-on-surface-variant">{stat.label}</CardTitle><span className="text-on-surface-variant transition-colors group-hover:text-primary">{stat.icon}</span></CardHeader>
              <CardContent><div className="font-button-label text-4xl font-medium tracking-tight text-primary">{stat.value === null ? '—' : String(stat.value).padStart(2, '0')}</div></CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="font-section-header text-xs tracking-[0.15em] text-on-surface-variant">Needs attention</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Link href="/admin/products" className="flex min-h-16 items-center justify-between rounded-md border border-outline-variant px-4 py-3 transition-colors hover:bg-surface-container"><span><span className="block text-sm font-medium text-on-background">Offline products</span><span className="text-xs text-on-surface-variant">Review unpublished picks</span></span><span className="font-button-label text-xl text-primary">{offlineCount === null ? '—' : offlineCount}</span></Link>
          <Link href="/admin/subscribers" className="flex min-h-16 items-center justify-between rounded-md border border-outline-variant px-4 py-3 transition-colors hover:bg-surface-container"><span><span className="block text-sm font-medium text-on-background">Subscriber list</span><span className="text-xs text-on-surface-variant">Check Dispatch readership</span></span><ArrowUpRight className="h-4 w-4 text-on-surface-variant" /></Link>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="font-section-header text-xs tracking-[0.15em] text-on-surface-variant">Recent Products</CardTitle></CardHeader><CardContent><div className="space-y-1">
          {recentProductsResult.error ? <p role="alert" className="py-4 text-center text-sm text-red-800">Products could not be loaded.</p> : recentProductsResult.data?.length ? recentProductsResult.data.map((product) => (
            <div key={product.id} className="flex min-w-0 items-center justify-between gap-2 rounded-md px-3 py-3 transition-colors hover:bg-surface-container">
              <div className="flex min-w-0 flex-1 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-surface-container">{product.image_urls?.[0] ? <Image src={product.image_urls[0]} alt="" width={40} height={40} className="h-full w-full object-cover" /> : <span className="font-button-label text-xs font-semibold text-primary">{product.name.charAt(0)}</span>}</div><div className="min-w-0"><p className="truncate text-sm font-medium text-on-background">{product.name}</p><p className="font-section-header text-[10px] tracking-[0.1em] text-on-surface-variant">{product.item_type} · {product.is_active ? 'Published' : 'Offline'}</p></div></div>
              <span className="shrink-0 font-section-header text-[10px] tracking-[0.1em] text-on-surface-variant">{new Date(product.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span><Link aria-label={`Edit ${product.name}`} href={`/admin/products/${product.id}/edit`} className="ml-1 text-on-surface-variant hover:text-primary"><ArrowUpRight className="h-4 w-4" /></Link>
            </div>
          )) : <p className="py-4 text-center text-sm text-on-surface-variant">No products yet. Add the first pick to begin.</p>}
        </div></CardContent></Card>

        <Card><CardHeader><CardTitle className="font-section-header text-xs tracking-[0.15em] text-on-surface-variant">Recent Clicks</CardTitle></CardHeader><CardContent><div className="space-y-1">
          {recentClicksResult.error ? <p role="alert" className="py-4 text-center text-sm text-red-800">Click activity could not be loaded.</p> : recentClicksResult.data?.length ? recentClicksResult.data.map((click) => (
            <div key={click.id} className="flex items-center justify-between gap-3 rounded-md px-3 py-3 transition-colors hover:bg-surface-container"><div className="flex min-w-0 items-center gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-surface-container"><MousePointerClick aria-hidden="true" className="h-4 w-4 text-primary" strokeWidth={1.5} /></div><div className="min-w-0"><p className="truncate text-sm font-medium text-on-background">{click.product_id ? clickProductNames.get(click.product_id) || 'Product no longer in catalog' : 'Unlinked click'}</p><p className="truncate font-section-header text-[10px] tracking-[0.1em] text-on-surface-variant">{click.referrer || 'Direct'}</p></div></div><span className="shrink-0 font-section-header text-[10px] tracking-[0.1em] text-on-surface-variant">{new Date(click.clicked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></div>
          )) : <p className="py-4 text-center text-sm text-on-surface-variant">No clicks have been recorded yet.</p>}
        </div></CardContent></Card>
      </div>
    </div>
  )
}
