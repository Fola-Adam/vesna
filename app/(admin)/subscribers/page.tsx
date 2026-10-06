'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/use-debounce'
import { ChevronLeft, ChevronRight } from 'lucide-react'



const ITEMS_PER_PAGE = 20

interface Subscriber {
  id: string
  email: string
  first_name: string | null
  source: string
  is_verified: boolean
  subscribed_at: string
  unsubscribed_at: string | null
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const debouncedSearch = useDebounce(searchQuery, 300)
  const supabase = createClient()

  const fetchSubscribers = async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    setLoading(true)

    const from = (currentPage - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    let query = supabase
      .from('email_subscribers')
      .select('*', { count: 'exact' })
      .order('subscribed_at', { ascending: false })
      .range(from, to)

    if (debouncedSearch) {
      query = query.or(`email.ilike.%${debouncedSearch}%,first_name.ilike.%${debouncedSearch}%`)
    }

    const { data, count, error: fetchError } = await query

    if (!fetchError) {
      setSubscribers((data as Subscriber[]) || [])
      setError(null)
      setTotalCount(count || 0)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchSubscribers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-section-header text-on-surface-variant text-xs tracking-[0.2em] mb-1">Audience</h2>
        <p className="font-audiowide text-2xl text-on-background">Subscribers</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search by email or name..."
              className="max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {loading && <span className="font-section-header text-[10px] text-on-surface-variant tracking-[0.1em]">Loading...</span>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-3 px-4 font-section-header text-[10px] tracking-[0.15em] text-on-surface-variant">Email</th>
                  <th className="text-left py-3 px-4 font-section-header text-[10px] tracking-[0.15em] text-on-surface-variant">Name</th>
                  <th className="text-left py-3 px-4 font-section-header text-[10px] tracking-[0.15em] text-on-surface-variant">Source</th>
                  <th className="text-left py-3 px-4 font-section-header text-[10px] tracking-[0.15em] text-on-surface-variant">Status</th>
                  <th className="text-left py-3 px-4 font-section-header text-[10px] tracking-[0.15em] text-on-surface-variant">Date</th>
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
                            Verified
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-on-surface-variant">
                      {debouncedSearch ? 'No subscribers match your search.' : 'No subscribers yet.'}
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
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
