import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminDashboard() {
  const supabase = createClient()
  
  // Fetch stats
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
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-on-background">Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-on-surface-variant">
              Active Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-on-background">
              {productsCount || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-on-surface-variant">
              Email Subscribers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-on-background">
              {subscribersCount || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-on-surface-variant">
              Recent Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-on-background">
              {recentClicks?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentProducts?.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between py-2 border-b border-outline-variant/30 last:border-0"
                >
                  <div>
                    <p className="font-medium text-on-background">{product.name}</p>
                    <p className="text-sm text-on-surface-variant">{product.item_type}</p>
                  </div>
                  <span className="text-sm text-on-surface-variant">
                    {new Date(product.created_at).toLocaleDateString()}
                  </span>
                </div>
              )) || <p className="text-on-surface-variant">No products yet</p>}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentClicks?.map((click) => (
                <div
                  key={click.id}
                  className="flex items-center justify-between py-2 border-b border-outline-variant/30 last:border-0"
                >
                  <div>
                    <p className="font-medium text-on-background">Product ID: {click.product_id}</p>
                    <p className="text-sm text-on-surface-variant">{click.referrer || 'Direct'}</p>
                  </div>
                  <span className="text-sm text-on-surface-variant">
                    {new Date(click.clicked_at).toLocaleDateString()}
                  </span>
                </div>
              )) || <p className="text-on-surface-variant">No clicks yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
