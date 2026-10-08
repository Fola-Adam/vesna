import type { Metadata } from 'next'
import '../globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import VenusChatWidget from '@/components/VenusChatWidget'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { getSiteUrl } from '@/lib/site'
import { VenusProvider } from '@/components/VenusProvider'

export const metadata: Metadata = {
  title: {
    default: 'Vesna — Curated Objects with Purpose',
    template: '%s | Vesna',
  },
  description:
    'A curated selection of exceptional products by Ebenezer Victory. Each item tells a story.',
  metadataBase: getSiteUrl(),
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <VenusProvider>
      <Navbar />
      {children}
      <Footer />
      {/* Chat widget is interactive-only; keep it out of the critical path */}
      <div hidden={false}>
        <VenusChatWidget />
      </div>
      <Analytics />
      <SpeedInsights />
    </VenusProvider>
  )
}
