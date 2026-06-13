"use client";

import { useState } from "react";
import Image from "next/image";

const PICKS = [
  {
    id: 1,
    name: "Masterclass: Digital Curation",
    category: "courses",
    price: "$99",
    originalPrice: "$149",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
    badge: "Victory's pick",
    quote:
      "The only course that actually taught me how to blend aesthetic with utility.",
  },
  {
    id: 2,
    name: "The Heritage Silk Scarf",
    category: "fashion",
    price: "$280",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
    badge: "New",
    quote: "Victory's favorite layering piece for transition seasons.",
  },
  {
    id: 3,
    name: "Quiet Luxury Interiors",
    category: "ebooks",
    price: "$65",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80",
    quote:
      "A visual guide to stripping away the noise and keeping only what speaks.",
  },
  {
    id: 4,
    name: "Podcast Excellence Kit",
    category: "tech",
    price: "$299",
    originalPrice: "$350",
    image:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80",
    quote: "Everything you need for studio-quality audio from home.",
  },
  {
    id: 5,
    name: "Vesna Signature Brewer",
    category: "home",
    price: "$1,200",
    image:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80",
    badge: "Victory's pick",
    quote: "The morning ritual that changed my productivity.",
  },
  {
    id: 6,
    name: "Quarterly Reset System",
    category: "templates",
    price: "$45",
    image:
      "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=800&q=80",
    badge: "New",
    quote: "My personal framework for goal setting and life audit.",
  },
  {
    id: 7,
    name: "Leather Weekender Bag",
    category: "fashion",
    price: "$450",
    image: "/vesna-imgs/brown-duffel.webp",
    quote: "The perfect travel companion, ages beautifully.",
  },
  {
    id: 8,
    name: "Mechanical Keyboard Pro",
    category: "tech",
    price: "$320",
    image: "/vesna-imgs/coloured-keyboard.webp",
    badge: "Featured",
    quote: "Heavy brass weight, zero drift. The typist's dream.",
  },
  {
    id: 9,
    name: "Heritage Leather Journal",
    category: "tools",
    price: "$149",
    image: "/vesna-imgs/vintage-brown-leather.webp",
    quote: "Hand-dyed Tuscan leather with hand-stitched binding.",
  },
  {
    id: 10,
    name: "Artisan Ceramic Vessel",
    category: "home",
    price: "$189",
    image: "/vesna-imgs/native-cinematic-vase.webp",
    quote: "Hand-thrown in Kyoto. Each piece is unique.",
  },
  {
    id: 11,
    name: "Brass Architect Lamp",
    category: "home",
    price: "$349",
    image: "/vesna-imgs/golden-desklamp.webp",
    quote: "Solid brass, adjustable arm. Mid-century inspired.",
  },
  {
    id: 12,
    name: "Porcelain Ritual Mug",
    category: "home",
    price: "$79",
    image: "/vesna-imgs/coffee-maker-1.webp",
    badge: "Featured",
    quote: "Handcrafted with speckled glaze. Morning ritual essential.",
  },
  {
    id: 13,
    name: "Premium Fountain Pen",
    category: "tools",
    price: "$425",
    image: "/vesna-imgs/premium-fountain-pen.webp",
    quote: "18k gold nib, ebonite feed. Writes like a dream.",
  },
  {
    id: 14,
    name: "Swiss Chronograph",
    category: "fashion",
    price: "$2,400",
    image: "/vesna-imgs/luxury-watch-on-book.webp",
    badge: "Limited",
    quote: "Swiss movement, sapphire crystal. Timeless.",
  },
  {
    id: 15,
    name: "Minimalist Workspace",
    category: "courses",
    price: "$149",
    image: "/vesna-imgs/minimal-workdesk.webp",
    quote: "Design your space for focus and flow.",
  },
  {
    id: 16,
    name: "Cashmere Throw Blanket",
    category: "home",
    price: "$385",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    quote: "Mongolian cashmere. The softness is unreal.",
  },
  {
    id: 17,
    name: "Film Camera Bundle",
    category: "tech",
    price: "$899",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
    quote: "Return to intentional photography. Every shot matters.",
  },
  {
    id: 18,
    name: "Notion Template Suite",
    category: "templates",
    price: "$35",
    image:
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80",
    quote: "My complete productivity system, ready to use.",
  },
  {
    id: 19,
    name: "Italian Linen Bedding",
    category: "home",
    price: "$520",
    image:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
    quote: "Stone-washed Italian linen. Sleep like royalty.",
  },
  {
    id: 20,
    name: "Investment Portfolio Guide",
    category: "finance",
    price: "$199",
    image:
      "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80",
    badge: "Bestseller",
    quote: "The finance book I wish I had at 25.",
  },
  {
    id: 21,
    name: "Designer Sunglasses",
    category: "fashion",
    price: "$340",
    image: "/vesna-imgs/luxury-watch-on-book.webp",
    quote: "Japanese titanium frames. Weightless perfection.",
  },
  {
    id: 22,
    name: "Smart Home Hub",
    category: "tech",
    price: "$199",
    image: "/vesna-imgs/editorial-luxurious-workspace.webp",
    quote: "Control your environment with intention.",
  },
  {
    id: 23,
    name: "Minimalist Wallet",
    category: "fashion",
    price: "$95",
    image: "/vesna-imgs/brown-duffel.webp",
    quote: "Slim profile, full grain leather. Carry less.",
  },
  {
    id: 24,
    name: "Artisan Coffee Beans",
    category: "food",
    price: "$48",
    image: "/vesna-imgs/coffee-maker-2.webp",
    quote: "Ethiopian single origin. Roasted to order.",
  },
  {
    id: 25,
    name: "Writing Masterclass",
    category: "courses",
    price: "$129",
    image: "/vesna-imgs/vesna-fountain-pen-on-parchment.webp",
    quote: "Find your voice. Tell your story.",
  },
  {
    id: 26,
    name: "Noise Cancelling Headphones",
    category: "tech",
    price: "$449",
    image: "/vesna-imgs/tai-headphones.webp",
    badge: "Popular",
    quote: "Silence is a luxury. These deliver.",
  },
  {
    id: 27,
    name: "Scandinavian Armchair",
    category: "home",
    price: "$1,850",
    image:
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80",
    quote: "Danish design. Comfort that looks like art.",
  },
  {
    id: 28,
    name: "Gourmet Olive Oil Set",
    category: "food",
    price: "$120",
    image:
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80",
    quote: "Small-batch California olive oil. Liquid gold.",
  },
  {
    id: 29,
    name: "Productivity App",
    category: "apps",
    price: "$4.99",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
    quote: "Focus timer meets habit tracker. Simple.",
  },
  {
    id: 30,
    name: "Leather Desk Mat",
    category: "tools",
    price: "$165",
    image: "/vesna-imgs/editorial-luxurious-workspace.webp",
    quote: "Full-grain leather. Develops patina over time.",
  },
  {
    id: 31,
    name: "Incense Ceremony Set",
    category: "home",
    price: "$89",
    image: "/vesna-imgs/minimalist-incense-flask.webp",
    quote: "Kyoto-style incense. Transform your space.",
  },
  {
    id: 32,
    name: "Botanical Hair Oil",
    category: "fashion",
    price: "$68",
    image: "/vesna-imgs/vesna-hairoil.webp",
    quote: "Clean ingredients. Visible results.",
  },
  {
    id: 33,
    name: "Financial Freedom Ebook",
    category: "finance",
    price: "$29",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
    quote: "The mindset shift that changed my relationship with money.",
  },
  {
    id: 34,
    name: "Ceramic Tea Set",
    category: "home",
    price: "$245",
    image: "/vesna-imgs/native-incense-platform.webp",
    quote: "Hand-glazed ceramics. Tea becomes ritual.",
  },
  {
    id: 35,
    name: "Design System Template",
    category: "templates",
    price: "$79",
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    badge: "New",
    quote: "Complete design system for Figma. Save weeks.",
  },
  {
    id: 36,
    name: "Leather Messenger Bag",
    category: "fashion",
    price: "$580",
    image: "/vesna-imgs/luxury-brown-duffel.webp",
    quote: "Italian leather. Made to last decades.",
  },
  {
    id: 37,
    name: "Mindfulness App Premium",
    category: "apps",
    price: "$59.99",
    image:
      "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&q=80",
    quote: "Guided meditations for the modern professional.",
  },
  {
    id: 38,
    name: "Vintage Book Collection",
    category: "home",
    price: "$350",
    image: "/vesna-imgs/curated-novels.webp",
    quote: "First editions. Literary treasures.",
  },
  {
    id: 39,
    name: "Culinary Knife Set",
    category: "food",
    price: "$675",
    image: "/vesna-imgs/native-cinematic-vase.webp",
    quote: "Japanese Damascus steel. A chef's dream.",
  },
  {
    id: 40,
    name: "Architectural Desk Lamp",
    category: "tools",
    price: "$295",
    image: "/vesna-imgs/vintage-workdesk-darkgold.webp",
    badge: "Restored",
    quote: "Vintage 1960s lamp. Fully restored.",
  },
  {
    id: 41,
    name: "Stoicism Course",
    category: "courses",
    price: "$89",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    quote: "Ancient wisdom for modern challenges.",
  },
  {
    id: 42,
    name: "Premium Notebook Set",
    category: "tools",
    price: "$78",
    image: "/vesna-imgs/hand-touching-cloth.webp",
    quote: "Three notebooks for different purposes.",
  },
  {
    id: 43,
    name: "Smart Watch Edition",
    category: "tech",
    price: "$799",
    image: "/vesna-imgs/luxury-watch-on-book.webp",
    quote: "Titanium case. Health tracking refined.",
  },
  {
    id: 44,
    name: "Luxury Duffel Bag",
    category: "fashion",
    price: "$1,200",
    image: "/vesna-imgs/cinematic-handbag.webp",
    badge: "Limited",
    quote: "Weekend trips never looked so good.",
  },
  {
    id: 45,
    name: "Digital Minimalism Guide",
    category: "ebooks",
    price: "$24",
    image:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80",
    quote: "Reclaim attention in a distracted world.",
  },
  {
    id: 46,
    name: "Home Bar Essentials",
    category: "home",
    price: "$450",
    image: "/vesna-imgs/coffee-maker-in-kitchen.webp",
    quote: "Everything for the perfect evening ritual.",
  },
  {
    id: 47,
    name: "Photography Masterclass",
    category: "courses",
    price: "$199",
    image: "/vesna-imgs/secondary-overlay-image.webp",
    badge: "Featured",
    quote: "See the world differently. Capture moments.",
  },
];

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "courses", label: "Courses" },
  { id: "ebooks", label: "Ebooks" },
  { id: "tools", label: "Tools" },
  { id: "templates", label: "Templates" },
  { id: "apps", label: "Apps" },
  { id: "finance", label: "Finance" },
  { id: "fashion", label: "Fashion" },
  { id: "tech", label: "Tech" },
  { id: "home", label: "Home" },
  { id: "food", label: "Food" },
];

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
            <h1 className="font-audiowide text-6xl text-primary mb-4">
              Vesna Picks
            </h1>
            <p className="font-[family-name:var(--font-spectral)] text-xl text-on-background mb-6 opacity-70 font-light">
              Victory&apos;s personal recommendations.
            </p>
            <span className="font-[family-name:var(--font-tenor-sans)] text-xs tracking-widest text-outline uppercase">
              47 picks
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
              <article
                key={product.id}
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
                <div className="relative aspect-video overflow-hidden cursor-pointer">
                  <Image alt={product.name} src={product.image} fill className="object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-4">
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
                  <h3 className="font-audiowide text-2xl text-on-background mb-4">
                    {product.name}
                  </h3>
                  <p className="font-[family-name:var(--font-playfair)] text-on-surface-variant text-sm italic opacity-80 mb-8 line-clamp-2">
                    &ldquo;{product.quote}&rdquo;
                  </p>
                  <button className="mt-auto w-full py-4 border border-primary text-primary font-[family-name:var(--font-tenor-sans)] uppercase text-[10px] tracking-[0.2em] hover:bg-primary hover:text-black transition-all duration-300">
                    See this  →
                  </button>
                </div>
              </article>
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
