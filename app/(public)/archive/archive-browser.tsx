"use client";

import { useState } from "react";
import ScrollProgress from "@/components/ScrollProgress";
import Image from "next/image";

const COLLECTION = [
  {
    id: 1,
    name: "The Alchemist v2 Mechanical Keyboard",
    category: "workspace",
    price: "$450",
    available: true,
    image: "/vesna-imgs/coloured-keyboard.webp",
    curatorNote: "An uncompromising tactile experience wrapped in solid brass. The ultimate centerpiece for the modern workspace. I used this for three years before upgrading to my current custom build.",
  },
  {
    id: 2,
    name: "Nocturnal Series Headphones",
    category: "audio",
    price: "$890",
    originalPrice: "$1,100",
    available: true,
    image: "/vesna-imgs/tai-headphones.webp",
    curatorNote: "Unparalleled sound stage clarity paired with hand-stitched leather. These were my daily drivers during the development of Vesna.",
  },
  {
    id: 3,
    name: "Heritage 48h Weekend Duffel",
    category: "travel",
    price: "$620",
    available: true,
    image: "/vesna-imgs/brown-duffel.webp",
    curatorNote: "Built to last generations. The patina this bag develops over time is the true mark of luxury. I've taken this on every significant journey.",
  },
  {
    id: 4,
    name: "1964 Omega Speedmaster",
    category: "lifestyle",
    price: null,
    available: false,
    image: "/vesna-imgs/luxury-watch-on-book.webp",
    curatorNote: "A piece of horological history. This pre-moon Speedmaster has been with me since my first successful exit. Not for sale - ever.",
  },
  {
    id: 5,
    name: "Leica M6 TTL",
    category: "tech",
    price: "$3,200",
    available: true,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
    curatorNote: "The camera that taught me patience. Every frame is deliberate, every shot earned. Still my favorite for black and white.",
  },
  {
    id: 6,
    name: "Brass Architect Lamp",
    category: "workspace",
    price: null,
    available: false,
    image: "/vesna-imgs/golden-desklamp.webp",
    curatorNote: "Found in a Paris flea market in 2019. Fully restored and rewired. The warm glow it produces is unmatched by modern LEDs.",
  },
  {
    id: 7,
    name: "Artisan Ceramic Speaker",
    category: "audio",
    price: "$1,450",
    available: true,
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80",
    curatorNote: "Hand-thrown ceramic housing with premium drivers. The acoustics are remarkable - warmth you can't get from plastic.",
  },
  {
    id: 8,
    name: "Vintage Pilot Bag",
    category: "travel",
    price: "$380",
    available: true,
    image: "/vesna-imgs/luxury-brown-duffel.webp",
    curatorNote: "1950s airline pilot bag in incredible condition. The perfect size for daily essentials. A piece of aviation history.",
  },
  {
    id: 9,
    name: "First Edition Typewriter",
    category: "workspace",
    price: null,
    available: false,
    image: "/vesna-imgs/vintage-workdesk-darkgold.webp",
    curatorNote: "My grandfather's 1932 Remington. I learned to type on this machine. The rhythm of the keys is meditative. NFS - family heirloom.",
  },
  {
    id: 10,
    name: "Tube Amplifier",
    category: "audio",
    price: "$2,800",
    available: true,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    curatorNote: "Hand-wired point-to-point circuitry. The warmth of tube sound is digital's best-kept secret. This unit is from a boutique maker in Brooklyn.",
  },
  {
    id: 11,
    name: "Minimalist Standing Desk",
    category: "workspace",
    price: "$1,850",
    available: true,
    image: "/vesna-imgs/minimal-workdesk.webp",
    curatorNote: "Solid walnut with brass hardware. I designed this with a craftsman in Portland. Electric height adjustment with memory positions.",
  },
  {
    id: 12,
    name: "Travel Coffee Set",
    category: "travel",
    price: "$245",
    available: true,
    image: "/vesna-imgs/coffee-maker-1.webp",
    curatorNote: "Everything you need for perfect pour-over anywhere. The case is handmade leather. My constant travel companion.",
  },
];

