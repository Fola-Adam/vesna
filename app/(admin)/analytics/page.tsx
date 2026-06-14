import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AnalyticsPage() {
  const supabase = createClient()

  const { data: dailyStats } = await supabase
    .from('click_tracking')
    .select('clicked_at')
    .order('clicked_at', { ascending: false })

  const { data: productClicks } = await supabase
    .from('click_tracking')
    .select('product_id, clicked_at')
    .not('product_id', 'is', null)

  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .in('id', Array.from(new Set(productClicks?.map(c => c.product_id) || [])))

  const { data: referrers } = await supabase
    .from('click_tracking')
    .select('referrer')
    .not('referrer', 'is', null)

  // Aggregate daily clicks
  const dailyMap = new Map<string, number>()
  dailyStats?.forEach((c) => {
    const day = new Date(c.clicked_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
    dailyMap.set(day, (dailyMap.get(day) || 0) + 1)
  })
  const dailyData = Array.from(dailyMap.entries()).slice(0, 14).reverse()

  // Aggregate by product
  const productMap = new Map<string, number>()
  productClicks?.forEach((c) => {
    if (c.product_id) {
      productMap.set(c.product_id, (productMap.get(c.product_id) || 0) + 1)
    }
  })
  const productData = Array.from(productMap.entries())
    .map(([id, count]) => {
      const product = products?.find(p => p.id === id)
      return { name: product?.name || id.slice(0, 8), count }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // Aggregate referrers
  const referrerMap = new Map<string, number>()
  referrers?.forEach((c) => {
    const r = c.referrer || 'Unknown'
    referrerMap.set(r, (referrerMap.get(r) || 0) + 1)
  })
  const referrerData = Array.from(referrerMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const totalClicks = dailyStats?.length || 0
  const maxDaily = Math.max(...dailyData.map(d => d[1]), 1)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-section-header text-on-surface-variant text-xs tracking-[0.2em] mb-1">Insights</h2>
        <p className="font-audiowide text-2xl text-on-background">Analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-section-header text-xs tracking-[0.15em] text-on-surface-variant">
              Total Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-audiowide text-4xl text-primary tracking-wider">
              {String(totalClicks).padStart(2, '0')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-section-header text-xs tracking-[0.15em] text-on-surface-variant">
              Unique Products Clicked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-audiowide text-4xl text-primary tracking-wider">
              {String(productMap.size).padStart(2, '0')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-section-header text-xs tracking-[0.15em] text-on-surface-variant">
              Avg Daily Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-audiowide text-4xl text-primary tracking-wider">
              {String(Math.round(totalClicks / Math.max(dailyData.length, 1))).padStart(2, '0')}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-section-header text-xs tracking-[0.15em] text-on-surface-variant">
              Daily Clicks (Last 14 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dailyData.map(([day, count]) => (
                <div key={day} className="flex items-center gap-3">
                  <span className="font-section-header text-[10px] text-on-surface-variant w-16 shrink-0 tracking-[0.1em]">
                    {day}
                  </span>
                  <div className="flex-1 h-6 bg-surface-container rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-sm transition-all"
                      style={{ width: `${(count / maxDaily) * 100}%` }}
                    />
                  </div>
                  <span className="font-audiowide text-xs text-on-background w-6 text-right">
                    {count}
                  </span>
                </div>
              ))}
              {dailyData.length === 0 && (
                <p className="text-sm text-on-surface-variant text-center py-4">No click data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-section-header text-xs tracking-[0.15em] text-on-surface-variant">
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {productData.map((product, i) => (
                <div key={product.name} className="flex items-center gap-3">
                  <span className="font-audiowide text-xs text-primary w-6 shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm text-on-background flex-1 truncate">{product.name}</span>
                  <span className="font-audiowide text-xs text-on-surface-variant">{product.count}</span>
                </div>
              ))}
              {productData.length === 0 && (
                <p className="text-sm text-on-surface-variant text-center py-4">No product data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-section-header text-xs tracking-[0.15em] text-on-surface-variant">
              Top Referrers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {referrerData.map(([referrer, count]) => (
                <div key={referrer} className="flex items-center justify-between py-1">
                  <span className="text-sm text-on-background truncate">{referrer}</span>
                  <span className="font-audiowide text-xs text-primary">{count}</span>
                </div>
              ))}
              {referrerData.length === 0 && (
                <p className="text-sm text-on-surface-variant text-center py-4">No referrer data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
