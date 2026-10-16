import Icon from '@/components/Icon'
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
          <p className="font-section-header mb-5 text-secondary">A personal edit by Victory Ebenezer</p>
          <h1 className="mb-6 max-w-full break-words font-display-hero text-[clamp(2.25rem,8vw,4.5rem)] leading-[1.08] text-white lg:text-7xl">
            The art of <span className="block">intentional living.</span>
          </h1>
          <p className="font-body-main mb-9 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg lg:text-xl">
            Objects and stories chosen with care for the spaces and rituals that make a life.
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href="/picks"
              className="inline-flex min-h-12 max-w-full items-center justify-center border border-primary bg-primary px-5 py-3 text-center font-button-label text-xs font-semibold uppercase tracking-[0.12em] text-on-primary transition-colors hover:bg-primary-container focus-ring sm:px-7 sm:tracking-[0.18em]"
            >
              Explore Victory&apos;s picks
            </Link>
            <Link
              href="/journal"
              className="inline-flex min-h-12 items-center gap-2 border-b border-white/50 font-button-label text-xs uppercase tracking-[0.12em] text-white transition-colors hover:border-secondary hover:text-secondary focus-ring sm:tracking-[0.16em]"
            >
              Read the journal <Icon name="arrow_forward" className="align-middle" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
