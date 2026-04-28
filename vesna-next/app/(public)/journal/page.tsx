'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const CATEGORIES = ['all', 'philosophy', 'curator', 'objects']

const ARTICLES = [
  {
    id: 1,
    title: 'The Weight of Quality',
    category: 'philosophy',
    categoryLabel: 'Design Philosophy',
    excerpt: 'In an age of disposable everything, we often forget the satisfying heft of a well-made object. The weight of quality isn\'t measured in grams—it\'s felt in the permanence of something built to last.',
    author: 'Ebenezer Victory',
    readTime: '8 min',
    image: '/vesna-imgs/vintage-workdesk-darkgold.png',
    featured: true,
  },
  {
    id: 2,
    title: 'Why We Choose Less',
    category: 'curator',
    categoryLabel: 'Curator\'s Notes',
    excerpt: 'Curation is an act of elimination. For every object we showcase, dozens are set aside. The question isn\'t what to include—it\'s what to leave out.',
    author: 'Ebenezer Victory',
    readTime: '5 min',
    image: '/vesna-imgs/curated-novels.png',
  },
  {
    id: 3,
    title: 'The Ritual of Writing',
    category: 'objects',
    categoryLabel: 'Object Stories',
    excerpt: 'There\'s something sacred about the first stroke of ink on paper. In our digital age, the fountain pen becomes not just a tool, but a portal to intentionality.',
    author: 'Ebenezer Victory',
    readTime: '6 min',
    image: '/vesna-imgs/premium-fountain-pen.png',
  },
  {
    id: 4,
    title: 'Space as Sanctuary',
    category: 'philosophy',
    categoryLabel: 'Design Philosophy',
    excerpt: 'Our environments shape our thoughts. The minimalist isn\'t denying themselves—they\'re making room for what matters.',
    author: 'Ebenezer Victory',
    readTime: '4 min',
    image: '/vesna-imgs/native-incense-platform.png',
  },
  {
    id: 5,
    title: 'Time as Luxury',
    category: 'objects',
    categoryLabel: 'Object Stories',
    excerpt: 'The mechanical watch is an anachronism that refuses to die. In a world of digital precision, its imperfection becomes its charm.',
    author: 'Ebenezer Victory',
    readTime: '7 min',
    image: '/vesna-imgs/luxury-watch-on-book.png',
  },
  {
    id: 6,
    title: 'The Art of Selection',
    category: 'curator',
    categoryLabel: 'Curator\'s Notes',
    excerpt: 'Behind every curated collection lies a thousand rejected options. The curator\'s eye is trained not just to see quality, but to recognize the subtle signals of authenticity.',
    author: 'Ebenezer Victory',
    readTime: '5 min',
    image: '/vesna-imgs/cinematic-handbag.png',
  },
  {
    id: 7,
    title: 'Tactile Memory',
    category: 'philosophy',
    categoryLabel: 'Design Philosophy',
    excerpt: 'We remember texture more vividly than sight. The grain of leather, the weight of ceramic—our hands hold memories our eyes cannot.',
    author: 'Ebenezer Victory',
    readTime: '4 min',
    image: '/vesna-imgs/hand-touching-cloth.png',
  },
]

