"use client";

import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

export default function PhilosophySection() {
  const sectionRef = useRevealOnScroll({ rootMargin: "0px 0px -50px 0px" });

  return (
    <section
      ref={sectionRef}
      className="py-20 lg:py-32 px-5 sm:px-8 lg:px-20 max-w-screen-xl mx-auto border-b border-surface-container reveal"
    >
      <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div>
          <h2 className="font-section-header text-xs lg:text-sm text-secondary uppercase mb-6 lg:mb-8 tracking-[0.2em]">
            Philosophy
          </h2>
          <p className="font-body-main text-base lg:text-lg text-on-surface-variant leading-relaxed mb-6 lg:mb-8">
            Vesna was born from the belief that our surroundings dictate our
            internal tempo. In an age of digital velocity, we advocate for the
            slow, the tactile, and the enduring.
          </p>
          <p className="font-body-main text-base lg:text-lg text-on-surface-variant leading-relaxed">
            We don&apos;t just curate things; we curate moments of pause.
          </p>
        </div>
        <div className="flex flex-col items-center md:items-start">
          <span className="text-4xl lg:text-6xl text-primary opacity-20 self-start">
            &ldquo;
          </span>
          <blockquote className="font-display-hero text-xl italic sm:text-2xl lg:text-3xl xl:text-4xl text-on-surface italic leading-snug -mt-6 lg:-mt-8 px-4 lg:px-8">
            True luxury is the space between a thought and an action.
          </blockquote>
          <cite className="mt-6 lg:mt-8 font-button-label text-xs lg:text-sm text-secondary uppercase tracking-widest">
            — The Vesna Creed
          </cite>
        </div>
      </div>
    </section>
  );
}
