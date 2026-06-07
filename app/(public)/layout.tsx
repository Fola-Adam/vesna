import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Vesna - Curated Objects with Purpose',
  description: 'A curated selection of exceptional products. Each item tells a story.',
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  )
}

function Navbar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b border-outline-variant">
      <div className="flex justify-between items-center px-5 sm:px-8 lg:px-20 h-20 max-w-[1440px] mx-auto">
        <a href="/" className="font-audiowide text-2xl text-on-background tracking-[0.3em]">
          VESN<span className="lambda-exo2">Λ</span>
        </a>
        
        <nav className="hidden lg:flex gap-8 items-center">
          <a href="/" className="text-sm text-on-surface-variant hover:text-on-background transition-colors">
            Home
          </a>
          <a href="/curated" className="text-sm text-on-surface-variant hover:text-on-background transition-colors">
            Curated
          </a>
          <a href="/shop" className="text-sm text-on-surface-variant hover:text-on-background transition-colors">
            Shop
          </a>
          <a href="/archive" className="text-sm text-on-surface-variant hover:text-on-background transition-colors">
            Archive
          </a>
          <a href="/journal" className="text-sm text-on-surface-variant hover:text-on-background transition-colors">
            Journal
          </a>
          <a href="/about" className="text-sm text-on-surface-variant hover:text-on-background transition-colors">
            About
          </a>
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="py-12 px-5 sm:px-8 lg:px-20 border-t border-outline-variant">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <a href="/" className="font-audiowide text-2xl text-on-background tracking-[0.3em]">
          VESN<span className="lambda-exo2">Λ</span>
        </a>
        <p className="text-sm text-on-surface-variant">
          &copy; 2026 Vesna. All rights reserved.
        </p>
        <p className="text-xs text-on-surface-variant/50 uppercase tracking-widest">
          Oracle:Atlas
        </p>
      </div>
    </footer>
  )
}
