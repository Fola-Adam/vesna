'use client'

import { useMemo, useSyncExternalStore } from 'react'

const KEY = 'vesna-shortlist-v1'
const EVENT = 'vesna-shortlist-change'
const UNDO_KEY = 'vesna-shortlist-undo-v1'
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

function undoSnapshot() {
  try { return sessionStorage.getItem(UNDO_KEY) ?? '' } catch { return '' }
}
function write(ids: string[]) {
  const encoded = JSON.stringify(ids)
  localStorage.setItem(KEY, encoded)
  if (localStorage.getItem(KEY) !== encoded) throw new Error('Shortlist storage did not retain the update')
  window.dispatchEvent(new Event(EVENT))
}

export function useShortlist() {
  const value = useSyncExternalStore(subscribe, snapshot, empty)
  const undoValue = useSyncExternalStore(subscribe, undoSnapshot, empty)
  const ids = useMemo(() => parse(value), [value])
  const removedIds = useMemo(() => parse(undoValue), [undoValue])
  function add(id: string) {
    try {
      const current = parse(snapshot())
      if (current.includes(id)) return true
      if (current.length >= 200) return false
      write([...current, id])
      return true
    } catch { return false }
  }
  function addMany(newIds: string[]) {
    try {
      const current = parse(snapshot())
      const next = [...new Set([...current,...newIds])]
      if (next.length > 200) return {success:false,added:0}
      write(next)
      return {success:true,added:next.length-current.length}
    } catch {return {success:false,added:0}}
  }
  function remove(id: string) {
    try {
      const current = parse(snapshot())
      if (!current.includes(id)) return true
      sessionStorage.setItem(UNDO_KEY, JSON.stringify([id]))
      write(current.filter(item => item !== id))
      return true
    } catch { return false }
  }
  function clear() {
    try {
      const current = parse(snapshot())
      if (!current.length) return true
      sessionStorage.setItem(UNDO_KEY, JSON.stringify(current))
      write([])
      return true
    } catch { return false }
  }
  function undo() {
    try {
      const next = [...new Set([...parse(snapshot()), ...parse(undoSnapshot())])]
      if (next.length > 200) return false
      write(next)
      sessionStorage.removeItem(UNDO_KEY)
      window.dispatchEvent(new Event(EVENT))
      return true
    } catch { return false }
  }
  function toggle(id: string) { return parse(snapshot()).includes(id) ? remove(id) : add(id) }
  return { ids, toggle, add, addMany, remove, clear, undo, canUndo: removedIds.length > 0 }
}
