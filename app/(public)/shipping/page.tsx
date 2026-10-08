import type { Metadata } from 'next'
import Link from 'next/link'
import InformationPage from '@/components/InformationPage'

export const metadata: Metadata = { title: 'Shipping and returns', alternates: { canonical: '/shipping' } }
export default function ShippingPage() {
  return <InformationPage title="Shipping & returns">
    <p>Vesna currently links to products offered by third-party sellers. Orders are placed with the seller, who handles payment, delivery, and returns.</p>
    <h2>Before ordering</h2>
    <p>Check the seller&apos;s delivery locations, shipping charges, estimated arrival dates, taxes, and return policy. Digital products can have different access and refund terms from physical products.</p>
    <h2>Help with an order</h2>
    <p>Contact the seller using the details on your order confirmation. Vesna cannot change an order or issue a refund for a purchase made with another seller.</p>
    <p>If a Vesna listing or seller link is incorrect, use our <Link href="/contact">contact page</Link>.</p>
  </InformationPage>
}
