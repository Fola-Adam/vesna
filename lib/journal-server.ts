import 'server-only'
import { cache } from 'react'
import { createClient } from '@supabase/supabase-js'
import { articleFromRecord, STORY_FIELDS, type JournalRecord } from './journal-publishing'

export const readPublishedStories = cache(async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Journal configuration is unavailable.')
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await client.from('journal_articles').select(STORY_FIELDS).eq('status', 'published').order('published_at', { ascending: false })
  if (error) throw new Error('The Journal is temporarily unavailable.')
  return (data as JournalRecord[]).map(articleFromRecord)
})
