'use client'

import { useState } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { useShortlist } from '@/lib/shortlist'

export default function ShortlistButton({ id, name, compact = false }: { id: string; name: string; compact?: boolean }) {
  const { ids, toggle } = useShortlist()
  const [error, setError] = useState(false)
  const saved = ids.includes(id)
  const Mark = saved ? BookmarkCheck : Bookmark
  return <div className={compact ? 'relative' : undefined}>
    <button type="button" title={saved ? 'Remove from shortlist' : 'Save to shortlist'} aria-pressed={saved} aria-label={`${saved ? 'Remove' : 'Save'} ${name} ${saved ? 'from' : 'to'} your shortlist`} onClick={() => setError(!toggle(id))} className={compact ? 'inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-paper-raised text-primary-ink shadow-sm transition-colors hover:bg-green-wash focus-ring' : 'inline-flex min-h-11 w-full items-center justify-center gap-2 border border-ink/20 px-3 py-2 text-sm font-medium text-primary-ink transition-colors hover:border-primary-ink hover:bg-green-wash focus-ring'}>
      <Mark size={16} aria-hidden="true" />{!compact && (saved ? 'Saved to shortlist' : 'Save this pick')}
    </button>
    {error && <p role="status" className={compact ? 'absolute right-0 top-12 z-10 w-52 border border-ink/20 bg-paper-raised p-3 text-xs text-ink' : 'mt-2 text-xs text-ink-muted'}>Could not save. Enable browser storage or remove a saved pick if your list is full.</p>}
  </div>
}
