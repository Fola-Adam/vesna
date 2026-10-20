'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, BookOpen, BarChart3, LayoutDashboard, Mail, ShoppingBag, UsersRound } from 'lucide-react'
import VesnaWordmark from '@/components/VesnaWordmark'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-paper">
      <AdminSidebar />
      <main className="min-w-0 min-h-screen lg:ml-64">
        <AdminHeader />
        <div className="mx-auto min-w-0 max-w-[1500px] p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

function NavLink({ href, icon, children, lightSurface = false }: { href: string; icon: React.ReactNode; children: React.ReactNode; lightSurface?: boolean }) {
  const pathname = usePathname()
  const isActive = pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={`flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
        isActive
          ? `${lightSurface ? 'text-primary-ink bg-primary/10' : 'text-primary bg-white/10'} font-medium`
          : lightSurface ? 'text-ink-muted hover:bg-ink/5 hover:text-ink' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
      }`}
    >
      <span className={isActive ? (lightSurface ? 'text-primary-ink' : 'text-primary') : 'text-current'}>{icon}</span>
      {children}
    </Link>
  )
}

function AdminSidebar() {
  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-white/10 lg:bg-[#10382d]">
      <div className="border-b border-white/10 p-6">
        <Link href="/" aria-label="Vesna home" className="font-display-hero text-3xl font-semibold tracking-[0.16em] text-paper">
          <VesnaWordmark />
        </Link>
        <p className="mt-2 font-section-header text-xs tracking-[0.15em] text-on-surface-variant">CURATOR STUDIO</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <NavLink href="/admin/dashboard" icon={<LayoutDashboard size={18} strokeWidth={1.5} />}>Dashboard</NavLink>
        <NavLink href="/admin/products" icon={<ShoppingBag size={18} strokeWidth={1.5} />}>Products</NavLink>
        <NavLink href="/admin/journal" icon={<BookOpen size={18} strokeWidth={1.5} />}>Journal</NavLink>
        <NavLink href="/admin/analytics" icon={<BarChart3 size={18} strokeWidth={1.5} />}>Analytics</NavLink>
        <NavLink href="/admin/subscribers" icon={<Mail size={18} strokeWidth={1.5} />}>Subscribers</NavLink>
        <NavLink href="/admin/partners" icon={<UsersRound size={18} strokeWidth={1.5} />}>Partners</NavLink>
      </nav>

      <div className="border-t border-white/10 p-4">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm text-paper/75 transition-colors hover:bg-white/10 hover:text-paper"
        >
          <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.5} />
          Back to Site
        </Link>
      </div>
    </aside>
  )
}

function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 isolate border-b border-ink/15 bg-paper shadow-sm">
      <div className="flex min-h-14 items-center justify-between px-4 sm:min-h-16 sm:px-6">
        <p className="font-section-header text-[0.65rem] tracking-[0.16em] text-ink-muted sm:text-xs sm:tracking-[0.2em]">VESNA / CURATOR STUDIO</p>
      </div>
      <nav aria-label="Admin navigation" className="grid grid-cols-2 gap-1.5 px-3 pb-3 min-[520px]:grid-cols-3 sm:gap-2 sm:px-6 lg:hidden">
        <NavLink lightSurface href="/admin/dashboard" icon={<LayoutDashboard size={18} strokeWidth={1.5} />}>Dashboard</NavLink>
        <NavLink lightSurface href="/admin/products" icon={<ShoppingBag size={18} strokeWidth={1.5} />}>Products</NavLink>
        <NavLink lightSurface href="/admin/journal" icon={<BookOpen size={18} strokeWidth={1.5} />}>Journal</NavLink>
        <NavLink lightSurface href="/admin/analytics" icon={<BarChart3 size={18} strokeWidth={1.5} />}>Analytics</NavLink>
        <NavLink lightSurface href="/admin/subscribers" icon={<Mail size={18} strokeWidth={1.5} />}>Subscribers</NavLink>
        <NavLink lightSurface href="/admin/partners" icon={<UsersRound size={18} strokeWidth={1.5} />}>Partners</NavLink>
      </nav>
    </header>
  )
}
