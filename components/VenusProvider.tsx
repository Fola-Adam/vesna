'use client'

import { createContext, useContext, useState } from 'react'

interface VenusContextValue {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  draft: string
  setDraft: (draft: string) => void
  productSlug: string | null
  openChat: (question?: string, productSlug?: string) => void
}
const VenusContext = createContext<VenusContextValue | null>(null)

export function VenusProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [productSlug, setProductSlug] = useState<string | null>(null)
  const value = {
    isOpen, setIsOpen, draft, setDraft, productSlug,
    openChat(question = '', slug?: string) {
      setDraft(question)
      setProductSlug(slug ?? null)
      setIsOpen(true)
    },
  }
  return <VenusContext.Provider value={value}>{children}</VenusContext.Provider>
}

export function useVenus() {
  const value = useContext(VenusContext)
  if (!value) throw new Error('Venus controls must be inside VenusProvider')
  return value
}
