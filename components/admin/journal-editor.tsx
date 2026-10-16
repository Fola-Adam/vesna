'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { articleFromRecord, type JournalRecord } from '@/lib/journal-publishing'
import { JOURNAL_CATEGORIES } from '@/lib/journal-data'
import JournalStoryContent from '@/components/JournalStoryContent'
import { Eye, FileText, ImagePlus, Loader2, Save } from 'lucide-react'

export default function JournalEditor({ initial }: { initial?: JournalRecord }) {
  const router = useRouter()
  const [record, setRecord] = useState<JournalRecord>(initial ?? { id: '', slug: '', title: '', excerpt: '', body: '', image: '', caption: '', author: 'Vesna', category: 'curator', status: 'draft', published_at: null, updated_at: '' })
  const [preview, setPreview] = useState(false)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)
  const [manualSlug, setManualSlug] = useState(!!initial)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const field = 'w-full rounded-md border border-ink/20 bg-paper-raised px-3 py-3 text-base text-ink placeholder:text-ink-muted focus-ring'
  const change = (key: keyof JournalRecord, value: string) => setRecord(current => ({ ...current, [key]: value, ...(key === 'title' && !manualSlug ? { slug: value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-') } : {}) }))
  const format = (before: string, after = '') => {
    const area = bodyRef.current
    if (!area) return
    const start = area.selectionStart, end = area.selectionEnd
    change('body', record.body.slice(0, start) + before + record.body.slice(start, end) + after + record.body.slice(end))
    area.focus()
  }
  async function upload(file?: File) {
    if (!file) return
    const types: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' }
    if (!types[file.type] || file.size > 5 * 1024 * 1024) { setFailed(true); setMessage('Use JPG, PNG, WebP, or AVIF up to 5 MB.'); return }
    setUploading(true); setMessage('')
    try {
      const client = createClient()
      if (!client) throw new Error('The image service is unavailable.')
      const path = `journal/${crypto.randomUUID()}.${types[file.type]}`
      const { error } = await client.storage.from('product-images').upload(path, file, { contentType: file.type, upsert: false })
      if (error) throw new Error('Could not upload the cover image.')
      change('image', client.storage.from('product-images').getPublicUrl(path).data.publicUrl)
      setFailed(false); setMessage('Cover uploaded. Save the story to keep this change.')
    } catch (error) { setFailed(true); setMessage(error instanceof Error ? error.message : 'Upload failed.') } finally { setUploading(false) }
  }
  async function save(status: 'draft' | 'published') {
    setBusy(true); setMessage('')
    try {
      const response = await fetch('/api/admin/journal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...record, status }) })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.story) throw new Error(result?.error ?? 'Could not save. Check your sign-in and try again.')
      setRecord(result.story); setManualSlug(true); setFailed(false)
      setMessage(status === 'published' ? 'Published. The Journal and Venus can now read this story.' : 'Draft saved. This story is not visible in the public Journal.')
      if (!record.id) router.replace(`/admin/journal/${result.story.id}/edit`)
      router.refresh()
    } catch (error) { setFailed(true); setMessage(error instanceof Error ? error.message : 'Save failed.') } finally { setBusy(false) }
  }
  return <div className="space-y-6 text-ink">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-widest text-ink-muted">Curator studio / Journal</p><h1 className="mt-2 font-display-hero text-4xl">{record.id ? 'Edit story' : 'A new story'}</h1><p className="mt-2 text-sm text-ink-muted">{record.status === 'published' ? 'Published' : 'Private draft'}</p></div><button type="button" onClick={() => setPreview(value => !value)} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-ink/20 px-4 text-sm focus-ring">{preview ? <FileText size={16} /> : <Eye size={16} />}{preview ? 'Write' : 'Preview'}</button></header>
    {message && <p role={failed ? 'alert' : 'status'} className={`rounded-md border p-4 text-sm ${failed ? 'border-red-800/30 text-red-900' : 'border-primary-ink/20 text-primary-ink'}`}>{message}</p>}
    {preview ? <div className="overflow-hidden rounded-xl border border-ink/10"><JournalStoryContent article={articleFromRecord(record)} /></div> : <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
      <div className="min-w-0 space-y-5"><label className="block space-y-2 text-sm"><span>Title</span><input className={field} value={record.title} maxLength={180} onChange={event => change('title', event.target.value)} /></label><label className="block space-y-2 text-sm"><span>Short introduction</span><textarea className={field} rows={3} maxLength={700} value={record.excerpt} onChange={event => change('excerpt', event.target.value)} /></label><div><label htmlFor="story-body" className="mb-2 block text-sm">Story</label><div className="flex flex-wrap gap-2 rounded-t-md border border-b-0 border-ink/20 bg-paper-raised p-2">{[{ label: 'Heading', before: '\n\n## ' }, { label: 'Bold', before: '**', after: '**' }, { label: 'Quote', before: '\n\n> ' }, { label: 'List', before: '\n\n- ' }].map(item => <button type="button" key={item.label} onClick={() => format(item.before, item.after)} className="min-h-10 rounded px-3 text-xs hover:bg-ink/5 focus-ring">{item.label}</button>)}</div><textarea id="story-body" ref={bodyRef} className={`${field} min-h-[420px] rounded-t-none leading-7`} maxLength={60000} value={record.body} onChange={event => change('body', event.target.value)} /><p className="mt-2 text-xs text-ink-muted">Use headings, paragraphs, lists, and links. Preview shows the reader&apos;s layout.</p></div></div>
      <aside className="space-y-5 rounded-xl border border-ink/10 bg-paper-raised p-5"><label className="block space-y-2 text-sm"><span>Author</span><input className={field} value={record.author} maxLength={100} onChange={event => change('author', event.target.value)} /></label><label className="block space-y-2 text-sm"><span>Section</span><select className={field} value={record.category} onChange={event => change('category', event.target.value)}>{JOURNAL_CATEGORIES.filter(category => category.id !== 'all').map(category => <option key={category.id} value={category.id}>{category.label}</option>)}</select></label><label className="block space-y-2 text-sm"><span>URL slug</span><input className={field} value={record.slug} onChange={event => { setManualSlug(true); change('slug', event.target.value) }} /><span className="block text-xs text-ink-muted">{initial ? 'Changing this breaks previously shared links.' : 'Generated from the title; you can edit it.'}</span></label><label className="block space-y-2 text-sm"><span>Cover image URL</span><input className={field} value={record.image} onChange={event => change('image', event.target.value)} /></label><label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-ink/20 px-3 text-sm"><ImagePlus size={16} />{uploading ? 'Uploading cover...' : 'Upload a cover'}<input aria-label="Upload cover image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading || busy} className="sr-only" onChange={event => { void upload(event.target.files?.[0]); event.target.value = '' }} /></label><p className="text-xs leading-5 text-ink-muted">Cover images are public assets. Draft text stays private.</p><label className="block space-y-2 text-sm"><span>Image caption / credit</span><textarea className={field} rows={2} value={record.caption} maxLength={500} onChange={event => change('caption', event.target.value)} /></label></aside>
    </div>}
    <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-ink/15 bg-paper py-4"><p className="max-w-sm text-xs leading-5 text-ink-muted">{record.status === 'published' ? 'Saving as draft removes this story from the public Journal.' : 'Publish when the story, introduction, and cover are ready.'}</p><div className="flex gap-3"><button type="button" disabled={busy || uploading} onClick={() => void save('draft')} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-ink/25 px-4 text-sm focus-ring disabled:opacity-40"><Save size={16} />Save as draft</button><button type="button" disabled={busy || uploading} onClick={() => void save('published')} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary-ink px-5 text-sm text-paper focus-ring disabled:opacity-40">{busy && <Loader2 size={16} className="animate-spin" />}{record.status === 'published' ? 'Update published story' : 'Publish story'}</button></div></div>
  </div>
}
