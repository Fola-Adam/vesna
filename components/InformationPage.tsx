import Link from 'next/link'

export default function InformationPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="max-w-3xl mx-auto px-5 sm:px-8 pt-32 pb-24">
      <Link href="/" className="text-primary text-sm underline underline-offset-4">Back to Vesna</Link>
      <h1 className="font-display-hero text-4xl sm:text-5xl mt-8 mb-10">{title}</h1>
      <div className="space-y-6 text-on-surface-variant font-body-main leading-relaxed [&_h2]:text-on-background [&_h2]:text-xl [&_h2]:font-spectral [&_a]:underline [&_a]:underline-offset-4 [&_a]:text-primary">
        {children}
      </div>
    </main>
  )
}
