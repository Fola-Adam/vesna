import { notFound } from 'next/navigation'
import JournalEditor from '@/components/admin/journal-editor'
import { createClient } from '@/lib/supabase/server'
import { STORY_FIELDS, type JournalRecord } from '@/lib/journal-publishing'
export const dynamic = 'force-dynamic'
export default async function EditStory({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const client = await createClient()
  const { data, error } = await client.from('journal_articles').select(STORY_FIELDS).eq('id', id).single()
  if (error || !data) notFound()
  return <JournalEditor initial={data as JournalRecord} />
}
