import { createClient } from '@/lib/supabase/server'

const MAX_PRODUCTS = 8

interface RawProduct {
  name: string
  slug: string
  price: number | null
  image_urls: string[] | null
  description: string | null
  item_type: string
  similarity?: number
  categories?: { name: string }[] | null
}

interface MatchedProduct {
  name: string
  slug: string
  price: number | null
  image_urls: string[] | null
  description: string | null
  item_type: string
  similarity: number
}

export const runtime = 'nodejs'

const MAX_MESSAGE_LENGTH = 2000
const MAX_HISTORY_MESSAGES = 10

// Per-IP limiter for the Groq proxy. Without this, anyone can hammer
// /api/venus and burn your (paid or free-tier) Groq quota. In-memory map is
// per-instance — good enough at this scale; swap for Upstash Ratelimit when
// traffic justifies it.
const VENUS_WINDOW_MS = 60_000
const VENUS_MAX_PER_WINDOW = 8
const venusHits = new Map<string, number[]>()

function venusRateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (venusHits.get(ip) ?? []).filter((t) => now - t < VENUS_WINDOW_MS)
  if (recent.length >= VENUS_MAX_PER_WINDOW) return true
  recent.push(now)
  venusHits.set(ip, recent)
  if (venusHits.size > 10_000) {
    for (const [k, v] of venusHits) {
      if (!v.some((t) => now - t < VENUS_WINDOW_MS)) venusHits.delete(k)
    }
  }
  return false
}

// Only allow the roles our client actually sends — anything else is a
// prompt-injection / API-abuse vector (e.g. spoofed "system" messages).
const ALLOWED_ROLES = new Set(['user', 'assistant'])

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0'
  if (venusRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: 'Too many requests — please slow down.' }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' } },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { message, history = [] } = (body ?? {}) as {
    message?: unknown
    history?: unknown
  }

  if (typeof message !== 'string' || !message.trim()) {
    return new Response(JSON.stringify({ error: 'Message is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return new Response(JSON.stringify({ error: 'Message too long' }), {
      status: 413,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Sanitize client-supplied history: drop unknown roles, non-strings, and
  // cap length so callers can't inflate token costs unboundedly.
  const safeHistory = Array.isArray(history)
    ? history
        .filter(
          (h): h is { role: string; content: string } =>
            !!h &&
            typeof h === 'object' &&
            ALLOWED_ROLES.has((h as { role?: unknown }).role as string) &&
            typeof (h as { content?: unknown }).content === 'string'
        )
        .slice(-MAX_HISTORY_MESSAGES)
        .map((h) => ({ role: h.role, content: h.content.slice(0, MAX_MESSAGE_LENGTH) }))
    : []

  if (!process.env.GROQ_API_KEY) {
    return new Response(JSON.stringify({ error: 'AI service is not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // ---- PHASE 1: Retrieve relevant products ----
  let matchedProducts: MatchedProduct[] = []

  try {
    const supabase = await createClient()
    let products: RawProduct[] | null = null

    try {
      const { getEmbedding } = await import('@/lib/embeddings')
      const queryEmbedding = await getEmbedding(message)
      const vectorStr = `[${queryEmbedding.join(',')}]`

      const { data } = await supabase.rpc('match_products', {
        query_embedding: vectorStr,
        match_threshold: 0.4,
        match_count: MAX_PRODUCTS,
      })

      if (data && data.length > 0) products = data
    } catch {}

    if (!products || products.length === 0) {
      const searchTerms = message
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((w: string) => w.length > 2)
        .slice(0, 6)

      if (searchTerms.length > 0) {
        const filters = searchTerms.flatMap((term: string) => [
          `name.ilike.%${term}%`,
          `description.ilike.%${term}%`,
          `why_victory.ilike.%${term}%`,
        ])

        const { data: keywordResults } = await supabase
          .from('products')
          .select('name, slug, price, description, why_victory, item_type, image_urls, categories(name)')
          .eq('is_active', true)
          .or(filters.join(','))
          .order('is_featured', { ascending: false })
          .limit(MAX_PRODUCTS)

        products = keywordResults
      }
    }

    if (products && products.length > 0) {
      matchedProducts = products.map((p: RawProduct) => ({
        name: p.name,
        slug: p.slug,
        price: p.price,
        image_urls: p.image_urls,
        description: p.description,
        item_type: p.item_type,
        similarity: p.similarity ?? 0,
      }))
    }
  } catch {}

  // ---- PHASE 2: Stream from Groq ----
  const { Groq } = await import('groq-sdk')
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

  const productAppendix = matchedProducts.length > 0
    ? '\n\nRelevant products in the catalog right now:\n' +
      matchedProducts.map(p => `- ${p.name} ($${p.price}) — ${p.description?.slice(0, 120)}`).join('\n')
    : ''

  const systemPrompt = `You are Venus, the assistant for Vesna — a curated lifestyle platform by Ebenezer Victory.

Your personality:
- Warm, knowledgeable, and slightly poetic
- You appreciate craftsmanship, design, and thoughtful curation
- You speak with the voice of someone who understands quality

About Vesna:
- Vesna curates exceptional products across tech, audio, lifestyle, workspace, and travel
- Each item is personally vetted by Ebenezer Victory
- The platform emphasizes objects with purpose and stories worth telling
- Current sections: Curated (Victory picks), Shop (full catalog), Archive (rare finds)

Guidelines:
- Keep responses concise (2-3 sentences for simple questions)
- When relevant products are listed below, use them to answer accurately — reference products by name and price
- If you don't have matching products, say so and offer general guidance
- Don't make up product details not shown in the provided list
- If asked about purchasing, explain that Vesna uses affiliate links
- For "Why Vesna?" questions, emphasize personal curation and quality over algorithms

Current date: ${new Date().toISOString().split('T')[0]}${productAppendix}`

  // Typed as the SDK's param union — plain `{role: string}` literals don't
  // satisfy ChatCompletionMessageParam[] in groq-sdk v1.
  const messages: import('groq-sdk/resources/chat/completions').ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...safeHistory.map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
    { role: 'user', content: message },
  ]

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const completion = await groq.chat.completions.create({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          max_tokens: 1024,
          messages,
          stream: true,
        })

        for await (const chunk of completion) {
          const text = chunk.choices?.[0]?.delta?.content
          if (text) {
            controller.enqueue(encoder.encode(text))
          }
        }

        // Send the matched products as a final JSON delimiter
        controller.enqueue(encoder.encode('__VENUS_PRODUCTS__' + JSON.stringify(matchedProducts)))
        controller.close()
      } catch (error) {
        console.error('Venus streaming error:', error)
        controller.enqueue(encoder.encode('__VENUS_ERROR__Failed to generate response'))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}