export default function JournalPage() {
  const [currentCategory, setCurrentCategory] = useState('all')

  const filteredArticles = currentCategory === 'all'
    ? ARTICLES
    : ARTICLES.filter(article => article.category === currentCategory)

  const featuredArticle = ARTICLES.find(a => a.featured)
  const regularArticles = filteredArticles.filter(a => !a.featured)

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center bg-surface-dim">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/vesna-imgs/editorial-luxurious-workspace.png"
            alt="Journal"
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background" />
        </div>
        <div className="relative z-10 text-center px-5 max-w-4xl mx-auto pt-24">
          <p className="font-button-label text-xs text-secondary uppercase tracking-[0.3em] mb-4">
            The Vesna Journal
          </p>
          <h1 className="font-display-hero text-4xl sm:text-5xl lg:text-6xl text-on-background mb-6">
            Thoughts on<br />Intentional Living
          </h1>
          <p className="font-body-main text-lg text-on-surface-variant max-w-2xl mx-auto">
            Essays, stories, and reflections on design philosophy, the curator's
            craft, and the objects that shape our lives.
          </p>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-8 px-5 sm:px-8 lg:px-20 border-b border-surface-container">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-wrap gap-4 justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCurrentCategory(cat)}
                className={`font-button-label text-xs uppercase tracking-[0.15em] px-4 py-2 border border-outline/30 transition-all ${
                  currentCategory === cat
                    ? 'text-primary border-primary'
                    : 'text-on-surface-variant hover:text-primary hover:border-primary'
                }`}
              >
                {cat === 'all' ? 'All Stories' : 
                 cat === 'philosophy' ? 'Design Philosophy' :
                 cat === 'curator' ? 'Curator\'s Notes' : 'Object Stories'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {featuredArticle && (currentCategory === 'all' || currentCategory === featuredArticle.category) && (
        <section className="py-16 lg:py-24 px-5 sm:px-8 lg:px-20">
          <div className="max-w-screen-xl mx-auto">
            <article className="group cursor-pointer">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
                  <Image
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="font-button-label text-[10px] uppercase tracking-[0.2em] px-3 py-1 bg-primary text-on-primary">
                      Featured
                    </span>
                  </div>
                </div>
                <div className="lg:py-8">
                  <p className="font-button-label text-xs text-secondary uppercase tracking-[0.2em] mb-3">
                    {featuredArticle.categoryLabel}
                  </p>
                  <h2 className="font-display-hero text-2xl sm:text-3xl lg:text-4xl text-on-background mb-4">
                    {featuredArticle.title}
                  </h2>
                  <p className="font-body-main text-base text-on-surface-variant mb-6 leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-outline">
                    <span className="font-button-label uppercase tracking-[0.1em]">
                      {featuredArticle.author}
                    </span>
                    <span>|</span>
                    <span className="font-body-main">{featuredArticle.readTime} read</span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* Article Grid */}
      <section className="py-16 lg:py-24 px-5 sm:px-8 lg:px-20 bg-surface-container-lowest">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="font-section-header text-xs text-secondary uppercase tracking-[0.2em] mb-12 text-center">
            Recent Essays
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 lg:py-32 px-5 sm:px-8 lg:px-20">
        <div className="max-w-3xl mx-auto text-center">
          <span className="material-symbols-outlined text-4xl text-secondary mb-6">
            mail
          </span>
          <h2 className="font-display-hero text-2xl sm:text-3xl lg:text-4xl text-on-background mb-4">
            Stories in Your Inbox
          </h2>
          <p className="font-body-main text-base text-on-surface-variant mb-8">
            Receive new essays on intentional living, curation insights, and
            early access to featured objects.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-surface-container border border-outline/30 px-4 py-3 text-on-background placeholder:text-outline/50 focus:outline-none focus:border-secondary font-body-main"
              required
            />
            <button
              type="submit"
              className="font-button-label text-xs uppercase tracking-[0.2em] px-8 py-3 transition-all text-on-primary"
              style={{ background: 'linear-gradient(90deg, #e6c364, #95d4b3)' }}
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}

function ArticleCard({ article }: { article: typeof ARTICLES[0] }) {
  return (
    <article className="group cursor-pointer border border-secondary/15 transition-transform duration-500 hover:-translate-y-2">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-container mb-5">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
      </div>
      <p className="font-button-label text-[10px] text-secondary uppercase tracking-[0.2em] mb-2">
        {article.categoryLabel}
      </p>
      <h3 className="font-display-hero text-xl text-on-background mb-3 group-hover:text-primary transition-colors">
        {article.title}
      </h3>
      <p className="font-body-main text-sm text-on-surface-variant mb-4 line-clamp-3">
        {article.excerpt}
      </p>
      <div className="flex items-center gap-3 text-xs text-outline">
        <span className="font-button-label uppercase tracking-[0.1em]">
          {article.author}
        </span>
        <span>|</span>
        <span className="font-body-main">{article.readTime}</span>
      </div>
    </article>
  )
}
