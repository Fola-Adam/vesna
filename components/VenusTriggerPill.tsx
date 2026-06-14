'use client'

import { useState, useEffect, useRef } from 'react'

interface VenusTriggerPillProps {
  productName: string
}

export default function VenusTriggerPill({ productName }: VenusTriggerPillProps) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleMouseEnter = () => {
    if (dismissed) return
    timerRef.current = setTimeout(() => {
      setVisible(true)
    }, 5000)
  }

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!dismissed) setVisible(false)
  }

  const handleClick = () => {
    setDismissed(true)
    setVisible(false)
    const widget = document.querySelector('[aria-label="Open chat assistant"]') as HTMLButtonElement
    if (widget) {
      widget.click()
      setTimeout(() => {
        const input = document.querySelector('input[placeholder*="Describe a mood"]') as HTMLInputElement
        if (input) {
          input.value = `Tell me about ${productName}`
          input.dispatchEvent(new Event('input', { bubbles: true }))
        }
      }, 500)
    }
  }

  if (dismissed) return null

  return (
    <div
      className={`absolute bottom-4 right-4 z-20 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-4 py-2 bg-secondary/90 hover:bg-secondary text-stone-950 rounded-full shadow-lg text-[9px] font-button-label uppercase tracking-widest transition-all cursor-pointer"
      >
        <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
        Ask Venus
      </button>
    </div>
  )
}
