"use client";

import Icon from "@/components/Icon";
import { useState } from "react";
import NewsletterForm from "@/components/NewsletterForm";
import ScrollProgress from "@/components/ScrollProgress";
import Image from "next/image";
import { ARTICLES } from "@/lib/journal-data";

export default function JournalPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Stories" },
    { id: "philosophy", label: "Design Philosophy" },
    { id: "curator", label: "Curator's Notes" },
    { id: "objects", label: "Object Stories" },
  ];

  const filteredArticles = activeCategory === "all" 
    ? ARTICLES 
    : ARTICLES.filter(a => a.category === activeCategory);


  return (
    <>
      <ScrollProgress />
      
      <style jsx global>{`
        .article-card {
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .article-card:hover {
          transform: translateY(-8px);
        }
        .article-card img {
          transition: transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1);
        }
        .article-card:hover img {
          transform: scale(1.05);
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
        <section className="relative min-h-[60vh] flex items-center justify-center bg-surface-dim">
          <div className="absolute inset-0 overflow-hidden">
            <Image src="/vesna-imgs/editorial-luxurious-workspace.webp" alt="Journal" fill priority sizes="100vw" className="object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background" />
          </div>
          <div className="relative z-10 text-center px-5 max-w-4xl mx-auto pt-24">
            <p className="font-[family-name:var(--font-tenor-sans)] text-xs text-secondary uppercase tracking-[0.3em] mb-4">
              The Vesna Journal
            </p>
            <h1 className="font-[family-name:var(--font-dm-serif)] text-4xl sm:text-5xl lg:text-6xl text-on-background mb-6">
              Thoughts on<br />Intentional Living
            </h1>
            <p className="font-[family-name:var(--font-spectral)] text-lg text-on-surface-variant max-w-2xl mx-auto">
              Essays, stories, and reflections on design philosophy, the curator&apos;s
              craft, and the objects that shape our lives.
            </p>
          </div>
        </section>

        {/* Category Filters */}
        <section className="py-8 px-5 sm:px-8 lg:px-20 border-b border-outline-variant">
          <div className="max-w-screen-xl mx-auto">
            <div className="flex flex-wrap gap-4 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`font-[family-name:var(--font-tenor-sans)] text-xs uppercase tracking-[0.15em] px-4 py-2 border transition-all ${
                    activeCategory === cat.id
                      ? "border-primary text-primary"
                      : "border-outline/30 text-on-surface-variant hover:text-primary hover:border-primary"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Article */}
        <section className="py-16 lg:py-24 px-5 sm:px-8 lg:px-20">
          <div className="max-w-screen-xl mx-auto">
            <article className="article-card group cursor-pointer">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
                  <Image src="/vesna-imgs/vintage-workdesk-darkgold.webp" alt="The Weight of Quality" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
                  <div className="absolute top-4 left-4">
                    <span className="font-[family-name:var(--font-tenor-sans)] text-[10px] uppercase tracking-[0.2em] px-3 py-1 bg-primary text-primary-foreground">
                      Featured
                    </span>
                  </div>
                </div>
                <div className="lg:py-8">
                  <p className="font-[family-name:var(--font-tenor-sans)] text-xs text-secondary uppercase tracking-[0.2em] mb-3">
                    Design Philosophy
                  </p>
                  <h2 className="font-[family-name:var(--font-dm-serif)] text-2xl sm:text-3xl lg:text-4xl text-on-background mb-4">
                    The Weight of Quality
                  </h2>
                  <p className="font-[family-name:var(--font-spectral)] text-base text-on-surface-variant mb-6 leading-relaxed">
                    In an age of disposable everything, we often forget the
                    satisfying heft of a well-made object. The weight of quality
                    isn&apos;t measured in grams—it&apos;s felt in the permanence of
                    something built to last, to be repaired, to be passed down.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-outline">
                    <span className="font-[family-name:var(--font-tenor-sans)] uppercase tracking-[0.1em]">Ebenezer Victory</span>
                    <span>|</span>
                    <span className="font-[family-name:var(--font-spectral)]">8 min read</span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* Article Grid — Editorial Layout */}
        <section className="py-16 lg:py-24 px-5 sm:px-8 lg:px-20 bg-surface-container-low bg-green-wash">
          <div className="max-w-screen-xl mx-auto">
            <h2 className="font-[family-name:var(--font-cinzel)] text-xs text-secondary uppercase tracking-[0.2em] mb-12 text-center">
              Recent Essays
            </h2>

            {/* Featured first article — horizontal card */}
            {filteredArticles.length > 0 && (
              <article className="article-card group cursor-pointer mb-10 sm:mb-14">
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-8 items-start">
                  <div className="relative aspect-[16/10] sm:col-span-3 overflow-hidden bg-surface-container">
                    <Image
                      src={filteredArticles[0].image}
                      alt={filteredArticles[0].title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 60vw"
                    />
                  </div>
                  <div className="sm:col-span-2 sm:pt-4">
                    <span className="font-[family-name:var(--font-dm-serif)] text-5xl sm:text-6xl text-outline/20 leading-none block mb-2">
                      01
                    </span>
                    <p className={`font-[family-name:var(--font-tenor-sans)] text-[10px] uppercase tracking-[0.2em] mb-2 ${filteredArticles[0].isPrimaryCategory ? 'text-primary' : 'text-secondary'}`}>
                      {filteredArticles[0].categoryLabel}
                    </p>
                    <h3 className="font-[family-name:var(--font-dm-serif)] text-xl sm:text-2xl text-on-background mb-3 group-hover:text-primary transition-colors">
                      {filteredArticles[0].title}
                    </h3>
                    <p className="font-[family-name:var(--font-spectral)] text-sm text-on-surface-variant mb-4 line-clamp-3 leading-relaxed">
                      {filteredArticles[0].excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-outline">
                      <span className="font-[family-name:var(--font-tenor-sans)] uppercase tracking-[0.1em]">Ebenezer Victory</span>
                      <span className="text-outline/30">·</span>
                      <span className="font-[family-name:var(--font-spectral)]">{filteredArticles[0].readTime}</span>
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* Remaining articles — staggered masonry grid */}
            {filteredArticles.length > 1 && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:gap-x-8 lg:gap-y-16">
                {filteredArticles.slice(1).map((article, i) => (
                  <article
                    key={article.id}
                    className={`article-card group cursor-pointer ${article.hasGreenBorder ? 'border-green-subtle' : ''} ${
                      i % 2 === 0 ? 'lg:mt-0' : 'lg:mt-16'
                    } ${i % 2 !== 0 && i < 3 ? 'sm:mt-10' : ''}`}
                  >
                    {/* Portrait aspect for editorial feel */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-surface-container mb-4">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <div className="px-1">
                      <div className="flex items-baseline gap-2 mb-1.5">
                        <span className="font-[family-name:var(--font-dm-serif)] text-lg text-outline/25">
                          {String(i + 2).padStart(2, '0')}
                        </span>
                        <p className={`font-[family-name:var(--font-tenor-sans)] text-[9px] uppercase tracking-[0.2em] ${article.isPrimaryCategory ? 'text-primary' : 'text-secondary'}`}>
                          {article.categoryLabel}
                        </p>
                      </div>
                      <h3 className="font-[family-name:var(--font-dm-serif)] text-base sm:text-lg text-on-background mb-2 group-hover:text-primary transition-colors leading-snug">
                        {article.title}
                      </h3>
                      <p className="font-[family-name:var(--font-spectral)] text-xs sm:text-sm text-on-surface-variant mb-3 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-outline">
                        <span className="font-[family-name:var(--font-tenor-sans)] uppercase tracking-[0.1em]">Ebenezer Victory</span>
                        <span className="text-outline/30">·</span>
                        <span className="font-[family-name:var(--font-spectral)]">{article.readTime}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-20 lg:py-32 px-5 sm:px-8 lg:px-20">
          <div className="max-w-3xl mx-auto text-center">
            <Icon name="mail" className="text-4xl text-secondary mb-6" />
            <h2 className="font-[family-name:var(--font-dm-serif)] text-2xl sm:text-3xl lg:text-4xl text-on-background mb-4">
              Stories in Your Inbox
            </h2>
            <p className="font-[family-name:var(--font-spectral)] text-base text-on-surface-variant mb-8">
              Occasional essays on intentional living and curated discoveries, delivered to your inbox.
            </p>
            
            <NewsletterForm source="journal" />
          </div>
        </section>
      </main>
    </>
  );
}
