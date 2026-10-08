import Link from 'next/link'

export default function InformationPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-[65vh] bg-paper px-5 pb-20 pt-12 text-ink sm:px-8 sm:pb-24 lg:pt-16">
      <div className="mx-auto max-w-3xl">
      <Link href="/" className="font-button-label text-xs uppercase tracking-wider text-primary-ink underline underline-offset-4 focus-ring">Back to Vesna</Link>
      <h1 className="mb-8 mt-8 font-display-hero text-4xl sm:text-5xl">{title}</h1>
      <div className="space-y-6 font-body-main leading-relaxed text-ink-muted [&_h2]:font-display-hero [&_h2]:text-xl [&_h2]:text-ink [&_a]:text-primary-ink [&_a]:underline [&_a]:underline-offset-4">
        {children}
      </div>
      </div>
    </main>
  )
}
