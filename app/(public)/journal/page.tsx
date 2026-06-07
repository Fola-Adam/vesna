"use client";

import { useState } from "react";
import ScrollProgress from "@/components/ScrollProgress";

const ARTICLES = [
  {
    id: 1,
    title: "Why We Choose Less",
    category: "curator",
    categoryLabel: "Curator's Notes",
    excerpt: "Curation is an act of elimination. For every object we showcase, dozens are set aside. The question isn't what to include—it's what to leave out.",
    image: "/vesna-imgs/curated-novels.png",
    readTime: "5 min",
    hasGreenBorder: true,
  },
  {
    id: 2,
    title: "The Ritual of Writing",
    category: "objects",
    categoryLabel: "Object Stories",
    excerpt: "There's something sacred about the first stroke of ink on paper. In our digital age, the fountain pen becomes not just a tool, but a portal to intentionality.",
    image: "/vesna-imgs/premium-fountain-pen.png",
    readTime: "6 min",
    hasGreenBorder: false,
  },
  {
    id: 3,
    title: "Space as Sanctuary",
    category: "philosophy",
    categoryLabel: "Design Philosophy",
    excerpt: "Our environments shape our thoughts. The minimalist isn't denying themselves—they're making room for what matters.",
    image: "/vesna-imgs/native-incense-platform.png",
    readTime: "4 min",
    hasGreenBorder: false,
    isPrimaryCategory: true,
  },
  {
    id: 4,
    title: "Time as Luxury",
    category: "objects",
    categoryLabel: "Object Stories",
    excerpt: "The mechanical watch is an anachronism that refuses to die. In a world of digital precision, its imperfection becomes its charm.",
    image: "/vesna-imgs/luxury-watch-on-book.png",
    readTime: "7 min",
    hasGreenBorder: false,
  },
  {
    id: 5,
    title: "The Art of Selection",
    category: "curator",
    categoryLabel: "Curator's Notes",
    excerpt: "Behind every curated collection lies a thousand rejected options. The curator's eye is trained not just to see quality, but to recognize the subtle signals of authenticity.",
    image: "/vesna-imgs/cinematic-handbag.png",
    readTime: "5 min",
    hasGreenBorder: true,
  },
  {
    id: 6,
    title: "Tactile Memory",
    category: "philosophy",
    categoryLabel: "Design Philosophy",
    excerpt: "We remember texture more vividly than sight. The grain of leather, the weight of ceramic—our hands hold memories our eyes cannot.",
    image: "/vesna-imgs/hand-touching-cloth.png",
    readTime: "4 min",
    hasGreenBorder: false,
    isPrimaryCategory: true,
  },
];

