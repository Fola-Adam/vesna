'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useShortlist } from '@/lib/shortlist'
import type { VenusAction } from '@/lib/venus-actions'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowDown, ArrowUp, ArrowUpRight, Maximize, Minimize, RotateCcw, Square, Plus, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { readVenusStream, type VenusProduct, type VenusReading } from '@/lib/venus-stream'
import { useVenus } from './VenusProvider'
import VenusMark from './VenusMark'
import VenusRecommendations from './VenusRecommendations'
import styles from './VenusChatWidget.module.css'

interface Message { role: 'assistant' | 'user'; content: string; products?: VenusProduct[]; readings?: VenusReading[]; error?: boolean; pendingClear?: boolean }
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

function resizeComposer(element: HTMLTextAreaElement | null) {
  if (!element) return
  element.style.height = 'auto'
  element.style.height = Math.min(element.scrollHeight, 144) + 'px'
}

export default function VenusChatWidget() {
  const { isOpen, setIsOpen, draft: inputValue, setDraft: setInputValue, productSlug, openChat, clearProductContext } = useVenus()
  const router = useRouter()
  const { ids: shortlistIds, add, remove, clear, undo, canUndo } = useShortlist()
  const streamActionRef = useRef<VenusAction | null>(null)
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
  const streamReadingsRef = useRef<VenusReading[]>([])
  const streamFlushRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const requestRef = useRef<AbortController | null>(null)
  const messagesInitialized = useRef(false)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const attachComposer = useCallback((element: HTMLTextAreaElement | null) => {
    composerRef.current = element
    resizeComposer(element)
  }, [])

  useEffect(() => {
    resizeComposer(composerRef.current)
  }, [inputValue, isFullscreen])

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
    streamReadingsRef.current = []
    streamActionRef.current = null
    try {
      const response = await fetch('/api/venus', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ message: text, productSlug, shortlistIds, history: messages.filter(message => !message.error).slice(-10).map(message => ({ role: message.role, content: message.content })) }),
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
        if (event.type === 'readings') streamReadingsRef.current = event.readings
        if (event.type === 'action') {
          if (streamActionRef.current) throw new Error('Venus returned conflicting actions. Please try again.')
          streamActionRef.current = event.action
        }
      })
      let content = streamContentRef.current
      let actionError = false
      const action = streamActionRef.current as VenusAction | null
      if (action?.kind === 'save' || action?.kind === 'remove') {
        const successful = action.kind === 'save' ? add(action.id) : remove(action.id)
        actionError = !successful
        content = successful ? (action.kind === 'save' ? `${action.name} is in your shortlist. [View your shortlist](/shortlist).` : `Removed ${action.name} from your shortlist. You can undo this below.`) : 'I could not update your shortlist. Check that browser storage is available, then try again.'
      }
      if (action?.kind === 'navigate') { router.push(action.path); setIsOpen(false) }

      if (content || streamProductsRef.current.length || streamReadingsRef.current.length) {
        setMessages(previous => [...previous, { role: 'assistant', content, products: streamProductsRef.current, readings: streamReadingsRef.current, error: actionError, pendingClear: action?.kind === 'clear' }])
      }
    } catch (failure) {
      if (controller.signal.aborted && streamContentRef.current) {
        setMessages(previous => [...previous, { role: 'assistant', content: streamContentRef.current + '\n\n_Response stopped._', products: streamProductsRef.current }])
      }
      if (!controller.signal.aborted) setMessages(previous => [...previous, {
        role: 'assistant', error: true, content: failure instanceof Error && failure.message !== 'Failed to fetch' ? failure.message : 'Venus could not connect. Please try again.',
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
  const markdownClass = "break-words text-[15px] leading-[1.85] [&_a]:font-medium [&_a]:text-primary-ink [&_a]:underline [&_a]:decoration-[#1b5a45]/30 [&_a]:underline-offset-4 [&_p]:mb-4 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_h2]:mb-3 [&_h2]:font-display-hero [&_h2]:text-2xl [&_h3]:mb-2 [&_h3]:font-semibold [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:text-xs [&_th]:border-b [&_th]:border-ink/20 [&_th]:p-3 [&_th]:text-left [&_td]:border-b [&_td]:border-ink/10 [&_td]:p-3"
  return <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
    <Dialog.Trigger asChild>
      <button onClick={() => openChat()} aria-label="Open chat assistant" className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-4 z-40 inline-flex min-h-14 items-center gap-3 rounded-full border border-[#1b5a45]/40 bg-[#10382d] py-2 pl-3 pr-5 text-paper shadow-xl transition-colors hover:bg-[#174938] focus-ring">
        <VenusMark className="h-9 w-11" /><span className="font-button-label text-sm">Ask Venus</span>
      </button>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className={`${styles.overlay} fixed inset-0 z-[60] bg-black/45 backdrop-blur-sm`} />
      <Dialog.Content className={`${styles.panel} ${isFullscreen ? styles.fullscreen : ''} fixed z-[70] flex flex-col bg-paper text-ink shadow-2xl focus:outline-none`}>
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-[#292720]/[.08] px-5 py-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3"><VenusMark className="h-8 w-10 shrink-0" /><div>
            <Dialog.Title className="font-display-hero text-[27px] font-semibold leading-none">Venus</Dialog.Title>
            <Dialog.Description className="mt-1.5 text-[10px] font-medium uppercase tracking-[.13em] text-ink-muted">The Vesna concierge</Dialog.Description>
          </div></div>
          <div className="flex shrink-0 gap-1">
            <button disabled={isTyping} aria-label="Start a new conversation" title="Start a new conversation" onClick={() => { setMessages(WELCOME_MESSAGES); saveMessages([]); clearProductContext() }} className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-[#292720]/5 hover:text-ink focus-ring disabled:opacity-40"><Plus aria-hidden="true" size={18} strokeWidth={1.5} /></button>
            <button aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} onClick={() => setIsFullscreen(full => !full)} className="hidden h-11 w-11 items-center justify-center rounded-full text-ink-muted hover:bg-[#292720]/5 focus-ring sm:inline-flex">{isFullscreen ? <Minimize aria-hidden="true" size={16} strokeWidth={1.5} /> : <Maximize aria-hidden="true" size={16} strokeWidth={1.5} />}</button>
            <Dialog.Close aria-label="Close chat" className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-muted hover:bg-[#292720]/5 focus-ring"><X aria-hidden="true" size={19} strokeWidth={1.5} /></Dialog.Close>
          </div>
        </header>
        {productSlug && <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#292720]/[.08] bg-[#edf0e7] px-6 py-2 text-xs"><span className="min-w-0 truncate text-primary-ink">In focus: {productSlug.replaceAll('-', ' ')}</span><button onClick={clearProductContext} aria-label="Search the whole collection instead" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-[#292720]/5 focus-ring"><X size={15} aria-hidden="true" /></button></div>}
        <div ref={viewportRef} onScroll={event => { const area = event.currentTarget; pinnedRef.current = area.scrollHeight - area.scrollTop - area.clientHeight < 100; setShowLatest(!pinnedRef.current) }} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-8 sm:px-7">
          <div className="mx-auto w-full max-w-[680px]">
            {!hasConversation && <div className={`${styles.welcome} py-5 sm:py-8`}>
              <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-primary-ink">Objects. Stories. A little guidance.</p>
              <h2 className="mt-5 max-w-md font-display-hero text-[42px] font-medium leading-[1.06] tracking-[-.02em] sm:text-[48px]">A more considered<br />kind of finding.</h2>
              <p className="mt-5 max-w-sm text-sm leading-7 text-ink-muted">Tell me what you have in mind. We can find a useful object, weigh two choices, or settle into a good story.</p>
              <div className="mt-9 border-t border-[#292720]/10">
                {[
                  { label: 'Find a thoughtful gift', detail: 'A little personal, within your budget', question: 'Find a considered gift under $100' },
                  { label: 'Consider my workspace', detail: 'Objects that earn their place', question: 'Help me refine my workspace' },
                  { label: 'Something worth reading', detail: 'A moment with the Vesna Journal', question: 'Recommend a Journal story about thoughtful design' },
                ].map(suggestion => <button key={suggestion.label} onClick={() => { setInputValue(suggestion.question); composerRef.current?.focus() }} className="group flex min-h-[76px] w-full items-center justify-between gap-4 border-b border-[#292720]/10 py-4 text-left transition-colors hover:text-primary-ink focus-ring">
                  <span><span className="block text-sm font-medium">{suggestion.label}</span><span className="mt-1 block text-xs text-ink-muted">{suggestion.detail}</span></span><ArrowUpRight aria-hidden="true" size={17} strokeWidth={1.5} className="shrink-0 text-primary-ink transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" />
                </button>)}
              </div>
            </div>}
            <div role="log" aria-label="Conversation with Venus" className="space-y-8">
              {(hasConversation ? messages : []).map((message, index) => <div key={index} className={`${styles.message} flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                {message.role === 'assistant' && <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.16em] text-primary-ink"><VenusMark className="h-4 w-5" />Venus</p>}
                <div className={`${markdownClass} ${message.role === 'user' ? 'max-w-[90%] rounded-2xl rounded-tr-md bg-[#e7ece5] px-5 py-3 text-ink' : message.error ? 'w-full border-l-2 border-[#1b5a45]/35 pl-4 text-ink-muted' : 'w-full text-ink'}`}>
                  {message.role === 'user' ? <p className="whitespace-pre-wrap !mb-0">{message.content}</p> : <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>}
                </div>
                {message.pendingClear && <div className="mt-3 flex flex-wrap gap-3"><button type="button" onClick={() => {
                  const successful = clear()
                  setMessages(current => current.map((entry, i) => i === index ? {...entry, pendingClear: !successful, content: successful ? 'Your shortlist is cleared. You can undo this below.' : 'I could not clear your shortlist. Check browser storage and try again.'} : entry))
                }} className="min-h-11 bg-primary-ink px-4 text-sm text-paper focus-ring">Confirm clear shortlist</button><button type="button" onClick={() => setMessages(current => current.map((entry, i) => i === index ? {...entry, pendingClear: false, content: 'Kept your shortlist.'} : entry))} className="min-h-11 border border-ink/25 px-4 text-sm focus-ring">Keep my picks</button></div>}
                {message.error && <button disabled={isTyping} onClick={() => { const question = messages.slice(0, index).reverse().find(entry => entry.role === 'user'); if (question) { setInputValue(question.content); composerRef.current?.focus() } }} className="mt-2 inline-flex min-h-11 items-center gap-2 text-xs font-medium text-primary-ink hover:underline focus-ring disabled:opacity-40"><RotateCcw size={14} aria-hidden="true" />Try again</button>}
                <VenusRecommendations products={message.products} readings={message.readings} onNavigate={() => setIsOpen(false)} />
              </div>)}
              {isTyping && <div className="flex flex-col items-start"><p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.16em] text-primary-ink"><VenusMark className="h-4 w-5" />Venus</p><div className={`w-full ${markdownClass}`}>{streamText ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamText}</ReactMarkdown> : <p role="status" className={`${styles.thinking} text-sm text-ink-muted`}>Considering your request<span aria-hidden="true">…</span></p>}</div></div>}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
        {showLatest && <button onClick={() => { pinnedRef.current = true; setShowLatest(false); messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }) }} className="mx-auto mb-2 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#292720]/10 bg-paper-raised px-4 text-xs text-ink shadow-sm focus-ring">Latest response <ArrowDown size={14} aria-hidden="true" /></button>}
        <footer className="shrink-0 bg-paper px-4 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-7 sm:pb-5">
          <div className="mx-auto max-w-[680px]">
            {canUndo && <button type="button" onClick={() => { const successful = undo(); setMessages(previous => [...previous, {role:'assistant', error:!successful, content:successful ? 'Restored the removed picks to your shortlist.' : 'I could not restore the picks. Check browser storage and try again.'}]) }} className="mb-3 inline-flex min-h-10 items-center gap-2 text-xs font-medium text-primary-ink underline focus-ring"><RotateCcw size={14} aria-hidden="true" />Undo shortlist removal</button>}
            <form onSubmit={handleSubmit} className="rounded-[22px] border border-[#292720]/15 bg-paper-raised p-3 shadow-[0_4px_20px_rgba(41,39,32,.04)] transition-[border-color,box-shadow] focus-within:border-[#1b5a45]/50 focus-within:shadow-[0_0_0_3px_rgba(16,56,45,.06)]">
              <label className="sr-only" htmlFor="venus-message">Message Venus</label>
              <textarea ref={attachComposer} id="venus-message" value={inputValue} onChange={event => setInputValue(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); if (!isTyping) event.currentTarget.form?.requestSubmit() } }} placeholder="A question, a thought, a possibility…" rows={1} maxLength={2000} className="block max-h-36 min-h-11 w-full resize-none overflow-y-auto bg-transparent px-2 py-2 text-base leading-6 text-ink placeholder:text-ink-muted focus:outline-none sm:text-[15px]" />
              <div className="mt-1 flex items-center justify-between gap-3 pl-2"><span className="text-[10px] font-medium tracking-wide text-ink-muted">Picks, Shortlist &amp; Journal</span>{isTyping ? <button type="button" onClick={() => requestRef.current?.abort()} aria-label="Stop response" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#10382d] text-paper focus-ring"><Square aria-hidden="true" size={14} /></button> : <button type="submit" aria-label="Send message" disabled={!inputValue.trim()} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#10382d] text-paper transition-colors hover:bg-[#174938] focus-ring disabled:bg-[#292720]/10 disabled:text-ink-muted"><ArrowUp aria-hidden="true" size={19} strokeWidth={1.5} /></button>}</div>
            </form>
            <p className="mt-3 text-center text-[10px] leading-4 text-ink-muted">Selected from Vesna. Check current prices and availability with the seller.</p>
          </div>
        </footer>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
}
