import Image from 'next/image'

/** The supplied emerald and gold mark is Venus's identity, never a generic AI glyph. */
export default function VenusMark({ className = '' }: { className?: string }) {
  return <Image src="/brand/venus-mark.png" alt="" width={1390} height={1132}
    sizes="80px" className={`object-contain ${className}`} />
}
