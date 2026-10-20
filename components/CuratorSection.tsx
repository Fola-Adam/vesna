"use client";

import Icon from "@/components/Icon";
import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";
import Link from "next/link";
import Image from "next/image";

export default function CuratorSection() {
  const sectionRef = useRevealOnScroll();

  return (
    <section
      ref={sectionRef}
      className="reveal bg-paper-raised px-5 py-16 text-ink sm:px-8 lg:px-20 lg:py-20"
    >
      <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center max-w-screen-xl mx-auto">
        <div className="order-2 md:order-1">
          <h2 className="font-section-header mb-4 text-ink-muted">
            A note from the curator
          </h2>
          <p className="font-display-hero mb-5 text-3xl sm:text-4xl lg:text-5xl">
            Ebenezer Victory
          </p>
          <p className="mb-7 max-w-xl font-body-main text-base leading-relaxed text-ink-muted lg:text-lg">
            Each pick begins with a simple question: will this make everyday life more considered? I look for lasting materials, thoughtful design, and objects that earn their place in a room.
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-3 font-button-label text-xs text-ink group hover:text-primary-ink transition-colors"
          >
            MEET THE CURATOR
            <Icon name="arrow_right_alt" className="group-hover:translate-x-2 transition-transform" />
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
