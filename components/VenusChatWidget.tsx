'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowUpRight, Maximize, Minimize, Sparkles, Trash2, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { readVenusStream, type VenusProduct } from '@/lib/venus-stream'
import { formatPrice } from '@/lib/pricing'
import { useVenus } from './VenusProvider'
import CatalogImage from './CatalogImage'

interface Message { role: 'assistant' | 'user'; content: string; products?: VenusProduct[] }
const STORAGE_KEY = 'vesna_chat_messages'
const WELCOME_MESSAGES: Message[] = [{ role: 'assistant', content: "I'm Venus. Ask me about a pick, compare options, or describe what you're looking for." }]

function loadMessages(): Message[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(saved) ? saved.filter(message => message && ['user', 'assistant'].includes(message.role) && typeof message.content === 'string').slice(-50) : []
  } catch { return [] }
}
function saveMessages(messages: Message[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50))) } catch {}
}

export default function VenusChatWidget() {
  const { isOpen, setIsOpen, draft: inputValue, setDraft: setInputValue, productSlug, openChat } = useVenus()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(WELCOME_MESSAGES)
  const [isTyping, setIsTyping] = useState(false)
  const [streamText, setStreamText] = useState('')
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
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isTyping, streamText])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = inputValue.trim()
    if (!text || isTyping || requestRef.current) return
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
      if (!controller.signal.aborted) setMessages(previous => [...previous, {
        role: 'assistant', content: failure instanceof Error ? failure.message : 'Venus is temporarily unavailable. Please try again.',
      }])
    } finally {
      if (streamFlushRef.current) clearInterval(streamFlushRef.current)
      streamFlushRef.current = null
      requestRef.current = null
      setStreamText('')
      setIsTyping(false)
    }
  }

  return <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
    <Dialog.Trigger asChild>
      <button onClick={() => openChat()} aria-label="Open chat assistant"
        className="fixed right-4 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-40 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-surface-container border border-secondary/60 text-secondary shadow-xl hover:border-primary hover:text-primary focus-ring">
        <Sparkles aria-hidden="true" size={18} /><span className="font-button-label text-xs">Ask Venus</span>
      </button>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50" />
      <Dialog.Content className={`fixed right-0 top-0 bottom-0 z-[70] flex flex-col bg-stone-950 border-l border-secondary/30 shadow-2xl w-full ${isFullscreen ? '' : 'sm:w-[450px] lg:w-[560px]'} focus:outline-none`}>
        <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-secondary/20">
          <div><Dialog.Title className="font-spectral text-xl flex gap-2 items-center"><Sparkles aria-hidden="true" size={18} />Venus</Dialog.Title>
            <Dialog.Description className="text-xs text-on-surface-variant mt-1">Discovery help, grounded in the catalog.</Dialog.Description></div>
          <div className="flex gap-1">
            <button disabled={isTyping} aria-label="Clear chat history" title="Clear chat history" onClick={() => { setMessages(WELCOME_MESSAGES); saveMessages([]) }} className="p-2 hover:text-primary focus-ring disabled:opacity-40"><Trash2 aria-hidden="true" size={18} /></button>
            <button aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} onClick={() => setIsFullscreen(full => !full)} className="hidden sm:block p-2 hover:text-primary focus-ring">{isFullscreen ? <Minimize aria-hidden="true" size={18} /> : <Maximize aria-hidden="true" size={18} />}</button>
            <Dialog.Close aria-label="Close chat" className="p-2 hover:text-primary focus-ring"><X aria-hidden="true" size={20} /></Dialog.Close>
          </div>
        </header>
        <ChatMessages messages={messages} isTyping={isTyping} streamText={streamText} messagesEndRef={messagesEndRef} />
        <div className="px-5 pb-3 flex flex-wrap gap-2">
          {['Help me choose a pick', 'What should I check before buying?'].map(question => <button key={question} disabled={isTyping} onClick={() => setInputValue(question)} className="text-xs border border-outline-variant rounded-full px-3 py-2 text-on-surface-variant hover:border-primary focus-ring disabled:opacity-50">{question}</button>)}
        </div>
        <div className="border-t border-secondary/20 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <form onSubmit={handleSubmit} className="flex gap-3 items-center">
            <label className="sr-only" htmlFor="venus-message">Message Venus</label>
            <input id="venus-message" value={inputValue} onChange={event => setInputValue(event.target.value)} placeholder="Ask about a pick or what you need…" disabled={isTyping} maxLength={2000}
              className="flex-1 min-w-0 bg-transparent border border-outline-variant rounded px-3 py-3 text-sm placeholder:text-outline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" />
            <button type="submit" aria-label="Send message" disabled={isTyping || !inputValue.trim()} className="p-3 bg-primary text-on-primary rounded focus-ring disabled:opacity-40"><ArrowUpRight aria-hidden="true" size={20} /></button>
          </form>
          <p className="text-xs text-outline mt-3">Confirm prices and product claims with the seller.</p>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
}

function ChatMessages({ messages, isTyping, streamText, messagesEndRef }: {
  messages: Message[]; isTyping: boolean; streamText: string; messagesEndRef: React.RefObject<HTMLDivElement | null>
}) {
  return <div role="log" aria-label="Conversation with Venus" aria-live="polite" className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-5">
    {messages.map((message, index) => <div key={index} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
      <p className="text-xs text-secondary mb-2">{message.role === 'user' ? 'You' : 'Venus'}</p>
      <div className="max-w-[95%] rounded border border-secondary/20 p-4 text-sm leading-relaxed text-on-surface-variant [&_a]:text-primary [&_a]:underline [&_p]:mb-2">
        {message.role === 'user' ? <p className="whitespace-pre-wrap">{message.content}</p> : <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>}
      </div>
      {Array.isArray(message.products) && message.products.length > 0 && <div className="grid grid-cols-2 gap-3 mt-3 w-full">
        {message.products.slice(0, 4).map(product => <Link key={product.slug} href={`/shop/${product.slug}`} className="block border border-outline-variant rounded overflow-hidden hover:border-primary focus-ring">
          <div className="relative aspect-[4/3]"><CatalogImage src={product.image_urls?.[0]} alt={product.name} sizes="250px" /></div>
          <div className="p-3"><p className="text-sm">{product.name}</p>{product.price != null && <p className="text-primary text-sm mt-1">{formatPrice(product.price)}</p>}</div>
        </Link>)}
      </div>}
    </div>)}
    {isTyping && <div role="status" className="text-sm text-on-surface-variant leading-relaxed border border-secondary/20 p-4 rounded">
      {streamText ? <ReactMarkdown>{streamText}</ReactMarkdown> : 'Venus is thinking…'}
    </div>}
    <div ref={messagesEndRef} />
  </div>
}
