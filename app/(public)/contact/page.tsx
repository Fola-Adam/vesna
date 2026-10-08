import type { Metadata } from 'next'
import InformationPage from '@/components/InformationPage'
import { contactEmail } from '@/lib/site'

export const metadata: Metadata = { title: 'Contact', alternates: { canonical: '/contact' } }
export default function ContactPage() {
  return <InformationPage title="Contact Vesna">
    <p>For product corrections, editorial questions, or requests about your information, contact the Vesna team.</p>
    <p><a href={`mailto:${contactEmail}`}>{contactEmail}</a></p>
    <h2>Questions about an order</h2>
    <p>Contact the seller shown on your order confirmation for delivery, refunds, or payment questions. Vesna does not fulfill orders placed through affiliate links.</p>
  </InformationPage>
}
