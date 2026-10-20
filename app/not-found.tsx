import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <h1 className="font-display-hero text-8xl text-primary mb-4">404</h1>
        <h2 className="font-section-header text-on-surface-variant mb-3">Page Not Found</h2>
        <p className="font-body-main text-on-surface-variant text-sm leading-relaxed mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary text-sm tracking-widest uppercase hover:opacity-90 transition-opacity"
        >
          <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.5} />
          Back Home
        </Link>
      </div>
    </div>
  )
}
