import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[88svh] items-center overflow-hidden bg-surface-dim">
      <Image
        priority
        alt="A thoughtfully arranged workspace in warm, natural light"
        className="object-cover object-center"
        src="/vesna-imgs/20_high_end_editorial_photography.webp"
        fill
        sizes="100vw"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-neutral-950/85 via-neutral-950/55 to-neutral-950/10"
      />
      <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-5 pb-16 pt-28 sm:px-8 lg:px-20">
        <div className="max-w-3xl hero-copy">
          <p className="font-section-header mb-5 text-primary">Curated by Victory Ebenezer</p>
          <h1 className="font-display-hero mb-6 text-4xl leading-[1.08] text-white sm:text-5xl md:text-6xl lg:text-7xl">
            The art of <span className="block">intentional living.</span>
          </h1>
          <p className="font-body-main mb-9 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg lg:text-xl">
            Objects and stories chosen with care for the spaces and rituals that make a life.
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href="/picks"
              className="inline-flex min-h-12 items-center border border-primary bg-primary px-7 py-3 font-button-label text-xs uppercase tracking-[0.18em] text-on-primary transition-colors hover:bg-primary-fixed focus-ring"
            >
              Explore Victory&apos;s picks
            </Link>
            <Link
              href="/journal"
              className="inline-flex min-h-12 items-center gap-2 border-b border-white/50 font-button-label text-xs uppercase tracking-[0.16em] text-white transition-colors hover:border-primary hover:text-primary focus-ring"
            >
              Read the journal <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
