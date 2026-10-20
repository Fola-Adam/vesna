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
    <div className="admin-shell min-h-screen bg-paper text-ink">
      <AdminSidebar />
      <main className="min-w-0 min-h-screen lg:ml-[268px]">
        <AdminHeader />
        <div className="mx-auto min-w-0 max-w-[1500px] px-4 py-6 sm:px-7 sm:py-8 xl:px-10">
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
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-[268px] lg:flex-col lg:border-r lg:border-white/10 lg:bg-[#10382d]">
      <div className="border-b border-white/10 px-7 py-7">
        <Link href="/" aria-label="Vesna home" className="font-display-hero text-3xl font-semibold tracking-[0.16em] text-paper">
          <VesnaWordmark />
        </Link>
        <p className="mt-2 font-section-header text-[0.65rem] tracking-[0.2em] text-[#d4cdbd]">CURATOR STUDIO</p>
      </div>

      <nav aria-label="Admin navigation" className="flex-1 space-y-1 px-4 py-6">
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
  const pathname = usePathname()
  const section = pathname.startsWith('/admin/products') ? 'Products'
    : pathname.startsWith('/admin/journal') ? 'Journal'
      : pathname.startsWith('/admin/analytics') ? 'Analytics'
        : pathname.startsWith('/admin/subscribers') ? 'Subscribers'
          : pathname.startsWith('/admin/partners') ? 'Partners'
            : 'Dashboard'

  return (
    <header className="sticky top-0 z-40 isolate border-b border-ink/10 bg-paper-raised/95 shadow-[0_8px_24px_-24px_rgba(33,41,32,.55)] backdrop-blur-md">
      <div className="flex min-h-14 items-center justify-between px-4 sm:min-h-[68px] sm:px-7">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Vesna home" className="font-display-hero text-xl tracking-[0.12em] text-primary-ink lg:hidden"><VesnaWordmark /></Link>
          <span className="hidden h-5 w-px bg-ink/15 lg:block" />
          <p className="font-section-header text-[0.62rem] tracking-[0.14em] text-ink-muted sm:text-xs sm:tracking-[0.18em]">CURATOR STUDIO <span className="mx-1 text-primary-ink/50">/</span> <span className="text-ink">{section}</span></p>
        </div>
        <Link href="/" className="text-xs font-medium text-ink-muted transition-colors hover:text-primary-ink lg:hidden">View site</Link>
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
