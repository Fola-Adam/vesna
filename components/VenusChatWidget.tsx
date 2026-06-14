'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import styles from './VenusChatWidget.module.css'

interface MatchedProduct {
  name: string
  slug: string
  price: number | null
  image_urls: string[] | null
  description: string | null
  item_type: string
  similarity: number
}

interface Message {
  role: 'assistant' | 'user'
  content: string
  products?: MatchedProduct[]
}

const STORAGE_KEY = 'vesna_chat_messages'

function loadMessages(): Message[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveMessages(messages: Message[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  } catch {}
}

export default function VenusChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [initialized, setInitialized] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const streamContentRef = useRef('')
  const streamProductsRef = useRef<MatchedProduct[] | null>(null)
  const streamFlushRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const saved = loadMessages()
    if (saved.length > 0) {
      setMessages(saved)
    } else {
      setMessages([
        {
          role: 'assistant',
          content:
            "Welcome to Vesna. I'm Venus. How can I help you discover exceptional objects today?",
        },
      ])
    }
    setInitialized(true)
  }, [])

  useEffect(() => {
    if (initialized) {
      saveMessages(messages)
    }
  }, [messages, initialized])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, streamText])

  const toggleChat = () => {
    setIsOpen((o) => {
      if (!o && window.innerWidth < 768) setIsFullscreen(true)
      return !o
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = inputValue.trim()
    if (!text || isTyping) return

    setInputValue('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setIsTyping(true)
    setStreamText('')
    streamContentRef.current = ''
    streamProductsRef.current = null

    try {
      const res = await fetch('/api/venus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages
            .filter((m) => m.role !== 'assistant' || messages.indexOf(m) !== 0)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) throw new Error('Request failed')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      streamFlushRef.current = setInterval(() => {
        if (streamContentRef.current) {
          setStreamText(streamContentRef.current)
        }
      }, 80)

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })

        if (chunk.includes('__VENUS_PRODUCTS__')) {
          const [textPart, productsJson] = chunk.split('__VENUS_PRODUCTS__')
          if (textPart) streamContentRef.current += textPart
          try {
            streamProductsRef.current = JSON.parse(productsJson)
          } catch {}
        } else if (chunk.includes('__VENUS_ERROR__')) {
          if (streamFlushRef.current) clearInterval(streamFlushRef.current)
          const [, errorMsg] = chunk.split('__VENUS_ERROR__')
          streamContentRef.current = ''
          setStreamText('')
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: errorMsg || 'I apologize, but I am having trouble connecting right now.',
            },
          ])
          setIsTyping(false)
          return
        } else {
          streamContentRef.current += chunk
        }
      }

      if (streamFlushRef.current) clearInterval(streamFlushRef.current)
      setStreamText('')

      const finalContent = streamContentRef.current
      if (finalContent) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: finalContent,
            products: streamProductsRef.current || undefined,
          },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, but I am having trouble connecting right now. Please try again shortly.',
        },
      ])
    } finally {
      if (streamFlushRef.current) {
        clearInterval(streamFlushRef.current)
        streamFlushRef.current = null
      }
      setIsTyping(false)
    }
  }

  return (
    <>
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-stone-950/98 backdrop-blur-2xl flex flex-col">
          <div className="border-b-[0.5px] border-secondary/10 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-sm">auto_awesome</span>
              <h3 className="font-button-label text-[9px] text-secondary uppercase tracking-[0.15em]">Venus</h3>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsFullscreen(false)} className="text-stone-600 hover:text-secondary transition-colors p-1" aria-label="Exit fullscreen">
                <span className="material-symbols-outlined text-base">fullscreen_exit</span>
              </button>
              <button onClick={toggleChat} className="text-stone-600 hover:text-secondary transition-colors p-1" aria-label="Close chat">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          </div>
          <ChatMessages messages={messages} isTyping={isTyping} streamText={streamText} messagesEndRef={messagesEndRef} isFullscreen={true} />
          <ChatInput inputValue={inputValue} setInputValue={setInputValue} isTyping={isTyping} handleSubmit={handleSubmit} />
        </div>
      )}

      {/* Side panel */}
      <div className={`fixed top-0 right-0 h-full z-50 pointer-events-none ${isFullscreen ? 'hidden' : ''}`}>
        <button
          onClick={toggleChat}
          aria-label="Open chat assistant"
          className={`pointer-events-auto absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 pl-4 pr-3 py-3 bg-secondary/10 hover:bg-secondary/20 cursor-pointer rounded-l-full transition-all border border-secondary/20 border-r-0 ${
            isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <span className="material-symbols-outlined text-secondary text-sm">auto_awesome</span>
          <span className="font-button-label text-[9px] text-secondary tracking-[0.15em] uppercase whitespace-nowrap">Ask Venus</span>
        </button>

        <div
          className={`pointer-events-auto absolute top-0 right-0 h-full bg-stone-950/98 backdrop-blur-2xl border-l-[0.5px] border-secondary/20 shadow-2xl transition-all duration-300 ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          } ${
            isFullscreen
              ? 'w-full'
              : 'w-[400px] sm:w-[450px] md:w-[500px] lg:w-[600px]'
          }`}
        >
          <div className="bg-stone-950/50 border-b-[0.5px] border-secondary/10 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-sm">auto_awesome</span>
              <h3 className="font-button-label text-[9px] text-secondary uppercase tracking-[0.15em]">Venus</h3>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsFullscreen((f) => !f)} className="text-stone-600 hover:text-secondary transition-colors p-1" aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                <span className="material-symbols-outlined text-base">{isFullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>
              </button>
              <button onClick={toggleChat} className="text-stone-600 hover:text-secondary transition-colors p-1" aria-label="Close chat">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          </div>

          <ChatMessages messages={messages} isTyping={isTyping} streamText={streamText} messagesEndRef={messagesEndRef} isFullscreen={false} />

          <ChatInput inputValue={inputValue} setInputValue={setInputValue} isTyping={isTyping} handleSubmit={handleSubmit} />
        </div>
      </div>
    </>
  )
}

function ChatMessages({ messages, isTyping, streamText, messagesEndRef, isFullscreen }: {
  messages: Message[]
  isTyping: boolean
  streamText: string
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  isFullscreen: boolean
}) {
  const [dotPhase, setDotPhase] = useState(0)

  useEffect(() => {
    if (!isTyping) { setDotPhase(0); return }
    const t = setInterval(() => setDotPhase(p => (p + 1) % 4), 250)
    return () => clearInterval(t)
  }, [isTyping])

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-3 space-y-4"
      style={{ height: isFullscreen ? 'calc(100vh - 100px)' : 'calc(100% - 100px)' }}
    >
      {messages.map((msg, i) => (
        <div key={i} className={`flex flex-col gap-1 max-w-full ${styles.animateFadeIn} ${msg.role === 'user' ? 'items-end' : ''}`}>
          {msg.role === 'assistant' && (
            <div className="flex items-center gap-1.5">
              <span className="w-0.5 h-0.5 bg-secondary rounded-full" />
              <span className="font-button-label text-[7px] text-secondary tracking-widest uppercase">Venus</span>
            </div>
          )}
          <div className={`${styles.glassPanel} border-[0.5px] border-secondary/10 px-3 py-2 rounded-sm ${msg.role === 'user' ? 'bg-secondary/5' : ''} max-w-[90%]`}>
            {msg.role === 'user' ? (
              <p className="font-body-main text-xs leading-relaxed text-on-surface-variant font-light">{msg.content}</p>
            ) : (
              <div className="font-spectral text-[13px] italic leading-relaxed text-on-surface prose prose-invert prose-a:text-secondary prose-strong:text-secondary prose-em:text-secondary/80 max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
          {msg.products && msg.products.length > 0 && (
            <div className="grid grid-cols-2 gap-1.5 mt-1">
              {msg.products.slice(0, 4).map((product) => (
                <Link
                  key={product.slug}
                  href={`/shop/${product.slug}`}
                  className="group block rounded-sm overflow-hidden border-[0.5px] border-secondary/10 hover:border-secondary/30 transition-colors bg-stone-900/50"
                >
                  {product.image_urls?.[0] && (
                    <div className="relative w-full aspect-[4/3] overflow-hidden">
                      <Image
                        src={product.image_urls[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, 150px"
                      />
                    </div>
                  )}
                  <div className="p-1.5">
                    <p className="font-button-label text-[8px] text-on-surface-variant uppercase tracking-[0.1em] truncate">{product.name}</p>
                    {product.price && <p className="font-audiowide text-[10px] text-primary mt-0.5">${product.price}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}

      {isTyping && (
        <div className={`flex flex-col gap-1 max-w-full ${styles.animateFadeIn}`}>
          <div className="flex items-center gap-1.5">
            <span className="w-0.5 h-0.5 bg-secondary rounded-full" />
            <span className="font-button-label text-[7px] text-secondary tracking-widest uppercase">Venus</span>
          </div>
          <div className="border border-secondary/30 px-4 py-3 rounded-sm bg-stone-900">
            {streamText ? (
              <div className="font-spectral text-[13px] italic leading-relaxed text-on-surface/70">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {streamText}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: '#e6c364',
                      transform: dotPhase === i ? 'translateY(-8px)' : 'translateY(0)',
                      transition: 'transform 0.15s ease',
                    }}
                  />
                ))}
                <span className="font-button-label text-[9px] text-[#e6c364] uppercase tracking-[0.15em] ml-1">
                  Thinking
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      <div ref={messagesEndRef as React.RefObject<HTMLDivElement>} />
    </div>
  )
}

function ChatInput({ inputValue, setInputValue, isTyping, handleSubmit }: {
  inputValue: string
  setInputValue: (v: string) => void
  isTyping: boolean
  handleSubmit: (e: React.FormEvent) => void
}) {
  return (
    <div className="border-t-[0.5px] border-secondary/10 px-4 py-3 bg-stone-950/98">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Describe a mood or a silhouette..."
          disabled={isTyping}
          className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface font-body-main placeholder:text-stone-600 text-xs font-light outline-none"
        />
        <button
          type="submit"
          disabled={isTyping || !inputValue.trim()}
          className="flex items-center gap-1.5 text-secondary group disabled:opacity-30"
        >
          <span className="font-button-label text-[8px] uppercase tracking-[0.15em] group-hover:text-secondary/80 transition-colors">Ask</span>
          <div className="w-6 h-6 rounded-full border-[0.5px] border-secondary/30 flex items-center justify-center group-hover:border-secondary group-hover:bg-secondary group-hover:text-stone-950 transition-all duration-300">
            <span className="material-symbols-outlined text-[12px]">north_east</span>
          </div>
        </button>
      </form>
    </div>
  )
}
