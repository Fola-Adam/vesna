import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, Mail, MousePointerClick, Plus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Admin pages read live data per request — never prerender at build time. */
export const dynamic = 'force-dynamic'


export default async function AdminDashboard() {
  const supabase = await createClient()

  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const { count: subscribersCount } = await supabase
    .from('email_subscribers')
    .select('*', { count: 'exact', head: true })
    .is('unsubscribed_at', null)

  const { data: recentClicks } = await supabase
    .from('click_tracking')
    .select('*')
    .order('clicked_at', { ascending: false })
    .limit(5)

  const { data: recentProducts } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  const { count: totalClicks } = await supabase
    .from('click_tracking')
    .select('*', { count: 'exact', head: true })

  const stats = [
    {
      label: 'Active Products',
      value: productsCount || 0,
      href: '/admin/products',
      icon: <ShoppingBag aria-hidden="true" size={19} strokeWidth={1.5} />,
    },
    {
      label: 'Email Subscribers',
      value: subscribersCount || 0,
      href: '/admin/subscribers',
      icon: <Mail aria-hidden="true" size={19} strokeWidth={1.5} />,
    },
    {
      label: 'Total Clicks',
      value: totalClicks || 0,
      href: '/admin/analytics',
      icon: <MousePointerClick aria-hidden="true" size={19} strokeWidth={1.5} />,
    },
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

      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="min-w-0 last:col-span-full lg:last:col-span-1">
          <Card className="group cursor-pointer transition-colors hover:border-primary/40">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="font-section-header text-xs tracking-[0.15em] text-on-surface-variant">
                  {stat.label}
                </CardTitle>
                <span className="text-on-surface-variant group-hover:text-primary transition-colors">{stat.icon}</span>
              </CardHeader>
              <CardContent>
                <div className="font-button-label text-4xl font-medium text-primary tracking-tight">
                  {String(stat.value).padStart(2, '0')}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-section-header text-xs tracking-[0.15em] text-on-surface-variant">
              Recent Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentProducts?.map((product) => (
                <div
                  key={product.id}
                  className="flex min-w-0 items-center justify-between gap-2 rounded-md px-3 py-3 hover:bg-surface-container transition-colors"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded bg-surface-container">
                    {product.image_urls?.[0] ? <Image src={product.image_urls[0]} alt="" width={40} height={40} className="h-full w-full object-cover" /> :
                    <span className="font-button-label text-xs font-semibold text-primary">
                      {product.name.charAt(0)}
                    </span>}
                    </div>
                    <div>
                      <p className="break-words text-sm font-medium text-on-background">{product.name}</p>
                      <p className="font-section-header text-[10px] text-on-surface-variant tracking-[0.1em]">
                        {product.item_type}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 font-section-header text-[10px] text-on-surface-variant tracking-[0.1em]">
                    {new Date(product.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <Link aria-label={`Edit ${product.name}`} href={`/admin/products/${product.id}/edit`} className="ml-2 text-on-surface-variant hover:text-primary"><ArrowUpRight className="h-4 w-4" /></Link>
                </div>
              )) || (
                <p className="text-sm text-on-surface-variant py-4 text-center">
                  No products yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-section-header text-xs tracking-[0.15em] text-on-surface-variant">
              Recent Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentClicks?.map((click) => (
                <div
                  key={click.id}
                  className="flex items-center justify-between py-3 px-3 rounded-md hover:bg-surface-container transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center">
                      <MousePointerClick aria-hidden="true" className="h-4 w-4 text-primary" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-on-background">
                        Product ID: <span className="font-mono text-xs">{click.product_id?.slice(0, 8)}</span>
                      </p>
                      <p className="font-section-header text-[10px] text-on-surface-variant tracking-[0.1em]">
                        {click.referrer || 'Direct'}
                      </p>
                    </div>
                  </div>
                  <span className="font-section-header text-[10px] text-on-surface-variant tracking-[0.1em]">
                    {new Date(click.clicked_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )) || (
                <p className="text-sm text-on-surface-variant py-4 text-center">
                  No clicks yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
