import { ARTICLES } from './journal-data'
import type { VenusReading } from './venus-stream'

/** Recommend published Journal entries, never invented titles or archive records. */
export function selectVenusReadings(message: string): VenusReading[] {
  const query = message.toLowerCase()
  if (!/\b(read|reading|journal|story|stories|essay|article|archive)\b/.test(query)) return []
  const terms = query.match(/[a-z]{4,}/g)?.filter(term => !['read', 'reading', 'journal', 'story', 'stories', 'essay', 'article', 'archive', 'something', 'recommend', 'about', 'with', 'please'].includes(term)) ?? []
  const ranked = ARTICLES.map((article, index) => {
    const text = `${article.title} ${article.excerpt} ${article.categoryLabel} ${article.sections.map(section => section.heading + ' ' + section.paragraphs.join(' ')).join(' ')}`.toLowerCase()
    const score = terms.reduce((total, term) => total + (text.includes(term) ? 1 : 0), 0)
    return { article, score, index }
  }).sort((a, b) => b.score - a.score || a.index - b.index)
  const matched = ranked.filter(result => result.score > 0)
  return (matched.length ? matched : ranked).slice(0, 3).map(({ article: { slug, title, excerpt, image, categoryLabel, readTime } }) => ({ slug, title, excerpt, image, categoryLabel, readTime }))
}
