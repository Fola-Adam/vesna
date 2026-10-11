'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowDown, ArrowUp, ArrowUpRight, Maximize, Minimize, RotateCcw, Square, Trash2, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { readVenusStream, type VenusProduct } from '@/lib/venus-stream'
import { formatPrice } from '@/lib/pricing'
import { useVenus } from './VenusProvider'
import CatalogImage from './CatalogImage'
import VenusMark from './VenusMark'

interface Message { role: 'assistant' | 'user'; content: string; products?: VenusProduct[]; error?: boolean }
const STORAGE_KEY = 'vesna_chat_messages'
const WELCOME_MESSAGES: Message[] = [{ role: 'assistant', content: "I'm Venus. Ask me about a pick, compare options, or describe what you're looking for." }]

function loadMessages(): Message[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(saved) ? saved.filter(message => message && ['user', 'assistant'].includes(message.role) && typeof message.content === 'string').slice(-50).map(message => ({ role: message.role, content: message.content, error: message.error === true })) : []
  } catch { return [] }
}
function saveMessages(messages: Message[]) {
  // Product snapshots must not survive a reload as if price/availability were still current.
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50).map(({ role, content, error }) => ({ role, content, error })))) } catch {}
}

export default function VenusChatWidget() {
  const { isOpen, setIsOpen, draft: inputValue, setDraft: setInputValue, productSlug, openChat, clearProductContext } = useVenus()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(WELCOME_MESSAGES)
  const [isTyping, setIsTyping] = useState(false)
  const [streamText, setStreamText] = useState('')
  const viewportRef = useRef<HTMLDivElement>(null)
  const pinnedRef = useRef(true)
  const [showLatest, setShowLatest] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const streamContentRef = useRef('')
  const streamProductsRef = useRef<VenusProduct[]>([])
  const streamFlushRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const requestRef = useRef<AbortController | null>(null)
  const messagesInitialized = useRef(false)

  useEffect(() => {
    let cancelled = false
    void Promise.resolve().then(() => {
      if (cancelled) return
      const saved = loadMessages()
      if (saved.length) setMessages(saved)
      messagesInitialized.current = true
    })
    return () => {
      cancelled = true
      requestRef.current?.abort()
      if (streamFlushRef.current) clearInterval(streamFlushRef.current)
    }
  }, [])
  useEffect(() => { if (messagesInitialized.current) saveMessages(messages) }, [messages])
  useEffect(() => {
    // Keep the welcome prompts in view on first open; only auto-scroll once a conversation exists.
    if (isOpen && pinnedRef.current && messages.some(message => message.role === 'user')) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
    }
  }, [isOpen, messages, isTyping, streamText])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = inputValue.trim()
    if (!text || isTyping || requestRef.current) return
    pinnedRef.current = true
    setShowLatest(false)
    const controller = new AbortController()
    requestRef.current = controller
    setInputValue('')
    setMessages(previous => [...previous, { role: 'user', content: text }])
    setIsTyping(true)
    setStreamText('')
    streamContentRef.current = ''
    streamProductsRef.current = []
    try {
      const response = await fetch('/api/venus', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ message: text, productSlug, history: messages.slice(-10).map(message => ({ role: message.role, content: message.content })) }),
      })
      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(typeof result?.error === 'string' ? result.error : 'Venus is temporarily unavailable. Please try again.')
      }
      if (!response.body) throw new Error('The response was empty. Please try again.')
      streamFlushRef.current = setInterval(() => setStreamText(streamContentRef.current), 80)
      await readVenusStream(response.body, event => {
        if (event.type === 'text') streamContentRef.current += event.text
        if (event.type === 'products') streamProductsRef.current = event.products
      })
      const content = streamContentRef.current
      if (content || streamProductsRef.current.length) {
        setMessages(previous => [...previous, { role: 'assistant', content, products: streamProductsRef.current }])
      }
    } catch (failure) {
      if (controller.signal.aborted && streamContentRef.current) {
        setMessages(previous => [...previous, { role: 'assistant', content: streamContentRef.current + '\n\n_Response stopped._', products: streamProductsRef.current }])
      }
      if (!controller.signal.aborted) setMessages(previous => [...previous, {
        role: 'assistant', error: true, content: failure instanceof Error ? failure.message : 'Venus is temporarily unavailable. Please try again.',
      }])
    } finally {
      if (streamFlushRef.current) clearInterval(streamFlushRef.current)
      streamFlushRef.current = null
      requestRef.current = null
      setStreamText('')
      setIsTyping(false)
    }
  }

  const hasConversation = messages.some(message => message.role === 'user')
  return <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
    <Dialog.Trigger asChild>
      <button onClick={() => openChat()} aria-label="Open chat assistant"
        className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-4 z-40 inline-flex min-h-14 items-center gap-3 rounded-full border border-primary/40 bg-[#10382d] py-2 pl-3 pr-5 text-paper shadow-xl transition-colors hover:bg-[#174938] focus-ring">
        <VenusMark className="h-9 w-11" /><span className="font-button-label text-sm">Ask Venus</span>
      </button>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm" />
      <Dialog.Content className={`fixed inset-y-0 right-0 z-[70] flex w-full flex-col border-l border-primary/25 bg-paper text-ink shadow-2xl focus:outline-none ${isFullscreen ? '' : 'sm:w-[480px] lg:w-[560px]'}`}>
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-primary/25 bg-[#10382d] px-4 py-4 text-paper sm:px-6">
          <div className="flex min-w-0 items-center gap-3"><VenusMark className="h-12 w-14 shrink-0" /><div>
            <Dialog.Title className="font-display-hero text-2xl">Venus</Dialog.Title>
            <Dialog.Description className="mt-1 text-xs text-paper/80">Your guide to the Vesna collection</Dialog.Description>
          </div></div>
          <div className="flex shrink-0">
            <button disabled={isTyping} aria-label="Start a new conversation" title="Start a new conversation" onClick={() => { setMessages(WELCOME_MESSAGES); saveMessages([]); clearProductContext() }} className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10 focus-ring disabled:opacity-40"><Trash2 aria-hidden="true" size={17} strokeWidth={1.5} /></button>
            <button aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} onClick={() => setIsFullscreen(full => !full)} className="hidden h-11 w-11 items-center justify-center rounded-full hover:bg-white/10 focus-ring sm:inline-flex">{isFullscreen ? <Minimize aria-hidden="true" size={17} strokeWidth={1.5} /> : <Maximize aria-hidden="true" size={17} strokeWidth={1.5} />}</button>
            <Dialog.Close aria-label="Close chat" className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10 focus-ring"><X aria-hidden="true" size={20} strokeWidth={1.5} /></Dialog.Close>
          </div>
        </header>
        {productSlug && <div className="flex items-center justify-between gap-3 border-b border-ink/10 bg-paper-raised px-5 py-3 text-xs"><span className="min-w-0 truncate">Discussing {productSlug.replaceAll('-', ' ')}</span><button onClick={clearProductContext} aria-label="Search the whole collection instead" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-ink/5 focus-ring"><X size={16} aria-hidden="true" /></button></div>}
        <div ref={viewportRef} onScroll={event => { const area = event.currentTarget; pinnedRef.current = area.scrollHeight - area.scrollTop - area.clientHeight < 100; setShowLatest(!pinnedRef.current) }} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-7 sm:px-6">
          {!hasConversation && <div className="mx-auto max-w-sm py-5 text-center"><VenusMark className="mx-auto mb-5 h-20 w-24" /><h2 className="font-display-hero text-3xl">A thoughtful place to begin.</h2><p className="mt-3 text-sm leading-7 text-ink-muted">Tell me what you need, your budget, or the ritual you want to improve. We&apos;ll find your place in the collection.</p>
            <div className="mt-7 grid gap-2 text-left">{['Find a considered gift under $100', 'Help me refine my workspace', 'Compare two picks'].map(question => <button key={question} disabled={isTyping} onClick={() => setInputValue(question)} className="flex min-h-12 items-center justify-between gap-3 rounded-lg border border-ink/15 bg-paper-raised px-4 py-3 text-sm transition-colors hover:border-[#1b5a45]/50 focus-ring">{question}<ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.5} /></button>)}</div>
          </div>}
          <div role="log" aria-label="Conversation with Venus" className="space-y-6">
            {(hasConversation ? messages : []).map((message, index) => <div key={index} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
              <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-ink-muted">{message.role === 'user' ? 'You' : 'Venus'}</p>
              <div className={`max-w-full break-words text-sm leading-7 [&_a]:text-[#1b5a45] [&_a]:underline [&_a]:underline-offset-4 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 ${message.role === 'user' ? 'max-w-[90%] rounded-2xl rounded-tr-sm bg-[#10382d] px-4 py-3 text-paper' : message.error ? 'rounded-lg border border-red-800/20 bg-red-50 p-4 text-red-900' : 'text-ink'}`}>
                {message.role === 'user' ? <p className="whitespace-pre-wrap !mb-0">{message.content}</p> : <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>}
              </div>
              {message.error && <button onClick={() => { const question = messages.slice(0, index).reverse().find(entry => entry.role === 'user'); if (question) setInputValue(question.content) }} className="mt-2 inline-flex min-h-11 items-center gap-2 text-xs text-ink-muted hover:text-ink focus-ring"><RotateCcw size={14} aria-hidden="true" />Try that question again</button>}
              {!!message.products?.length && <div className="mt-3 grid w-full grid-cols-1 gap-3 min-[400px]:grid-cols-2">{message.products.slice(0, 3).map(product => <Link key={product.slug} href={`/shop/${encodeURIComponent(product.slug)}`} onClick={() => setIsOpen(false)} className="group overflow-hidden rounded-lg border border-ink/15 bg-paper-raised transition-colors hover:border-[#1b5a45]/50 focus-ring">
                <div className="relative aspect-[4/3]"><CatalogImage src={product.image_urls?.[0]} alt={product.name} sizes="250px" /></div>
                <div className="p-3"><p className="text-sm leading-5">{product.name}</p><p className="mt-2 text-sm text-[#1b5a45]">{formatPrice(product.price)}</p><span className="mt-3 inline-flex items-center gap-2 text-xs text-ink-muted">Explore the pick <ArrowUpRight size={14} aria-hidden="true" strokeWidth={1.5} /></span></div>
              </Link>)}</div>}
            </div>)}
            {isTyping && <div className="text-sm leading-7 text-ink">{streamText ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamText}</ReactMarkdown> : <p role="status" className="text-ink-muted">Finding your place in the collection…</p>}</div>}
            <div ref={messagesEndRef} />
          </div>
        </div>
        {showLatest && <button onClick={() => { pinnedRef.current = true; setShowLatest(false); messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }) }} className="mx-auto mb-2 inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/15 bg-paper-raised px-4 text-xs text-ink focus-ring">Latest response <ArrowDown size={14} aria-hidden="true" /></button>}
        <footer className="shrink-0 border-t border-ink/10 bg-paper-raised px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6">
          <form onSubmit={handleSubmit} className="flex items-end gap-2 rounded-xl border border-ink/20 bg-paper p-2 focus-within:border-[#1b5a45]/60">
            <label className="sr-only" htmlFor="venus-message">Message Venus</label>
            <textarea id="venus-message" value={inputValue} onChange={event => setInputValue(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); if (!isTyping) event.currentTarget.form?.requestSubmit() } }} placeholder="What are you looking for?" rows={2} maxLength={2000}
              className="max-h-36 min-h-12 min-w-0 flex-1 resize-y bg-transparent px-2 py-2 text-base leading-6 text-ink placeholder:text-ink-muted focus:outline-none sm:text-sm" />
            {isTyping ? <button type="button" onClick={() => requestRef.current?.abort()} aria-label="Stop response" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#10382d] text-paper focus-ring"><Square aria-hidden="true" size={15} /></button> : <button type="submit" aria-label="Send message" disabled={!inputValue.trim()} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#10382d] text-paper focus-ring disabled:opacity-35"><ArrowUp aria-hidden="true" size={20} strokeWidth={1.5} /></button>}
          </form>
          <p className="mt-3 text-center text-[11px] leading-5 text-ink-muted">Curated guidance. Confirm price and availability with the seller.</p>
        </footer>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
}
