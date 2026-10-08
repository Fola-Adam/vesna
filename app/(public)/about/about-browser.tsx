import Image from 'next/image'
import Link from 'next/link'
import NewsletterForm from '@/components/NewsletterForm'

const principles = [
  { number: '01', title: 'Useful in real life', text: 'A pick should have a clear role in an everyday routine, not only look good in a product photo.' },
  { number: '02', title: 'Considered by design', text: 'We look for thoughtful materials, a comfortable experience, and details that support the way something is used.' },
  { number: '03', title: 'Worth a closer look', text: 'We share what stands out and what to consider, so you can decide whether it fits your needs and budget.' },
]

export default function AboutBrowser() {
  return <main className="bg-paper text-ink">
    <header className="px-5 py-14 sm:px-8 sm:py-20 lg:px-20">
      <div className="mx-auto grid max-w-screen-xl items-center gap-10 md:grid-cols-5 md:gap-14">
        <div className="md:col-span-3">
          <p className="mb-4 font-section-header text-ink-muted">About Vesna</p>
          <h1 className="max-w-3xl font-display-hero text-4xl leading-tight sm:text-5xl lg:text-6xl">A considered way to discover what belongs.</h1>
          <p className="mt-6 max-w-2xl font-body-main text-lg leading-relaxed text-ink-muted">Vesna is an editorial guide to useful, thoughtfully designed products. Curated by Victory Ebenezer, it brings together selected finds and the reasons they caught our attention.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/picks" className="bg-ink px-6 py-3 font-button-label text-xs uppercase tracking-wider text-paper transition-colors hover:bg-primary-ink focus-ring">Explore the picks</Link><Link href="/journal" className="border border-ink/25 px-6 py-3 font-button-label text-xs uppercase tracking-wider text-ink hover:border-ink focus-ring">Read the journal</Link></div>
        </div>
        <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden bg-paper-raised md:col-span-2"><Image src="/vesna-imgs/victory.webp" alt="Victory Ebenezer" fill sizes="(max-width: 768px) 80vw, 320px" className="object-cover" /></div>
      </div>
    </header>

    <section className="border-y border-ink/10 bg-paper-raised px-5 py-14 sm:px-8 sm:py-20 lg:px-20">
      <div className="mx-auto max-w-screen-xl">
        <div className="max-w-2xl"><p className="font-section-header text-ink-muted">How we look at a pick</p><h2 className="mt-3 font-display-hero text-3xl leading-tight sm:text-4xl">A useful point of view, with room for yours.</h2><p className="mt-4 font-body-main leading-relaxed text-ink-muted">A recommendation should explain itself. These are the questions that guide what we feature and how we describe it.</p></div>
        <div className="mt-9 grid gap-4 md:grid-cols-3">{principles.map((item) => <article key={item.number} className="border border-ink/10 bg-paper p-6 sm:p-7"><p className="font-button-label text-xs text-primary-ink">{item.number}</p><h3 className="mt-4 font-display-hero text-2xl">{item.title}</h3><p className="mt-3 font-body-main text-sm leading-relaxed text-ink-muted">{item.text}</p></article>)}</div>
        <p className="mt-7 max-w-3xl font-body-main text-sm leading-relaxed text-ink-muted">Some links may be affiliate links. If you buy through one, Vesna may earn a commission at no extra cost to you. Recommendations remain subject to your own research and preferences.</p>
      </div>
    </section>

    <section className="px-5 py-14 text-center sm:px-8 sm:py-20"><div className="mx-auto max-w-2xl"><h2 className="font-display-hero text-3xl">Notes from Vesna</h2><p className="mt-3 font-body-main leading-relaxed text-ink-muted">Occasional stories about useful objects, thoughtful spaces, and new discoveries.</p><div className="mt-7"><NewsletterForm source="about" /></div></div></section>
  </main>
}
