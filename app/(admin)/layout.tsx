import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'admin') {
    redirect('/')
  }
  
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="lg:ml-64 min-h-screen">
        <AdminHeader user={user} profile={profile} />
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 text-sm text-on-surface rounded-md hover:bg-surface-container"
      prefetch={true}
    >
      {icon}
      {children}
    </Link>
  )
}

function DashboardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
}

function ProductsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  )
}

function AnalyticsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function SubscribersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function AdminSidebar() {
  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:bg-surface lg:border-r lg:border-outline-variant">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-outline-variant">
          <a href="/" className="font-audiowide text-2xl text-on-background tracking-[0.3em]">
            VESN<span className="lambda-exo2">Λ</span>
          </a>
          <p className="text-xs text-on-surface-variant mt-1">Admin Dashboard</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <NavLink href="/admin/dashboard" icon={<DashboardIcon />}>Dashboard</NavLink>
          <NavLink href="/admin/products" icon={<ProductsIcon />}>Products</NavLink>
          <NavLink href="/admin/analytics" icon={<AnalyticsIcon />}>Analytics</NavLink>
          <NavLink href="/admin/subscribers" icon={<SubscribersIcon />}>Subscribers</NavLink>
        </nav>
        
        <div className="p-4 border-t border-outline-variant">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 text-sm text-on-surface-variant hover:text-on-surface"
            prefetch={false}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Site
          </Link>
        </div>
      </div>
    </aside>
  )
}

function AdminHeader({ user, profile }: { user: any, profile: any }) {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-outline-variant">
      <div className="flex items-center justify-between h-16 px-6">
        <h1 className="text-lg font-semibold text-on-background">Admin</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-on-surface-variant">
            {profile?.full_name || user.email}
          </span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm text-on-surface-variant hover:text-on-surface"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
