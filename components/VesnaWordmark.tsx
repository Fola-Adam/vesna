import Image from 'next/image'

/** Brand lockup using Vesna's supplied crest as the initial V. */
export default function VesnaWordmark({ className = '' }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`inline-flex items-center gap-[0.08em] whitespace-nowrap ${className}`}>
      <Image src="/brand/venus-mark.png" alt="" width={1390} height={1132}
        sizes="(max-width: 640px) 36px, 42px" className="h-[1.18em] w-[1.38em] shrink-0 object-contain" />
      <span>ESNA</span>
    </span>
  )
}
