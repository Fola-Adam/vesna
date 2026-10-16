'use client'

import { Check, Circle, LoaderCircle, TriangleAlert } from 'lucide-react'
import type { VenusActivity as Activity } from '@/lib/venus-task'

export default function VenusActivity({ activities, live = false }: { activities: Activity[]; live?: boolean }) {
  if (!activities.length) return null
  const rows = <ol className="space-y-2 py-3">{activities.map(activity => {
    const Icon = activity.state === 'running' ? LoaderCircle : activity.state === 'complete' ? Check : TriangleAlert
    return <li key={activity.id} className="flex items-start gap-2 text-xs leading-5 text-ink-muted"><Icon aria-hidden="true" size={14} className={`mt-0.5 shrink-0 ${activity.state === 'running' ? 'animate-spin motion-reduce:animate-none' : ''}`} /><span>{activity.label}</span></li>
  })}</ol>
  return live ? <div role="status" aria-live="polite" className="mb-4 w-full border-l border-primary-ink/20 pl-3">{rows}</div> : <details className="mt-3 w-full border-t border-ink/10"><summary className="cursor-pointer py-3 text-xs font-medium text-primary-ink"><Circle aria-hidden="true" size={10} className="mr-2 inline-block" />Activity · {activities.length} {activities.length===1?'step':'steps'}</summary>{rows}</details>
}
