'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#f4f0e8]">
      <AdminSidebar />
      <main className="lg:ml-64 min-h-screen">
        <AdminHeader />
        <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
        isActive
          ? 'text-primary bg-primary/10 font-medium'
          : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
      }`}
    >
      <span className={isActive ? 'text-primary' : 'text-current'}>{icon}</span>
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
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-white/10 lg:bg-[#25231f]">
      <div className="border-b border-white/10 p-6">
        <Link href="/" className="font-audiowide text-2xl tracking-[0.3em] text-[#f4f0e8]">
          VESN<span className="lambda-exo2">Λ</span>
        </Link>
        <p className="mt-2 font-section-header text-xs tracking-[0.15em] text-[#c3b9a8]">CURATOR STUDIO</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <NavLink href="/admin/dashboard" icon={<DashboardIcon />}>Dashboard</NavLink>
        <NavLink href="/admin/products" icon={<ProductsIcon />}>Products</NavLink>
        <NavLink href="/admin/analytics" icon={<AnalyticsIcon />}>Analytics</NavLink>
        <NavLink href="/admin/subscribers" icon={<SubscribersIcon />}>Subscribers</NavLink>
      </nav>

      <div className="border-t border-white/10 p-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-[#c3b9a8] transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Site
        </Link>
      </div>
    </aside>
  )
}

function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant bg-[#f4f0e8]/90 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <p className="font-section-header text-xs tracking-[0.2em] text-on-surface-variant">VESNA / CURATOR STUDIO</p>
      </div>
      <nav aria-label="Admin navigation" className="lg:hidden flex flex-wrap gap-2 px-3 pb-3">
        <NavLink href="/admin/dashboard" icon={<DashboardIcon />}>Dashboard</NavLink>
        <NavLink href="/admin/products" icon={<ProductsIcon />}>Products</NavLink>
        <NavLink href="/admin/analytics" icon={<AnalyticsIcon />}>Analytics</NavLink>
        <NavLink href="/admin/subscribers" icon={<SubscribersIcon />}>Subscribers</NavLink>
      </nav>
    </header>
  )
}
