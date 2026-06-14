import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <h1 className="font-audiowide text-8xl text-primary mb-4">404</h1>
        <h2 className="font-section-header text-on-surface-variant mb-3">Page Not Found</h2>
        <p className="font-body-main text-on-surface-variant text-sm leading-relaxed mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary text-sm tracking-widest uppercase hover:opacity-90 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back Home
        </Link>
      </div>
    </div>
  )
}
