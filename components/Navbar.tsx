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
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
    <nav aria-label="Main navigation" className={`fixed top-0 left-0 right-0 z-50 transition-colors ${isScrolled || isMobileMenuOpen ? 'bg-[#0a0a0a] border-b border-outline-variant' : 'bg-transparent'}`}>
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 flex items-center justify-between h-16 lg:h-20">
        <Link href="/" className="font-audiowide text-xl lg:text-2xl tracking-[0.3em] hover:text-primary focus-ring" onClick={() => setIsMobileMenuOpen(false)}>VESNΛ</Link>
        <div className="hidden lg:flex items-center gap-8">{navLinks.map(link => {
          const active = pathname === link.href || (link.href === '/picks' && pathname.startsWith('/shop'))
          return <Link key={link.href} href={link.href} aria-current={active ? 'page' : undefined} className={`nav-underline-anim font-button-label text-xs uppercase tracking-widest transition-colors hover:text-primary focus-ring ${active ? 'text-primary' : ''}`}>{link.label}</Link>
        })}</div>
        <button ref={buttonRef} data-mobile-toggle aria-label="Toggle menu" aria-expanded={isMobileMenuOpen} aria-controls="mobile-navigation"
          onClick={() => setIsMobileMenuOpen(open => !open)} className="lg:hidden p-2 text-2xl focus-ring"><Icon name={isMobileMenuOpen ? 'close' : 'menu'} /></button>
      </div>
      <div ref={menuRef} id="mobile-navigation" aria-hidden={!isMobileMenuOpen} inert={!isMobileMenuOpen}
        className={`lg:hidden fixed top-16 bottom-0 left-0 right-0 bg-[#0a0a0a] overflow-y-auto px-6 py-6 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
        {navLinks.map(link => {
          const active = pathname === link.href || (link.href === '/picks' && pathname.startsWith('/shop'))
          return <Link key={link.href} href={link.href} aria-current={active ? 'page' : undefined} onClick={() => setIsMobileMenuOpen(false)} className={`block border-b border-outline-variant py-5 font-button-label text-sm uppercase tracking-widest hover:text-primary focus-ring ${active ? 'text-primary' : ''}`}>{link.label}</Link>
        })}
      </div>
    </nav>
  )
}
