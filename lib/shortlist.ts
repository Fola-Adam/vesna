'use client'

import { useMemo, useSyncExternalStore } from 'react'

const KEY = 'vesna-shortlist-v1'
const EVENT = 'vesna-shortlist-change'
const empty = () => ''
function snapshot() {
  try { return localStorage.getItem(KEY) ?? '' } catch { return '' }
}
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(EVENT, callback)
  return () => { window.removeEventListener('storage', callback); window.removeEventListener(EVENT, callback) }
}
function parse(value: string): string[] {
  try {
    const data: unknown = JSON.parse(value)
    return Array.isArray(data) ? [...new Set(data.filter((id): id is string => typeof id === 'string' && id.length <= 100))].slice(0, 200) : []
  } catch { return [] }
}

export function useShortlist() {
  const value = useSyncExternalStore(subscribe, snapshot, empty)
  const ids = useMemo(() => parse(value), [value])
  function toggle(id: string) {
    try {
      const current = parse(snapshot())
      if (!current.includes(id) && current.length >= 200) return false
      localStorage.setItem(KEY, JSON.stringify(current.includes(id) ? current.filter(item => item !== id) : [...current, id]))
      window.dispatchEvent(new Event(EVENT))
      return true
    } catch { return false }
  }
  return { ids, toggle }
}
