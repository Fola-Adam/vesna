"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import VenusTriggerPill from "@/components/VenusTriggerPill";
import { PICKS, CATEGORIES, toSlug } from "@/lib/shop-data";

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [displayedCount, setDisplayedCount] = useState(12);

  const filteredProducts =
    activeCategory === "all"
      ? PICKS
      : PICKS.filter((p) => p.category === activeCategory);

  const displayedProducts = filteredProducts.slice(0, displayedCount);
  const hasMore = displayedCount < filteredProducts.length;

  const handleLoadMore = () => {
    setDisplayedCount((prev) => prev + 12);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setDisplayedCount(12);
  };

  return (
    <>
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <main className="bg-background font-[family-name:var(--font-spectral)] antialiased selection:bg-primary selection:text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
          {/* Hero Header */}
          <section className="max-w-3xl mb-16">
            <h1 className="font-audiowide text-4xl text-primary mb-4">
              Vesna Picks
            </h1>
            <p className="font-[family-name:var(--font-spectral)] text-base text-on-background mb-6 opacity-70 font-light">
              Victory&apos;s personal recommendations.
            </p>
            <span className="font-[family-name:var(--font-tenor-sans)] text-xs tracking-widest text-outline uppercase">
              {PICKS.length} picks
            </span>
          </section>

          {/* Filter Bar */}
          <div className="sticky top-[97px] z-40 bg-background py-6 mb-8 border-b border-outline-variant">
            <div className="flex items-center gap-4 overflow-x-auto hide-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-6 py-2 font-[family-name:var(--font-tenor-sans)] uppercase text-[10px] tracking-widest whitespace-nowrap transition-colors ${
                    activeCategory === cat.id
                      ? "bg-primary text-black"
                      : "border border-outline-variant text-on-background hover:border-primary"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Counter */}
          <div className="mb-8">
            <p className="font-[family-name:var(--font-tenor-sans)] text-xs text-outline uppercase tracking-widest">
              Showing {displayedProducts.length} of {filteredProducts.length}{" "}
              picks
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-6 mb-12">
            {displayedProducts.map((product) => (
              <Link key={product.id} href={`/shop/${toSlug(product.name)}`} className="block">
              <article
                className={`bg-surface-container group relative flex flex-col ${
                  product.badge === "Victory's pick"
                    ? "border-t-2 border-primary"
                    : ""
                }`}
              >
                {product.badge && (
                  <div
                    className={`absolute top-4 left-4 z-10 px-3 py-1 text-[9px] font-[family-name:var(--font-tenor-sans)] uppercase tracking-widest ${
                      product.badge === "Victory's pick"
                        ? "bg-primary text-black"
                        : "bg-secondary-container text-on-secondary-container"
                    }`}
                  >
                    {product.badge}
                  </div>
                )}
                <div className="relative aspect-video overflow-hidden cursor-pointer" onMouseEnter={() => {}}>
                  <Image alt={product.name} src={product.image} fill className="object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-700" />
                  <VenusTriggerPill productName={product.name} />
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-primary font-[family-name:var(--font-tenor-sans)] text-[10px] uppercase tracking-widest">
                      {product.category}
                    </span>
                    <div className="text-right">
                      {product.originalPrice && (
                        <span className="text-outline line-through text-xs mr-2 font-[family-name:var(--font-spectral)]">
                          {product.originalPrice}
                        </span>
                      )}
                      <span className="text-primary text-sm font-medium font-[family-name:var(--font-spectral)]">
                        {product.price}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-audiowide text-lg text-on-background mb-3">
                    {product.name}
                  </h3>
                  <p className="font-[family-name:var(--font-playfair)] text-on-surface-variant text-sm italic opacity-80 mb-4 line-clamp-2">
                    &ldquo;{product.quote}&rdquo;
                  </p>
                  <button className="mt-auto w-full py-4 border border-primary text-primary font-[family-name:var(--font-tenor-sans)] uppercase text-[10px] tracking-[0.2em] hover:bg-primary hover:text-black transition-all duration-300">
                    See this  →
                  </button>
                </div>
              </article>
              </Link>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mb-32">
              <button
                onClick={handleLoadMore}
                className="border border-outline-variant px-12 py-5 font-[family-name:var(--font-tenor-sans)] uppercase tracking-[0.3em] text-[10px] hover:border-primary hover:text-primary transition-all text-on-background"
              >
                Show more products
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