const PAST_SPOTLIGHTS = [
  {
    id: 1,
    title: "The Writer's Pen",
    date: "December 2024",
    image: "/vesna-imgs/premium-fountain-pen.webp",
    badge: "Limited Edition",
    badgeStyle: "filled",
    excerpt: "One of twelve ever made. 18k gold nib with hand-engraved barrel.",
    status: "Acquired",
  },
  {
    id: 2,
    title: "Titanium Audio Masterpiece",
    date: "November 2024",
    image: "/vesna-imgs/tai-headphones.webp",
    badge: "Artisan Made",
    badgeStyle: "outline",
    excerpt: "Hand-assembled in Tokyo. Only 24 units produced annually.",
    status: "Acquired",
  },
  {
    id: 3,
    title: "The Meditation Vessel",
    date: "October 2024",
    image: "/vesna-imgs/minimalist-incense-flask.webp",
    badge: "One of One",
    badgeStyle: "filled-primary",
    excerpt: "A singular piece from a master potter's 50-year retrospective.",
    status: "Acquired",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Items" },
  { id: "tech", label: "Tech" },
  { id: "audio", label: "Audio" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "workspace", label: "Workspace" },
  { id: "travel", label: "Travel" },
];

export default function ArchivePage() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredCollection = activeFilter === "all"
    ? COLLECTION
    : COLLECTION.filter(item => item.category === activeFilter);

  return (
    <>
      <ScrollProgress />
      
      <style jsx global>{`
        .archive-hero {
          background: linear-gradient(
            135deg,
            #0a0a0a 0%,
            #1a1810 50%,
            #0f0f0f 100%
          );
        }
        .rarity-badge {
          position: relative;
          overflow: hidden;
        }
        .rarity-badge::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(230, 195, 100, 0.2),
            transparent
          );
          animation: shimmer 3s infinite;
        }
        @keyframes shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
        .border-green-subtle {
          border: 1px solid rgba(149, 212, 179, 0.15);
        }
      `}</style>

      <main className="bg-background text-on-background antialiased">
        {/* Hero Section - Spotlight of the Week */}
        <section className="archive-hero relative min-h-screen flex items-center">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1920&q=80')"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
          </div>

          <div className="relative z-10 w-full px-5 sm:px-8 lg:px-20 pt-32 pb-20">
            <div className="max-w-screen-xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                {/* Image */}
                <div className="relative aspect-[4/5] order-2 lg:order-1">
                  <div className="absolute -inset-4 border border-primary/20" />
                  <div className="absolute -inset-8 border border-primary/10" />
                  <Image src="/vesna-imgs/native-cinematic-vase.webp" alt="Artisan Ceramic Teakettle" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                  <div className="absolute top-4 right-4">
                    <span className="rarity-badge font-[family-name:var(--font-tenor-sans)] text-[10px] uppercase tracking-[0.2em] bg-primary text-primary-foreground px-4 py-2">
                      One of One
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="order-1 lg:order-2">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="material-symbols-outlined text-secondary">star</span>
                    <p className="font-[family-name:var(--font-tenor-sans)] text-xs text-secondary uppercase tracking-[0.3em]">
                      Spotlight of the Week
                    </p>
                  </div>

                  <h1 className="font-audiowide text-4xl sm:text-5xl lg:text-6xl text-on-background mb-6">
                    Artisan Ceramic<br />Teakettle
                  </h1>

                  <p className="font-[family-name:var(--font-spectral)] text-lg text-on-surface-variant mb-8 leading-relaxed max-w-lg">
                    Hand-thrown by master ceramicist Yuki Tanaka in his Kyoto
                    studio, this teakettle represents the culmination of forty
                    years of practice. The glaze, a unique formulation developed
                    by Tanaka-san himself, creates an iridescent surface that
                    shifts between copper and indigo in different light.
                  </p>

                  <div className="flex flex-wrap gap-6 mb-8 text-sm font-[family-name:var(--font-spectral)] text-on-surface-variant">
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
                      className="font-[family-name:var(--font-tenor-sans)] text-xs uppercase tracking-[0.2em] px-10 py-4 transition-all text-primary-foreground"
                      style={{ background: "linear-gradient(90deg, #e6c364, #95d4b3)" }}
                    >
                      Inquire to Acquire
                    </button>
                    <button className="border border-secondary/50 text-secondary font-[family-name:var(--font-tenor-sans)] text-xs uppercase tracking-[0.2em] px-10 py-4 hover:bg-secondary/10 transition-all">
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
        <section className="py-12 px-5 sm:px-8 lg:px-20 border-b border-outline-variant">
          <div className="max-w-screen-xl mx-auto">
            <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-primary" />
                <div>
                  <p className="font-[family-name:var(--font-tenor-sans)] text-xs text-secondary uppercase tracking-wider">
                    One of One
                  </p>
                  <p className="font-[family-name:var(--font-spectral)] text-xs text-on-surface-variant">
                    Truly unique pieces
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full border-2 border-primary" />
                <div>
                  <p className="font-[family-name:var(--font-tenor-sans)] text-xs text-secondary uppercase tracking-wider">
                    Limited Edition
                  </p>
                  <p className="font-[family-name:var(--font-spectral)] text-xs text-on-surface-variant">
                    Under 50 pieces worldwide
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full border border-primary/50" />
                <div>
                  <p className="font-[family-name:var(--font-tenor-sans)] text-xs text-secondary uppercase tracking-wider">
                    Artisan Made
                  </p>
                  <p className="font-[family-name:var(--font-spectral)] text-xs text-on-surface-variant">
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
              <p className="font-[family-name:var(--font-tenor-sans)] text-[10px] tracking-[0.3em] text-primary mb-4 uppercase">
                The Personal Collection
              </p>
              <h1 className="font-audiowide text-4xl md:text-5xl text-on-background mb-4 italic">
                Objects with History
              </h1>
              <p className="font-[family-name:var(--font-spectral)] text-lg text-on-surface-variant max-w-2xl">
                A curated selection from years of collecting. Some available for
                discerning collectors, others here to inspire.
              </p>
            </div>

            {/* Category Filter Bar */}
            <section className="mb-12 border-b border-outline-variant/30">
              <div className="flex flex-wrap gap-8 items-center pb-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveFilter(cat.id)}
                    className={`font-[family-name:var(--font-tenor-sans)] text-[12px] tracking-[0.15em] pb-3 transition-colors ${
                      activeFilter === cat.id
                        ? "text-on-background border-b-2 border-primary"
                        : "text-on-surface-variant hover:text-on-background"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Collection Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8">
              {filteredCollection.map((item) => (
                <article
                  key={item.id}
                  className={`flex flex-col group bg-background ${
                    item.available ? "border-t-2 border-primary" : "border-t border-outline-variant"
                  } ${!item.available ? "opacity-75" : ""}`}
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-surface-container">
                    <Image alt={item.name} src={item.image} fill className={`object-cover group-hover:scale-105 transition-transform duration-700 ${!item.available ? "grayscale-[40%]" : "grayscale-[20%]"}`} sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                    {!item.available && (
                      <div className="absolute top-4 left-4 z-10">
                        <span className="font-[family-name:var(--font-tenor-sans)] text-[10px] tracking-[0.2em] bg-surface-container-high text-on-surface px-3 py-1.5 border border-outline">
                          NFS - VIEW ONLY
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-8 space-y-4 flex-grow flex flex-col">
                    <div className="flex justify-between items-start">
                      <span className="font-[family-name:var(--font-tenor-sans)] text-[10px] text-primary uppercase">
                        {item.category}
                      </span>
                      {item.available ? (
                        <div className="flex flex-col items-end">
                          {item.originalPrice && (
                            <span className="text-[10px] text-outline line-through font-[family-name:var(--font-spectral)]">
                              {item.originalPrice}
                            </span>
                          )}
                          <span className="font-[family-name:var(--font-spectral)] text-primary font-medium">
                            {item.price}
                          </span>
                        </div>
                      ) : (
                        <span className="font-[family-name:var(--font-spectral)] text-outline font-medium italic">
                          Not for sale
                        </span>
                      )}
                    </div>
                    <h3 className="font-[family-name:var(--font-spectral)] text-xl text-on-background">
                      {item.name}
                    </h3>
                    <p className="font-[family-name:var(--font-spectral)] text-sm text-on-surface-variant italic font-light leading-relaxed flex-grow">
                      &ldquo;{item.curatorNote}&rdquo;
                    </p>
                    {item.available ? (
                      <button className="mt-4 w-full py-3 border border-secondary text-secondary font-[family-name:var(--font-tenor-sans)] uppercase text-[10px] tracking-[0.2em] hover:bg-secondary hover:text-secondary-foreground transition-all duration-300">
                        Inquire to Purchase
                      </button>
                    ) : (
                      <button className="mt-4 w-full py-3 border border-outline-variant text-on-surface-variant font-[family-name:var(--font-tenor-sans)] uppercase text-[10px] tracking-[0.2em] cursor-default">
                        View Details
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </section>

            {/* Legend */}
            <div className="mt-16 pt-8 border-t border-outline-variant/30">
              <div className="flex flex-wrap gap-8 text-sm font-[family-name:var(--font-spectral)]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-primary rounded-sm" />
                  <span className="text-on-surface-variant">Available for inquiry</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-surface-container-high rounded-sm" />
                  <span className="text-on-surface-variant">Not For Sale - View Only</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Past Spotlights Archive */}
        <section className="py-20 lg:py-32 px-5 sm:px-8 lg:px-20 border-t border-outline-variant bg-background">
          <div className="max-w-screen-xl mx-auto">
            <div className="flex items-center gap-3 mb-12">
              <span className="material-symbols-outlined text-secondary">history</span>
              <h2 className="font-[family-name:var(--font-cinzel)] text-xs text-secondary uppercase tracking-[0.2em]">
                Past Spotlights
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {PAST_SPOTLIGHTS.map((item) => (
                <article key={item.id} className="group cursor-pointer border-green-subtle">
                  <div className="relative aspect-[4/3] overflow-hidden mb-4">
                    <Image src={item.image} alt={item.title} fill className="object-cover grayscale-[30%] group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                    <div className="absolute top-3 left-3">
                      {item.badgeStyle === "filled" && (
                        <span className="font-[family-name:var(--font-tenor-sans)] text-[9px] uppercase tracking-[0.2em] bg-primary/90 text-primary-foreground px-2 py-1">
                          {item.badge}
                        </span>
                      )}
                      {item.badgeStyle === "filled-primary" && (
                        <span className="font-[family-name:var(--font-tenor-sans)] text-[9px] uppercase tracking-[0.2em] bg-primary text-primary-foreground px-2 py-1">
                          {item.badge}
                        </span>
                      )}
                      {item.badgeStyle === "outline" && (
                        <span className="font-[family-name:var(--font-tenor-sans)] text-[9px] uppercase tracking-[0.2em] border border-primary text-primary px-2 py-1">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="font-[family-name:var(--font-tenor-sans)] text-[10px] text-secondary uppercase tracking-wider mb-1">
                    {item.date}
                  </p>
                  <h3 className="font-audiowide text-lg text-on-background mb-2">
                    {item.title}
                  </h3>
                  <p className="font-[family-name:var(--font-spectral)] text-sm text-on-surface-variant line-clamp-2">
                    {item.excerpt}
                  </p>
                  <p className="font-[family-name:var(--font-tenor-sans)] text-xs text-outline mt-2 uppercase tracking-wider">
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
            <span className="material-symbols-outlined text-4xl text-primary mb-6">workspace_premium</span>
            <h2 className="font-audiowide text-2xl sm:text-3xl lg:text-4xl text-on-background mb-4">
              Archive Access
            </h2>
            <p className="font-[family-name:var(--font-spectral)] text-base text-on-surface-variant mb-8">
              The Archive is open by appointment only. For inquiries about current
              or upcoming pieces, or to schedule a private viewing, please contact
              us.
            </p>
            <a
              href="mailto:archive@vesna.ng"
              className="inline-block font-[family-name:var(--font-tenor-sans)] text-xs uppercase tracking-[0.2em] px-12 py-4 transition-all text-primary-foreground"
              style={{ background: "linear-gradient(90deg, #e6c364, #95d4b3)" }}
            >
              Contact the Archive
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
