'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/use-debounce'
import { Check, Copy, ChevronLeft, ChevronRight } from 'lucide-react'



const ITEMS_PER_PAGE = 20

interface Subscriber {
  id: string
  email: string
  first_name: string | null
  source: string
  is_verified: boolean
  subscribed_at: string
  unsubscribed_at: string | null
  unsubscribe_token: string
}

export default function SubscribersPage() {
  const supabase = createClient()
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(Boolean(supabase))
  const [searchQuery, setSearchQuery] = useState('')
  const [status, setStatus] = useState<'all' | 'confirmed' | 'pending' | 'unsubscribed'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const requestSequence = useRef(0)

  const [copiedId, setCopiedId] = useState<string | null>(null)
  async function copyUnsubscribeLink(subscriber: Subscriber) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribe_token)}`)
      setCopiedId(subscriber.id)
    } catch { setError('Could not copy the link. Browser clipboard access is required.') }
  }

  const debouncedSearch = useDebounce(searchQuery, 300)

  const fetchSubscribers = async () => {
    if (!supabase) return
    const request = ++requestSequence.current
    setLoading(true)

    const from = (currentPage - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    let query = supabase
      .from('email_subscribers')
      .select('*', { count: 'exact' })
      .order('subscribed_at', { ascending: false })
      .range(from, to)

    if (debouncedSearch) {
      const search = debouncedSearch.replace(/[(),]/g, '').replace(/[\\%_]/g, '\\$&')
      query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%`)
    }
    if (status === 'unsubscribed') query = query.not('unsubscribed_at', 'is', null)
    if (status === 'confirmed') query = query.is('unsubscribed_at', null).eq('is_verified', true)
    if (status === 'pending') query = query.is('unsubscribed_at', null).not('is_verified', 'is', true)

    const { data, count, error: fetchError } = await query
    // Rapid filter changes must not let an older response overwrite the result.
    if (request !== requestSequence.current) return

    if (fetchError) {
      setError(fetchError.message)
      setSubscribers([])
      setTotalCount(0)
    } else {
      setSubscribers((data as Subscriber[]) || [])
      setError(null)
      setTotalCount(count || 0)
    }

    setLoading(false)
  }

  useEffect(() => {
    void Promise.resolve().then(fetchSubscribers)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, currentPage, status])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-section-header text-ink-muted text-xs tracking-[0.2em] mb-1">Audience</h2>
        <p className="font-display-hero text-4xl text-ink">Subscribers</p>
      </div>

      <Card>
        <CardHeader>
          <p className="mb-4 text-sm leading-relaxed text-on-surface-variant">Confirmed readers have verified their email. Pending addresses have not confirmed yet. Readers who unsubscribed must confirm a new signup before rejoining.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Input
              placeholder="Search by email or name..."
              aria-label="Search subscribers"
              className="max-w-sm"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
                setLoading(Boolean(supabase))
              }}
            />
            {loading && <span className="font-section-header text-[10px] text-on-surface-variant tracking-[0.1em]">Loading...</span>}
            <label className="flex items-center gap-2 text-sm text-on-background">Status<select aria-label="Subscriber status" value={status} onChange={event => { setStatus(event.target.value as typeof status); setCurrentPage(1); setLoading(Boolean(supabase)) }} className="min-h-11 rounded border border-outline-variant bg-surface px-3 focus-ring"><option value="all">All readers</option><option value="confirmed">Confirmed</option><option value="pending">Pending</option><option value="unsubscribed">Unsubscribed</option></select></label>
          </div>
        </CardHeader>
        <CardContent>
          {error && <p role="alert" className="mb-4 text-sm text-destructive">{error}</p>}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-3 px-4 font-section-header text-[10px] tracking-[0.15em] text-on-surface-variant">Email</th>
                  <th className="text-left py-3 px-4 font-section-header text-[10px] tracking-[0.15em] text-on-surface-variant">Name</th>
                  <th className="text-left py-3 px-4 font-section-header text-[10px] tracking-[0.15em] text-on-surface-variant">Source</th>
                  <th className="text-left py-3 px-4 font-section-header text-[10px] tracking-[0.15em] text-on-surface-variant">Status</th>
                  <th className="text-left py-3 px-4 font-section-header text-[10px] tracking-[0.15em] text-on-surface-variant">Date</th>
                  <th className="text-left py-3 px-4 text-xs text-on-surface-variant">Preferences</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-outline-variant/30">
                      <td className="py-3 px-4"><Skeleton className="h-4 w-48" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                    </tr>
                  ))
                ) : subscribers.length > 0 ? (
                  subscribers.map((sub) => (
                    <tr
                      key={sub.id}
                      className="border-b border-outline-variant/30 hover:bg-surface-container/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="text-sm text-on-background">{sub.email}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-on-surface-variant">
                        {sub.first_name || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-section-header text-[10px] tracking-[0.1em] bg-primary/10 text-primary">
                          {sub.source}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {sub.unsubscribed_at ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-section-header text-[10px] tracking-[0.1em] bg-stone-500/10 text-stone-500">
                            Unsubscribed
                          </span>
                        ) : sub.is_verified ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-section-header text-[10px] tracking-[0.1em] bg-green-500/10 text-green-500">
                            Confirmed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-section-header text-[10px] tracking-[0.1em] bg-amber-500/10 text-amber-500">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-section-header text-[10px] text-on-surface-variant tracking-[0.1em]">
                        {new Date(sub.subscribed_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4"><button type="button" onClick={() => void copyUnsubscribeLink(sub)} className="inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded border border-outline-variant px-3 text-xs text-on-background focus-ring">{copiedId === sub.id ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}{copiedId === sub.id ? 'Copied' : 'Copy unsubscribe link'}</button></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-on-surface-variant">
                      {debouncedSearch || status !== 'all' ? 'No readers match these filters.' : 'No subscribers yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-outline-variant">
              <p className="font-section-header text-[10px] text-on-surface-variant tracking-[0.1em]">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  className="h-8 w-8 p-0"
                  variant="outline"
                  onClick={() => {
                    setCurrentPage(p => Math.max(1, p - 1))
                    setLoading(Boolean(supabase))
                  }}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-section-header text-[10px] text-on-surface-variant tracking-[0.1em] px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  className="h-8 w-8 p-0"
                  variant="outline"
                  onClick={() => {
                    setCurrentPage(p => Math.min(totalPages, p + 1))
                    setLoading(Boolean(supabase))
                  }}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
