'use client'

import Link from 'next/link'
import { useRevealOnScroll } from '@/hooks/use-reveal-on-scroll'
import NewsletterForm from './NewsletterForm'

export default function NewsletterSection() {
  const sectionRef = useRevealOnScroll()
  return (
    <section ref={sectionRef} className="py-20 lg:py-32 bg-neutral-950 border-y border-neutral-900 reveal">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
        <p className="font-section-header text-secondary mb-4">Letters from Vesna</p>
        <h2 className="font-display-hero text-3xl sm:text-4xl lg:text-5xl mb-6">The Dispatch</h2>
        <p className="font-body-main text-on-surface-variant mb-8 max-w-2xl mx-auto leading-relaxed">
          Occasional essays on intentional living and curated discoveries, delivered to your inbox.
        </p>
        <NewsletterForm />
        <p className="mt-6 text-outline font-body-main text-xs">
          Read how we handle your email in our <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">privacy notice</Link>.
        </p>
      </div>
    </section>
  )
}
