import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowUpRight, Plus } from 'lucide-react'
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
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      label: 'Email Subscribers',
      value: subscribersCount || 0,
      href: '/admin/subscribers',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Total Clicks',
      value: totalClicks || 0,
      href: '/admin/analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="mb-1 font-section-header text-xs tracking-[0.2em] text-ink-muted">OVERVIEW</h2>
          <p className="font-audiowide text-3xl text-ink">Curator studio</p>
          <p className="mt-2 text-sm text-ink-muted">A quick view of your collection and readership.</p>
        </div>
        <Button asChild><Link href="/admin/products/new"><Plus className="mr-2 h-4 w-4" />Add a product</Link></Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
          <Card className="group cursor-pointer transition-colors hover:border-primary/40">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="font-section-header text-xs tracking-[0.15em] text-on-surface-variant">
                  {stat.label}
                </CardTitle>
                <span className="text-on-surface-variant group-hover:text-primary transition-colors">{stat.icon}</span>
              </CardHeader>
              <CardContent>
                <div className="font-audiowide text-4xl text-primary tracking-wider">
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
                  className="flex items-center justify-between py-3 px-3 rounded-md hover:bg-surface-container transition-colors"
                >
                  <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded bg-surface-container">
                    {product.image_urls?.[0] ? <img src={product.image_urls[0]} alt="" className="h-full w-full object-cover" /> :
                    <span className="font-audiowide text-xs text-primary">
                      {product.name.charAt(0)}
                    </span>}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-on-background">{product.name}</p>
                      <p className="font-section-header text-[10px] text-on-surface-variant tracking-[0.1em]">
                        {product.item_type}
                      </p>
                    </div>
                  </div>
                  <span className="font-section-header text-[10px] text-on-surface-variant tracking-[0.1em]">
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
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                      </svg>
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
