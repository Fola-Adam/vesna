'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon from './Icon'
import { useShortlist } from '@/lib/shortlist'
import VesnaWordmark from './VesnaWordmark'

const navLinks = [
  { href: '/', label: 'Home' }, { href: '/picks', label: 'Picks' },
  { href: '/journal', label: 'Journal' }, { href: '/about', label: 'About' },
  { href: '/archive', label: 'Archive' }, { href: '/shortlist', label: 'Shortlist' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { ids } = useShortlist()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isMobileMenuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    menuRef.current?.querySelector<HTMLAnchorElement>('a')?.focus()
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false)
        buttonRef.current?.focus()
      }
      if (event.key === 'Tab') {
        const links = [...(menuRef.current?.querySelectorAll<HTMLAnchorElement>('a') ?? [])]
        const first = buttonRef.current
        const last = links[links.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first?.focus()
        }
      }
    }
    const desktop = window.matchMedia('(min-width: 1024px)')
    const onResize = () => { if (desktop.matches) setIsMobileMenuOpen(false) }
    document.addEventListener('keydown', onKeyDown)
    desktop.addEventListener('change', onResize)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      desktop.removeEventListener('change', onResize)
    }
  }, [isMobileMenuOpen])

  return (
    <nav aria-label="Main navigation" className="isolate sticky inset-x-0 top-0 z-50 border-b border-secondary/25 bg-[#10382d] text-paper shadow-sm">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-8 lg:h-20 lg:px-20">
        <Link href="/" aria-label="Vesna home" className="shrink-0 font-display-hero text-2xl font-semibold tracking-[0.12em] text-paper transition-colors hover:text-secondary focus-ring sm:text-3xl" onClick={() => setIsMobileMenuOpen(false)}><VesnaWordmark /></Link>
        <div className="hidden lg:flex items-center gap-5 xl:gap-8">{navLinks.map(link => {
          const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(`${link.href}/`)) || (link.href === '/picks' && pathname.startsWith('/shop'))
          return <Link key={link.href} href={link.href} aria-current={active ? 'page' : undefined} className={`nav-underline-anim font-button-label text-xs uppercase tracking-widest transition-colors hover:text-secondary focus-ring ${active ? 'text-secondary' : 'text-paper/90'}`}>{link.label}{link.href === '/shortlist' && <span className="ml-1.5 text-secondary">({ids.length})</span>}</Link>
        })}</div>
        <button ref={buttonRef} data-mobile-toggle aria-label="Toggle menu" aria-expanded={isMobileMenuOpen} aria-controls="mobile-navigation"
          onClick={() => setIsMobileMenuOpen(open => !open)} className="inline-flex min-h-11 min-w-11 items-center justify-center p-2 text-2xl text-paper focus-ring lg:hidden"><Icon name={isMobileMenuOpen ? 'close' : 'menu'} /></button>
      </div>
      <div ref={menuRef} id="mobile-navigation" aria-hidden={!isMobileMenuOpen} inert={!isMobileMenuOpen}
        className={`fixed inset-x-0 bottom-0 top-16 z-50 overflow-y-auto bg-[#10382d]/[0.98] px-4 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-xl backdrop-blur-xl transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none sm:px-6 lg:hidden ${isMobileMenuOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'}`}>
        {navLinks.map(link => {
          const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(`${link.href}/`)) || (link.href === '/picks' && pathname.startsWith('/shop'))
          return <Link key={link.href} href={link.href} aria-current={active ? 'page' : undefined} onClick={() => setIsMobileMenuOpen(false)} className={`block border-b border-paper/15 py-5 font-button-label text-sm uppercase tracking-widest hover:text-secondary focus-ring ${active ? 'text-secondary' : 'text-paper/90'}`}>{link.label}{link.href === '/shortlist' && <span className="ml-1.5 text-secondary">({ids.length})</span>}</Link>
        })}
      </div>
    </nav>
  )
}
