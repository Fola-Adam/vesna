import { createClient } from '@/lib/supabase/server'
import { STORY_FIELDS, validateStory } from '@/lib/journal-publishing'

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin || origin !== new URL(request.url).origin) return Response.json({ error: 'Invalid request origin.' }, { status: 403 })
  if (Number(request.headers.get('content-length') ?? 0) > 100000) return Response.json({ error: 'Story is too large.' }, { status: 413 })
  const client = await createClient()
  const { data: { user }, error: authError } = await client.auth.getUser()
  if (!user || authError) return Response.json({ error: 'Please sign in again.' }, { status: 401 })
  const { data: profile } = await client.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return Response.json({ error: 'Admin access required.' }, { status: 403 })
  try {
    const raw = await request.text()
    if (raw.length > 100000) return Response.json({ error: 'Story is too large.' }, { status: 413 })
    const input = JSON.parse(raw)
    const story = validateStory(input)
    const id = input.id
    if (id && (typeof id !== 'string' || !/^[0-9a-f-]{36}$/i.test(id))) throw new Error('Invalid story ID.')
    let publishedAt: string | null = null
    if (id) {
      const { data: current, error } = await client.from('journal_articles').select('published_at,updated_at').eq('id', id).single()
      if (error || !current) return Response.json({ error: 'Story not found.' }, { status: 404 })
      if (input.updated_at !== current.updated_at) return Response.json({ error: 'This story changed in another window. Reload before saving.' }, { status: 409 })
      publishedAt = current.published_at
    }
    const payload = { ...story, published_at: story.status === 'published' ? publishedAt ?? new Date().toISOString() : publishedAt, updated_at: new Date().toISOString() }
    const result = id
      ? await client.from('journal_articles').update(payload).eq('id', id).eq('updated_at', input.updated_at).select(STORY_FIELDS).single()
      : await client.from('journal_articles').insert(payload).select(STORY_FIELDS).single()
    if (result.error) return Response.json({ error: result.error.code === '23505' ? 'That URL slug is already in use.' : 'Could not save the story. Reload and try again.' }, { status: 409 })
    return Response.json({ story: result.data })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Invalid story.' }, { status: 400 })
  }
}
