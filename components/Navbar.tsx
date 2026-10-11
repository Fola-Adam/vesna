'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon from './Icon'

const navLinks = [
  { href: '/', label: 'Home' }, { href: '/picks', label: 'Picks' },
  { href: '/journal', label: 'Journal' }, { href: '/about', label: 'About' },
  { href: '/archive', label: 'Archive' },
]

export default function Navbar() {
  const pathname = usePathname()
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
    <nav aria-label="Main navigation" className="isolate sticky inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0a0a0a] shadow-sm">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-8 lg:h-20 lg:px-20">
        <Link href="/" className="shrink-0 font-audiowide text-lg tracking-[0.24em] hover:text-primary focus-ring sm:text-xl sm:tracking-[0.3em] lg:text-2xl" onClick={() => setIsMobileMenuOpen(false)}>VESNΛ</Link>
        <div className="hidden lg:flex items-center gap-8">{navLinks.map(link => {
          const active = pathname === link.href || (link.href === '/picks' && pathname.startsWith('/shop'))
          return <Link key={link.href} href={link.href} aria-current={active ? 'page' : undefined} className={`nav-underline-anim font-button-label text-xs uppercase tracking-widest transition-colors hover:text-primary focus-ring ${active ? 'text-primary' : ''}`}>{link.label}</Link>
        })}</div>
        <button ref={buttonRef} data-mobile-toggle aria-label="Toggle menu" aria-expanded={isMobileMenuOpen} aria-controls="mobile-navigation"
          onClick={() => setIsMobileMenuOpen(open => !open)} className="inline-flex min-h-11 min-w-11 items-center justify-center p-2 text-2xl focus-ring lg:hidden"><Icon name={isMobileMenuOpen ? 'close' : 'menu'} /></button>
      </div>
      <div ref={menuRef} id="mobile-navigation" aria-hidden={!isMobileMenuOpen} inert={!isMobileMenuOpen}
        className={`fixed inset-x-0 bottom-0 top-16 z-50 overflow-y-auto bg-[#0a0a0a] px-4 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:px-6 lg:hidden ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
        {navLinks.map(link => {
          const active = pathname === link.href || (link.href === '/picks' && pathname.startsWith('/shop'))
          return <Link key={link.href} href={link.href} aria-current={active ? 'page' : undefined} onClick={() => setIsMobileMenuOpen(false)} className={`block border-b border-outline-variant py-5 font-button-label text-sm uppercase tracking-widest hover:text-primary focus-ring ${active ? 'text-primary' : ''}`}>{link.label}</Link>
        })}
      </div>
    </nav>
  )
}
