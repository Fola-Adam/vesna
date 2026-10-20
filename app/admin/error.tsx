'use client'

import { useEffect } from 'react'
import { TriangleAlert } from 'lucide-react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
          <TriangleAlert aria-hidden="true" className="h-8 w-8 text-destructive" strokeWidth={1.5} />
        </div>
        <h2 className="font-section-header text-on-surface-variant mb-2">Something Went Wrong</h2>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary text-on-primary text-sm tracking-widest uppercase hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
