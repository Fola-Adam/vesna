'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageOff } from 'lucide-react'

export default function CatalogImage({ src, alt, sizes, priority = false }: {
  src: string | null | undefined; alt: string; sizes: string; priority?: boolean
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null)
  if (!src || src === failedSource) return (
    <div role="img" aria-label={`${alt}: image unavailable`} className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-outline bg-surface-container">
      <ImageOff aria-hidden="true" size={28} />
      <span className="font-body-main text-sm">Image unavailable</span>
    </div>
  )
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority}
    onError={() => setFailedSource(src)} className="object-cover transition-transform duration-300 group-hover:scale-[1.025] group-focus-within:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none" />
}
