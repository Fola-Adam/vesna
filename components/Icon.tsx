import { ArrowRight, ArrowUp, ArrowUpRight, Award, BadgeCheck, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, ChevronsDown, Circle, Flame, History, House, Landmark, Laptop, Mail, Maximize, Menu, Minimize, Quote, Shirt, Sparkles, Star, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const symbols: Record<string, LucideIcon> = {
  arrow_forward: ArrowRight, arrow_right_alt: ArrowRight, arrow_upward: ArrowUp,
  north_east: ArrowUpRight, workspace_premium: Award, verified: BadgeCheck,
  check_circle: CheckCircle, expand_more: ChevronDown, chevron_left: ChevronLeft,
  chevron_right: ChevronRight, keyboard_double_arrow_down: ChevronsDown,
  local_fire_department: Flame, history: History, home: House, account_balance: Landmark,
  museum: Landmark, laptop: Laptop, mail: Mail, fullscreen: Maximize, menu: Menu,
  fullscreen_exit: Minimize, format_quote: Quote, checkroom: Shirt, auto_awesome: Sparkles,
  star: Star, close: X,
}

/** Inline SVGs render without a third-party icon stylesheet or font request. */
export default function Icon({ name, className = '' }: { name: string; className?: string }) {
  const Symbol = symbols[name] ?? Circle
  return <Symbol aria-hidden="true" focusable="false" width="1em" height="1em" className={`inline-block shrink-0 ${className}`} />
}
