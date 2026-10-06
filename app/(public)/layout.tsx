import type { Metadata } from 'next'
import '../globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import VenusChatWidget from '@/components/VenusChatWidget'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  title: {
    default: 'Vesna — Curated Objects with Purpose',
    template: '%s | Vesna',
  },
  description:
    'A curated selection of exceptional products by Ebenezer Victory. Each item tells a story.',
  metadataBase: new URL('https://vesna-next.vercel.app'),
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      {/* Chat widget is interactive-only; keep it out of the critical path */}
      <div hidden={false}>
        <VenusChatWidget />
      </div>
      <Analytics />
      <SpeedInsights />
    </>
  )
}
