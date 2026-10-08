import type { Metadata } from 'next'
import Link from 'next/link'
import InformationPage from '@/components/InformationPage'

export const metadata: Metadata = { title: 'Privacy', alternates: { canonical: '/privacy' } }
export default function PrivacyPage() {
  return <InformationPage title="Privacy">
    <p>Vesna is a curated product and editorial platform. This notice explains the information used by its browsing, newsletter, and assistant features.</p>
    <h2>Newsletter</h2>
    <p>When you sign up, we store your email address, any name you provide, the signup source, and subscription status in Supabase. If newsletter delivery through Brevo is enabled, those contact details are also sent to Brevo for email delivery.</p>
    <h2>Venus assistant</h2>
    <p>Messages sent to Venus and recent conversation context are processed by our AI provider, Groq. Chat history is saved in your browser so you can return to the conversation. Avoid including sensitive personal information; clearing the site&apos;s browser storage removes the locally saved history.</p>
    <h2>Browsing and seller links</h2>
    <p>Vesna uses analytics to understand site usage. Seller-link tracking can record the product, referral source, browser information, and a shortened IP address. When you visit a seller, their own privacy and cookie policies apply.</p>
    <h2>Account access</h2>
    <p>Administration uses Supabase authentication and session cookies. Signing into administration is separate from browsing the public catalog.</p>
    <h2>Your information</h2>
    <p>For questions about your information, deletion, or newsletter preferences, see our <Link href="/contact">contact page</Link>.</p>
  </InformationPage>
}