export default function JournalPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const categories = [
    { id: "all", label: "All Stories" },
    { id: "philosophy", label: "Design Philosophy" },
    { id: "curator", label: "Curator's Notes" },
    { id: "objects", label: "Object Stories" },
  ];

  const filteredArticles = activeCategory === "all" 
    ? ARTICLES 
    : ARTICLES.filter(a => a.category === activeCategory);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
  };

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
            <img
              src="/vesna-imgs/editorial-luxurious-workspace.png"
              alt="Journal"
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#131313]/50 via-[#131313]/70 to-[#131313]" />
          </div>
          <div className="relative z-10 text-center px-5 max-w-4xl mx-auto pt-24">
            <p className="font-[family-name:var(--font-tenor-sans)] text-xs text-[#95d4b3] uppercase tracking-[0.3em] mb-4">
              The Vesna Journal
            </p>
            <h1 className="font-[family-name:var(--font-dm-serif)] text-4xl sm:text-5xl lg:text-6xl text-[#e5e2e1] mb-6">
              Thoughts on<br />Intentional Living
            </h1>
            <p className="font-[family-name:var(--font-spectral)] text-lg text-[#d0c5b2] max-w-2xl mx-auto">
              Essays, stories, and reflections on design philosophy, the curator&apos;s
              craft, and the objects that shape our lives.
            </p>
          </div>
        </section>

        {/* Category Filters */}
        <section className="py-8 px-5 sm:px-8 lg:px-20 border-b border-[#201f1f]">
          <div className="max-w-screen-xl mx-auto">
            <div className="flex flex-wrap gap-4 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`font-[family-name:var(--font-tenor-sans)] text-xs uppercase tracking-[0.15em] px-4 py-2 border transition-all ${
                    activeCategory === cat.id
                      ? "border-[#e6c364] text-[#e6c364]"
                      : "border-[#99907e]/30 text-[#d0c5b2] hover:text-[#e6c364] hover:border-[#e6c364]"
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
                <div className="relative aspect-[4/3] overflow-hidden bg-[#201f1f]">
                  <img
                    src="/vesna-imgs/vintage-workdesk-darkgold.png"
                    alt="The Weight of Quality"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="font-[family-name:var(--font-tenor-sans)] text-[10px] uppercase tracking-[0.2em] px-3 py-1 bg-[#e6c364] text-[#3d2e00]">
                      Featured
                    </span>
                  </div>
                </div>
                <div className="lg:py-8">
                  <p className="font-[family-name:var(--font-tenor-sans)] text-xs text-[#95d4b3] uppercase tracking-[0.2em] mb-3">
                    Design Philosophy
                  </p>
                  <h2 className="font-[family-name:var(--font-dm-serif)] text-2xl sm:text-3xl lg:text-4xl text-[#e5e2e1] mb-4">
                    The Weight of Quality
                  </h2>
                  <p className="font-[family-name:var(--font-spectral)] text-base text-[#d0c5b2] mb-6 leading-relaxed">
                    In an age of disposable everything, we often forget the
                    satisfying heft of a well-made object. The weight of quality
                    isn&apos;t measured in grams—it&apos;s felt in the permanence of
                    something built to last, to be repaired, to be passed down.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-[#99907e]">
                    <span className="font-[family-name:var(--font-tenor-sans)] uppercase tracking-[0.1em]">Ebenezer Victory</span>
                    <span>|</span>
                    <span className="font-[family-name:var(--font-spectral)]">8 min read</span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* Article Grid */}
        <section className="py-16 lg:py-24 px-5 sm:px-8 lg:px-20 bg-[#0e0e0e] bg-green-wash">
          <div className="max-w-screen-xl mx-auto">
            <h2 className="font-[family-name:var(--font-cinzel)] text-xs text-[#95d4b3] uppercase tracking-[0.2em] mb-12 text-center">
              Recent Essays
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  className={`article-card group cursor-pointer ${article.hasGreenBorder ? 'border-green-subtle' : ''}`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#201f1f] mb-5">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className={`font-[family-name:var(--font-tenor-sans)] text-[10px] uppercase tracking-[0.2em] mb-2 ${article.isPrimaryCategory ? 'text-[#e6c364]' : 'text-[#95d4b3]'}`}>
                    {article.categoryLabel}
                  </p>
                  <h3 className="font-[family-name:var(--font-dm-serif)] text-xl text-[#e5e2e1] mb-3 group-hover:text-[#e6c364] transition-colors">
                    {article.title}
                  </h3>
                  <p className="font-[family-name:var(--font-spectral)] text-sm text-[#d0c5b2] mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[#99907e]">
                    <span className="font-[family-name:var(--font-tenor-sans)] uppercase tracking-[0.1em]">Ebenezer Victory</span>
                    <span>|</span>
                    <span className="font-[family-name:var(--font-spectral)]">{article.readTime}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-20 lg:py-32 px-5 sm:px-8 lg:px-20">
          <div className="max-w-3xl mx-auto text-center">
            <span className="material-symbols-outlined text-4xl text-[#95d4b3] mb-6">mail</span>
            <h2 className="font-[family-name:var(--font-dm-serif)] text-2xl sm:text-3xl lg:text-4xl text-[#e5e2e1] mb-4">
              Stories in Your Inbox
            </h2>
            <p className="font-[family-name:var(--font-spectral)] text-base text-[#d0c5b2] mb-8">
              Receive new essays on intentional living, curation insights, and
              early access to featured objects.
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
