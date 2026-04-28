'use client'

import { useState } from 'react'
import Image from 'next/image'

const CATEGORIES = ['all', 'tech', 'audio', 'lifestyle', 'workspace', 'travel']

const PAST_SPOTLIGHTS = [
  {
    id: 1,
    title: 'The Writer\'s Pen',
    date: 'December 2024',
    rarity: 'Limited Edition',
    description: 'One of twelve ever made. 18k gold nib with hand-engraved barrel.',
    image: '/vesna-imgs/premium-fountain-pen.png',
    status: 'Acquired',
  },
  {
    id: 2,
    title: 'Titanium Audio Masterpiece',
    date: 'November 2024',
    rarity: 'Artisan Made',
    description: 'Hand-assembled in Tokyo. Only 24 units produced annually.',
    image: '/vesna-imgs/tai-headphones.png',
    status: 'Acquired',
  },
  {
    id: 3,
    title: 'The Meditation Vessel',
    date: 'October 2024',
    rarity: 'One of One',
    description: 'A singular piece from a master potter\'s 50-year retrospective.',
    image: '/vesna-imgs/minimalist-incense-flask.png',
    status: 'Acquired',
  },
]

export default function ArchivePage() {
  const [currentCategory, setCurrentCategory] = useState('all')

  return (
    <div>
      {/* Hero Section - Spotlight of the Week */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-background via-[#1a1810] to-background">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1920&q=80')] bg-cover bg-center opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        <div className="relative z-10 w-full px-5 sm:px-8 lg:px-20 pt-32 pb-20">
          <div className="max-w-screen-xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Image */}
              <div className="relative order-2 lg:order-1">
                <div className="absolute -inset-4 border border-primary/20"></div>
                <div className="absolute -inset-8 border border-primary/10"></div>
                <Image
                  src="/vesna-imgs/native-cinematic-vase.png"
                  alt="Artisan Ceramic Teakettle"
                  width={400}
                  height={500}
                  className="relative w-full aspect-[4/5] object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className="font-button-label text-[10px] uppercase tracking-[0.2em] bg-primary text-on-primary px-4 py-2">
                    One of One
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="order-1 lg:order-2">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-secondary">star</span>
                  <p className="font-button-label text-xs text-secondary uppercase tracking-[0.3em]">
                    Spotlight of the Week
                  </p>
                </div>

                <h1 className="font-display-hero text-4xl sm:text-5xl lg:text-6xl text-on-background mb-6">
                  Artisan Ceramic<br />Teakettle
                </h1>

                <p className="font-body-main text-lg text-on-surface-variant mb-8 leading-relaxed max-w-lg">
                  Hand-thrown by master ceramicist Yuki Tanaka in his Kyoto
                  studio, this teakettle represents the culmination of forty
                  years of practice. The glaze, a unique formulation developed
                  by Tanaka-san himself, creates an iridescent surface that
                  shifts between copper and indigo in different light.
                </p>

                <div className="flex flex-wrap gap-6 mb-8 text-sm font-body-main text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">verified</span>
                    <span>Artist Signed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">local_fire_department</span>
                    <span>Kiln Fired</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">museum</span>
                    <span>Certificate of Authenticity</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    className="font-button-label text-xs uppercase tracking-[0.2em] px-10 py-4 transition-all text-on-primary"
                    style={{ background: 'linear-gradient(90deg, #e6c364, #95d4b3)' }}
                  >
                    Inquire to Acquire
                  </button>
                  <button className="border border-secondary/50 text-secondary font-button-label text-xs uppercase tracking-[0.2em] px-10 py-4 hover:bg-secondary/10 transition-all">
                    View Full Story
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <span className="material-symbols-outlined text-on-surface-variant text-2xl">expand_more</span>
        </div>
      </section>

      {/* Rarity Legend */}
      <section className="py-12 px-5 sm:px-8 lg:px-20 border-b border-surface-container">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-primary"></span>
              <div>
                <p className="font-button-label text-xs text-secondary uppercase tracking-wider">
                  One of One
                </p>
                <p className="font-body-main text-xs text-on-surface-variant">
                  Truly unique pieces
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full border-2 border-primary"></span>
              <div>
                <p className="font-button-label text-xs text-secondary uppercase tracking-wider">
                  Limited Edition
                </p>
                <p className="font-body-main text-xs text-on-surface-variant">
                  Under 50 pieces worldwide
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full border border-primary/50"></span>
              <div>
                <p className="font-button-label text-xs text-secondary uppercase tracking-wider">
                  Artisan Made
                </p>
                <p className="font-body-main text-xs text-on-surface-variant">
                  Handcrafted by masters
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personal Collection Section */}
      <section className="py-20 lg:py-32 px-5 sm:px-8 lg:px-20">
        <div className="max-w-[1440px] mx-auto">
          {/* Header */}
          <div className="mb-12">
            <p className="font-button-label text-[10px] tracking-[0.3em] text-primary mb-4 uppercase">
              The Personal Collection
            </p>
            <h1 className="font-display-hero text-4xl md:text-5xl text-on-background mb-4 italic">
              Objects with History
            </h1>
            <p className="font-body-main text-lg text-on-surface-variant max-w-2xl">
              A curated selection from years of collecting. Some available for
              discerning collectors, others here to inspire.
            </p>
          </div>

          {/* Category Filter Bar */}
          <section className="mb-12 border-b border-outline-variant/30">
            <div className="flex flex-wrap gap-8 items-center pb-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCurrentCategory(cat)}
                  className={`font-button-label text-[12px] tracking-[0.15em] pb-3 transition-colors ${
                    currentCategory === cat
                      ? 'text-on-surface border-b-2 border-primary'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </section>

          {/* Collection Grid - Placeholder */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8">
            <p className="col-span-full text-center text-on-surface-variant py-12">
              Collection items will be loaded from the database.
            </p>
          </section>

          {/* Legend */}
          <div className="mt-16 pt-8 border-t border-outline-variant/30">
            <div className="flex flex-wrap gap-8 text-sm font-body-main">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-primary rounded-sm"></span>
                <span className="text-on-surface-variant">Available for inquiry</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-stone-600 rounded-sm"></span>
                <span className="text-on-surface-variant">Not For Sale - View Only</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Past Spotlights Archive */}
      <section className="py-20 lg:py-32 px-5 sm:px-8 lg:px-20 border-t border-surface-container bg-surface-dim">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <span className="material-symbols-outlined text-secondary">history</span>
            <h2 className="font-section-header text-xs text-secondary uppercase tracking-[0.2em]">
              Past Spotlights
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PAST_SPOTLIGHTS.map((item) => (
              <article key={item.id} className="group cursor-pointer border border-secondary/15">
                <div className="relative aspect-[4/3] overflow-hidden mb-4">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover grayscale-[30%] group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`font-button-label text-[9px] uppercase tracking-[0.2em] px-2 py-1 ${
                        item.rarity === 'One of One'
                          ? 'bg-primary text-on-primary'
                          : item.rarity === 'Limited Edition'
                          ? 'border border-primary text-primary'
                          : 'bg-primary text-on-primary'
                      }`}
                    >
                      {item.rarity}
                    </span>
                  </div>
                </div>
                <p className="font-button-label text-[10px] text-secondary uppercase tracking-wider mb-1">
                  {item.date}
                </p>
                <h3 className="font-display-hero text-lg text-on-background mb-2">
                  {item.title}
                </h3>
                <p className="font-body-main text-sm text-on-surface-variant line-clamp-2">
                  {item.description}
                </p>
                <p className="font-button-label text-xs text-stone-500 mt-2 uppercase tracking-wider">
                  {item.status}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Archive Access CTA */}
      <section className="py-20 lg:py-32 px-5 sm:px-8 lg:px-20">
        <div className="max-w-3xl mx-auto text-center">
          <span className="material-symbols-outlined text-4xl text-primary mb-6">
            workspace_premium
          </span>
          <h2 className="font-display-hero text-2xl sm:text-3xl lg:text-4xl text-on-background mb-4">
            Archive Access
          </h2>
          <p className="font-body-main text-base text-on-surface-variant mb-8">
            The Archive is open by appointment only. For inquiries about current
            or upcoming pieces, or to schedule a private viewing, please contact
            us.
          </p>
          <a
            href="mailto:archive@vesna.ng"
            className="inline-block font-button-label text-xs uppercase tracking-[0.2em] px-12 py-4 transition-all text-on-primary"
            style={{ background: 'linear-gradient(90deg, #e6c364, #95d4b3)' }}
          >
            Contact the Archive
          </a>
        </div>
      </section>
    </div>
  )
}
