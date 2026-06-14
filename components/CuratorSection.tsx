"use client";

import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";
import Link from "next/link";
import Image from "next/image";

export default function CuratorSection() {
  const sectionRef = useRevealOnScroll();

  return (
    <section
      ref={sectionRef}
      className="py-20 lg:py-32 px-5 sm:px-8 lg:px-20 bg-background reveal"
    >
      <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center max-w-screen-xl mx-auto">
        <div className="order-2 md:order-1">
          <h2 className="font-section-header text-xs lg:text-sm text-secondary uppercase mb-4 lg:mb-6 tracking-[0.2em]">
            The Curator
          </h2>
          <p className="font-display-hero text-3xl sm:text-4xl lg:text-5xl text-on-background mb-6 lg:mb-8">
            Ebenezer Victory
          </p>
          <p className="font-body-main text-base lg:text-lg text-on-surface-variant leading-relaxed mb-4 lg:mb-6">
            A multidisciplinary architect of digital experiences who finds
            balance in the physical world. Ebenezer&apos;s pursuit of &ldquo;Quiet
            Luxury&rdquo; is not about opulence, but about the surgical removal of
            the unnecessary.
          </p>
          <p className="font-body-main text-base lg:text-lg text-on-surface-variant leading-relaxed mb-8 lg:mb-10">
            Vesna is the journal of that pursuit—a living archive of what
            remains when the noise stops.
          </p>
          <Link
            href="/journal"
            className="inline-flex items-center gap-3 lg:gap-4 font-button-label text-xs lg:text-sm text-on-background group hover:text-primary transition-colors"
          >
            READ THE MONOGRAPH
            <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">
              arrow_right_alt
            </span>
          </Link>
        </div>
        <div className="order-1 md:order-2">
          <div className="relative group aspect-[3/4]">
            <div className="absolute -inset-3 lg:-inset-4 border border-primary/20 transition-all group-hover:inset-0" />
            <Image
              alt="Ebenezer Victory — Vesna curator"
              className="object-cover grayscale brightness-90"
              src="/vesna-imgs/victory.webp"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}