import type { JournalArticle } from './journal-data'

export interface JournalRecord {
  id: string; slug: string; title: string; excerpt: string; body: string; image: string
  caption: string; author: string; category: string; status: 'draft' | 'published'
  published_at: string | null; updated_at: string
}
export const STORY_FIELDS = 'id,slug,title,excerpt,body,image,caption,author,category,status,published_at,updated_at'
export function articleFromRecord(record: JournalRecord): JournalArticle {
  const categoryLabel = { curator: 'Curator’s notes', objects: 'Objects & use', philosophy: 'Space & ritual' }[record.category] ?? 'Journal'
  return { ...record, categoryLabel, readTime: `${Math.max(1, Math.ceil(record.body.split(/\s+/).filter(Boolean).length / 220))} min read`, sections: [] }
}
export function validateStory(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid story.')
  const data = input as Record<string, unknown>
  const text = (key: string, max: number) => { if (typeof data[key] !== 'string' || data[key].length > max) throw new Error(`Check ${key}.`); return data[key].trim() }
  const story = { title: text('title', 180), slug: text('slug', 180), excerpt: text('excerpt', 700), body: text('body', 60000), image: text('image', 2000), caption: text('caption', 500), author: text('author', 100), category: text('category', 30), status: text('status', 20) }
  if (!story.title || !story.author || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(story.slug)) throw new Error('Add a title, author, and valid URL slug.')
  if (!['curator', 'objects', 'philosophy'].includes(story.category) || !['draft', 'published'].includes(story.status)) throw new Error('Invalid category or status.')
  if (story.image && !story.image.startsWith('/vesna-imgs/')) { try { if (new URL(story.image).protocol !== 'https:') throw new Error() } catch { throw new Error('Use an HTTPS image URL or an uploaded image.') } }
  if (story.status === 'published' && (!story.body || !story.excerpt || !story.image)) throw new Error('Publishing requires a body, excerpt, and cover image.')
  return story
}
