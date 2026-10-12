'use client'

import { useState } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { useShortlist } from '@/lib/shortlist'

export default function ShortlistButton({ id, name }: { id: string; name: string }) {
  const { ids, toggle } = useShortlist()
  const [error, setError] = useState(false)
  const saved = ids.includes(id)
  const Mark = saved ? BookmarkCheck : Bookmark
  return <div>
    <button type="button" aria-pressed={saved} aria-label={`${saved ? 'Remove' : 'Save'} ${name} ${saved ? 'from' : 'to'} your shortlist`} onClick={() => setError(!toggle(id))} className="inline-flex min-h-11 w-full items-center justify-center gap-2 border border-ink/20 px-3 py-2 text-sm font-medium text-primary-ink transition-colors hover:border-primary-ink hover:bg-green-wash focus-ring">
      <Mark size={16} aria-hidden="true" />{saved ? 'Saved to shortlist' : 'Save this pick'}
    </button>
    {error && <p role="status" className="mt-2 text-xs text-ink-muted">Could not save. Enable browser storage or remove a saved pick if your list is full.</p>}
  </div>
}
