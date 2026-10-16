import type { Metadata } from 'next'
import InformationPage from '@/components/InformationPage'

export const metadata: Metadata = { title: 'Affiliate disclosure', alternates: { canonical: '/affiliate' } }
export default function AffiliatePage() {
  return <InformationPage title="Affiliate disclosure">
    <p>Vesna may earn a commission when you make a qualifying purchase through an affiliate link. The seller determines the price and purchase terms.</p>
    <p>Recommendations include the curator&apos;s perspective. A recommendation is not a guarantee of suitability, availability, or a seller&apos;s service. Review the product and seller details before ordering.</p>
    <p>When a product has a working seller link, its page identifies the destination. Payment takes place on the seller&apos;s website.</p>
  </InformationPage>
}
