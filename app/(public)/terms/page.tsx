import type { Metadata } from 'next'
import Link from 'next/link'
import InformationPage from '@/components/InformationPage'

export const metadata: Metadata = { title: 'Terms of use', alternates: { canonical: '/terms' } }
export default function TermsPage() {
  return <InformationPage title="Terms of use">
    <p>Vesna provides editorial recommendations and links to third-party products. Browsing a recommendation does not place an order with Vesna.</p>
    <h2>Product information</h2>
    <p>Prices, availability, specifications, and seller terms can change. Confirm the details on the seller&apos;s website before purchasing. An unavailable seller link does not mean the product is available to order.</p>
    <h2>Purchases</h2>
    <p>The seller handles payment, fulfillment, customer support, and returns under their own terms. See <Link href="/shipping">shipping and returns</Link> for guidance.</p>
    <h2>Assistant responses</h2>
    <p>Venus offers discovery help and can make mistakes. Confirm product claims with the seller. Responses about financial products are general information and are not personalized financial advice.</p>
    <h2>Affiliate relationships</h2>
    <p>Some outbound links may earn Vesna a commission. Read our <Link href="/affiliate">affiliate disclosure</Link>.</p>
    <h2>Questions</h2>
    <p>Use the <Link href="/contact">contact page</Link> for questions about Vesna or a correction to a listing.</p>
  </InformationPage>
}
