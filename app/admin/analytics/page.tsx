import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

function dayKey(date: Date) { return date.toISOString().slice(0, 10) }

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const now = new Date()
  const start = new Date(now)
  start.setUTCHours(0, 0, 0, 0)
  start.setUTCDate(start.getUTCDate() - 13)
  const since = dayKey(start)
  const [{ data: dailyStats, error: dailyError }, { data: productStats, error: productError }, { data: referrerStats, error: referrerError }] = await Promise.all([
    supabase.from('daily_click_stats').select('date,total_clicks').gte('date', since).lte('date', dayKey(now)).order('date', { ascending: true }).limit(14),
    supabase.from('product_click_stats').select('product_id,total_clicks').gte('click_date', since).lte('click_date', dayKey(now)).order('total_clicks', { ascending: false }).limit(8),
    supabase.from('referrer_click_stats').select('referrer,total_clicks').gte('click_date', since).lte('click_date', dayKey(now)).order('total_clicks', { ascending: false }).limit(5),
  ])

  const errors = [dailyError, productError, referrerError].filter(Boolean).map((error) => error!.message)
  const dailyByDate = new Map((dailyStats ?? []).map((row) => [String(row.date).slice(0, 10), Number(row.total_clicks ?? 0)]))
  const dailyData = Array.from({ length: 14 }, (_, index) => {
    const day = new Date(start)
    day.setUTCDate(start.getUTCDate() + index)
    return { key: dayKey(day), day: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }), clicks: dailyByDate.get(dayKey(day)) ?? 0 }
  })
  const productIds = (productStats ?? []).map((row: { product_id: string }) => row.product_id).filter(Boolean)
  const { data: products, error: namesError } = productIds.length ? await supabase.from('products').select('id,name').in('id', productIds) : { data: [], error: null }
  if (namesError) errors.push(namesError.message)
  const productNames = new Map((products ?? []).map((product) => [product.id, product.name]))
  const productData = (productStats ?? []).map((row: { product_id: string; total_clicks: number }) => ({ name: productNames.get(row.product_id) ?? 'Product no longer in catalog', count: Number(row.total_clicks) }))
  const referrerData = (referrerStats ?? []).map((row: { referrer: string | null; total_clicks: number }) => [row.referrer || 'Direct', Number(row.total_clicks)] as const)
  const totalClicks = dailyData.reduce((sum, row) => sum + row.clicks, 0)
  const uniqueProducts = new Set((productStats ?? []).map((row: { product_id: string }) => row.product_id).filter(Boolean)).size
  const maxDaily = Math.max(...dailyData.map((row) => row.clicks), 1)

  return <div className="space-y-8">
    <div><h2 className="mb-1 font-section-header text-xs tracking-[0.2em] text-ink-muted">INSIGHTS</h2><p className="font-display-hero text-4xl text-ink">Analytics</p><p className="mt-2 text-sm text-ink-muted">A consistent 14-day view of collection activity.</p></div>
    {errors.length > 0 && <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"><p className="font-medium">Some analytics could not be loaded.</p><ul className="mt-2 list-inside list-disc">{[...new Set(errors)].map((error) => <li key={error}>{error}</li>)}</ul><p className="mt-2 text-xs">If aggregate views are missing, apply the dashboard reporting migration.</p></div>}
    <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-3 sm:gap-6">
      {[
        ['Total Clicks', dailyError ? null : totalClicks],
        ['Products Clicked', productError ? null : uniqueProducts],
        ['Avg Daily Clicks', dailyError ? null : Math.round(totalClicks / 14)],
      ].map(([label, value]) => <Card key={String(label)}><CardHeader className="pb-2"><CardTitle className="font-section-header text-xs tracking-[0.15em] text-on-surface-variant">{label}</CardTitle></CardHeader><CardContent><div className="font-button-label text-4xl font-medium tracking-tight text-primary">{value === null ? '—' : String(value).padStart(2, '0')}</div></CardContent></Card>)}
    </div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card><CardHeader><CardTitle className="font-section-header text-xs tracking-[0.15em] text-on-surface-variant">Daily Clicks · Last 14 Days</CardTitle></CardHeader><CardContent><div className="space-y-2">{dailyError ? <p className="py-4 text-center text-sm text-red-800">Daily activity could not be loaded.</p> : dailyData.map(({ key, day, clicks }) => <div key={key} className="flex items-center gap-3"><span className="w-16 shrink-0 font-section-header text-[10px] tracking-[0.1em] text-on-surface-variant">{day}</span><div className="h-6 flex-1 overflow-hidden rounded-sm bg-surface-container"><div className="h-full rounded-sm bg-primary transition-all" style={{ width: `${(clicks / maxDaily) * 100}%` }} /></div><span className="w-8 text-right font-button-label text-xs font-semibold text-on-background">{clicks}</span></div>)}</div></CardContent></Card>
      <Card><CardHeader><CardTitle className="font-section-header text-xs tracking-[0.15em] text-on-surface-variant">Top Products</CardTitle></CardHeader><CardContent><div className="space-y-3">{productError ? <p className="py-4 text-center text-sm text-red-800">Product activity could not be loaded.</p> : productData.length ? productData.map((product, index) => <div key={`${product.name}-${index}`} className="flex items-center gap-3"><span className="w-6 shrink-0 font-button-label text-xs font-semibold text-primary">{String(index + 1).padStart(2, '0')}</span><span className="flex-1 truncate text-sm text-on-background">{product.name}</span><span className="font-button-label text-xs font-semibold text-on-surface-variant">{product.count}</span></div>) : <p className="py-4 text-center text-sm text-on-surface-variant">No product clicks in this period.</p>}</div></CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle className="font-section-header text-xs tracking-[0.15em] text-on-surface-variant">Top Referrers</CardTitle></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-2">{referrerError ? <p className="py-4 text-center text-sm text-red-800">Referrer activity could not be loaded.</p> : referrerData.length ? referrerData.map(([referrer, count]) => <div key={referrer} className="flex min-w-0 items-center justify-between gap-4 rounded-md bg-surface-container/50 px-3 py-2"><span className="truncate text-sm text-on-background">{referrer}</span><span className="font-button-label text-xs font-semibold text-primary">{count}</span></div>) : <p className="py-4 text-center text-sm text-on-surface-variant">No referrer activity in this period.</p>}</div></CardContent></Card>
  </div>
}
