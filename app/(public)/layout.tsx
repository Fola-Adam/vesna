import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import '../globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

const VenusChatWidget = dynamic(
  () => import('@/components/VenusChatWidget'),
  { ssr: false }
)

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
      {children}
      <Footer />
      <VenusChatWidget />
      <Analytics />
      <SpeedInsights />
    </>
  )
}