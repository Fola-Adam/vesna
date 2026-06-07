"use client";

import { useState } from "react";
import Link from "next/link";
import ScrollProgress from "@/components/ScrollProgress";

export default function AboutPage() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
  };

  return (
    <>
      <ScrollProgress />
      
      <style jsx global>{`
        .timeline-item {
          position: relative;
          padding-left: 2rem;
        }
        .timeline-item::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0.5rem;
          width: 8px;
          height: 8px;
          background: #e6c364;
          border-radius: 50%;
        }
        .timeline-item::after {
          content: "";
          position: absolute;
          left: 3px;
          top: 1.25rem;
          width: 2px;
          height: calc(100% - 1rem);
          background: linear-gradient(to bottom, #e6c364, transparent);
        }
        .timeline-item:last-child::after {
          display: none;
        }
        .bg-green-wash {
          background: linear-gradient(
            135deg,
            rgba(149, 212, 179, 0.03),
            transparent
          );
        }
        .border-green-subtle {
          border: 1px solid rgba(149, 212, 179, 0.15);
        }
      `}</style>

      <main className="bg-background text-on-background antialiased">
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center bg-surface-dim">
          <div className="absolute inset-0 overflow-hidden">
            <img
              src="/vesna-imgs/native-cinematic-vase.png"
              alt="Ebenezer Victory"
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          </div>
          <div className="relative z-10 px-5 sm:px-8 lg:px-20 pt-24 max-w-screen-xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <p className="font-[family-name:var(--font-tenor-sans)] text-xs text-[#95d4b3] uppercase tracking-[0.3em] mb-4">
                  The Curator
                </p>
                <h1 className="font-[family-name:var(--font-dm-serif)] text-4xl sm:text-5xl lg:text-6xl text-[#e5e2e1] mb-6">
                  Ebenezer<br />Victory
                </h1>
                <p className="font-[family-name:var(--font-spectral)] text-lg text-[#d0c5b2] mb-8 leading-relaxed max-w-lg">
                  Architect of spaces, collector of objects, advocate for the
                  intentional life. I believe that what surrounds us shapes who we
                  become.
                </p>
                <div className="flex gap-4">
                  <Link
                    href="/journal"
                    className="inline-flex items-center gap-2 font-[family-name:var(--font-tenor-sans)] text-xs uppercase tracking-[0.15em] text-[#e6c364] hover:text-[#e5e2e1] transition-colors"
                  >
                    <span>Read the Monograph</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute -inset-4 border border-[#e6c364]/20" />
                  <img
                    src="/vesna-imgs/victory.png"
                    alt="Ebenezer Victory"
                    className="relative w-full aspect-[3/4] object-cover grayscale"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Philosophy Statement */}
        <section className="py-20 lg:py-32 px-5 sm:px-8 lg:px-20 border-b border-[#201f1f]">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-6xl text-[#e6c364]/20 font-[family-name:var(--font-playfair)] italic">&amp;ldquo;</span>
            <blockquote className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl lg:text-4xl text-[#e5e2e1] italic leading-relaxed -mt-8 mb-8">
              True luxury is not possession—it is the space between a thought and
              an action, the pause before we choose.
            </blockquote>
            <cite className="font-[family-name:var(--font-tenor-sans)] text-sm text-[#95d4b3] uppercase tracking-widest">
              — The Vesna Creed
            </cite>
          </div>
        </section>

        {/* The Philosophy */}
        <section className="py-20 lg:py-32 px-5 sm:px-8 lg:px-20">
          <div className="max-w-screen-xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
              <div>
                <h2 className="font-[family-name:var(--font-cinzel)] text-xs text-[#95d4b3] uppercase tracking-[0.2em] mb-6">
                  Philosophy
                </h2>
                <h3 className="font-[family-name:var(--font-dm-serif)] text-2xl sm:text-3xl text-[#e5e2e1] mb-6">
                  Objects as Anchors
                </h3>
                <div className="space-y-4 font-[family-name:var(--font-spectral)] text-base text-[#d0c5b2] leading-relaxed">
                  <p>
                    In an era of endless scrolling and disposable consumption,
                    Vesna stands for the opposite: permanence, intention, and the
                    quiet luxury of objects chosen with care.
                  </p>
                  <p>
                    Every item in our collection has been touched, considered, and
                    ultimately selected because it represents something more than
                    function—it embodies a philosophy of living.
                  </p>
                  <p>
                    We don&apos;t sell products. We curate possibilities for a more
                    intentional existence.
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="p-6 bg-[#201f1f] border-green-subtle">
                  <h4 className="font-[family-name:var(--font-tenor-sans)] text-xs text-[#95d4b3] uppercase tracking-[0.15em] mb-3">
                    The Three Principles
                  </h4>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#95d4b3] text-sm mt-1">check_circle</span>
                      <div>
                        <p className="font-[family-name:var(--font-spectral)] text-sm text-[#e5e2e1]">
                          <strong>Quality over quantity</strong>
                        </p>
                        <p className="font-[family-name:var(--font-spectral)] text-sm text-[#d0c5b2]">
                          One exceptional object outweighs a dozen mediocre ones.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#95d4b3] text-sm mt-1">check_circle</span>
                      <div>
                        <p className="font-[family-name:var(--font-spectral)] text-sm text-[#e5e2e1]">
                          <strong>Timeless over trending</strong>
                        </p>
                        <p className="font-[family-name:var(--font-spectral)] text-sm text-[#d0c5b2]">
                          We seek objects that age gracefully, not those that
                          chase fashion.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#95d4b3] text-sm mt-1">check_circle</span>
                      <div>
                        <p className="font-[family-name:var(--font-spectral)] text-sm text-[#e5e2e1]">
                          <strong>Meaningful over convenient</strong>
                        </p>
                        <p className="font-[family-name:var(--font-spectral)] text-sm text-[#d0c5b2]">
                          The best things require care, attention, and presence.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 lg:py-32 px-5 sm:px-8 lg:px-20 bg-[#0e0e0e] bg-green-wash">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-[family-name:var(--font-cinzel)] text-xs text-[#95d4b3] uppercase tracking-[0.2em] mb-12 text-center">
              The Journey
            </h2>

            <div className="space-y-8">
              <div className="timeline-item">
                <p className="font-[family-name:var(--font-tenor-sans)] text-xs text-[#95d4b3] uppercase tracking-[0.15em] mb-1">
                  2018
                </p>
                <h3 className="font-[family-name:var(--font-dm-serif)] text-lg text-[#e5e2e1] mb-2">
                  The Seed
                </h3>
                <p className="font-[family-name:var(--font-spectral)] text-sm text-[#d0c5b2]">
                  After years of collecting objects from artisans worldwide, the
                  idea of Vesna began to form—a place to share discoveries with
                  like-minded seekers of quality.
                </p>
              </div>

              <div className="timeline-item">
                <p className="font-[family-name:var(--font-tenor-sans)] text-xs text-[#95d4b3] uppercase tracking-[0.15em] mb-1">
                  2020
                </p>
                <h3 className="font-[family-name:var(--font-dm-serif)] text-lg text-[#e5e2e1] mb-2">
                  The Curation
                </h3>
                <p className="font-[family-name:var(--font-spectral)] text-sm text-[#d0c5b2]">
                  The first collection took shape: fifty objects, each chosen not
                  for market appeal, but for their ability to transform a space
                  and elevate daily rituals.
                </p>
              </div>

              <div className="timeline-item">
                <p className="font-[family-name:var(--font-tenor-sans)] text-xs text-[#95d4b3] uppercase tracking-[0.15em] mb-1">
                  2022
                </p>
                <h3 className="font-[family-name:var(--font-dm-serif)] text-lg text-[#e5e2e1] mb-2">
                  The Community
                </h3>
                <p className="font-[family-name:var(--font-spectral)] text-sm text-[#d0c5b2]">
                  Vesna found its audience—architects, designers, writers, and
                  thinkers who understood that environment shapes consciousness.
                </p>
              </div>

              <div className="timeline-item">
                <p className="font-[family-name:var(--font-tenor-sans)] text-xs text-[#95d4b3] uppercase tracking-[0.15em] mb-1">
                  2024
                </p>
                <h3 className="font-[family-name:var(--font-dm-serif)] text-lg text-[#e5e2e1] mb-2">
                  The Vision
                </h3>
                <p className="font-[family-name:var(--font-spectral)] text-sm text-[#d0c5b2]">
                  The full vision for Vesna took shape—a comprehensive platform
                  spanning commerce, community, and intelligence, built on trust
                  as infrastructure.
                </p>
              </div>

              <div className="timeline-item">
                <p className="font-[family-name:var(--font-tenor-sans)] text-xs text-[#95d4b3] uppercase tracking-[0.15em] mb-1">
                  2026
                </p>
                <h3 className="font-[family-name:var(--font-dm-serif)] text-lg text-[#e5e2e1] mb-2">
                  The Foundation
                </h3>
                <p className="font-[family-name:var(--font-spectral)] text-sm text-[#d0c5b2]">
                  Vesna is being built—starting with the curated affiliate
                  showcase, Venus AI integration, and the foundation for what will
                  become a complete ecosystem of intentional living.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-20 lg:py-32 px-5 sm:px-8 lg:px-20">
          <div className="max-w-3xl mx-auto text-center">
            <span className="material-symbols-outlined text-4xl text-[#e6c364] mb-6">mail</span>
            <h2 className="font-[family-name:var(--font-dm-serif)] text-2xl sm:text-3xl lg:text-4xl text-[#e5e2e1] mb-4">
              Join the Inner Circle
            </h2>
            <p className="font-[family-name:var(--font-spectral)] text-base text-[#d0c5b2] mb-8">
              Receive monthly essays, early access to new collections, and
              invitations to exclusive events.
            </p>
            
            {!subscribed ? (
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 bg-[#201f1f] border border-[#99907e]/30 px-4 py-3 text-[#e5e2e1] placeholder:text-[#99907e]/50 focus:outline-none focus:border-[#95d4b3] font-[family-name:var(--font-spectral)]"
                  required
                />
                <button
                  type="submit"
                  className="font-[family-name:var(--font-tenor-sans)] text-xs uppercase tracking-[0.2em] px-8 py-3 transition-all text-[#3d2e00]"
                  style={{ background: "linear-gradient(90deg, #e6c364, #95d4b3)" }}
                >
                  Subscribe
                </button>
              </form>
            ) : (
              <p className="font-[family-name:var(--font-spectral)] text-sm text-[#95d4b3] mt-4">
                Welcome to the community of discerning readers.
              </p>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
