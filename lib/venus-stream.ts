export interface VenusProduct {
  name: string
  slug: string
  price: number | null
  image_urls: string[] | null
  description: string | null
  item_type: string
  similarity: number
}

export type VenusEvent =
  | { type: 'text'; text: string }
  | { type: 'products'; products: VenusProduct[] }
  | { type: 'done' }
  | { type: 'error'; message: string }

function parseEvent(line: string): VenusEvent {
  let event: VenusEvent
  try { event = JSON.parse(line) } catch { throw new Error('Invalid assistant response.') }
  if (!event || typeof event !== 'object') throw new Error('Invalid assistant response.')
  if (event.type === 'text' && typeof event.text === 'string') return event
  if (event.type === 'done') return event
  if (event.type === 'error' && typeof event.message === 'string') return event
  if (event.type === 'products' && Array.isArray(event.products) && event.products.every(product =>
    product && typeof product.name === 'string' && typeof product.slug === 'string' &&
    (product.price === null || (typeof product.price === 'number' && Number.isFinite(product.price))) &&
    (product.image_urls === null || (Array.isArray(product.image_urls) && product.image_urls.every(url => typeof url === 'string')))
  )) return event
  throw new Error('Invalid assistant response.')
}

/** Buffer complete NDJSON events; network chunks are not message boundaries. */
export async function readVenusStream(body: ReadableStream<Uint8Array>, onEvent: (event: VenusEvent) => void) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let completed = false
  let ended = false
  function deliver(line: string) {
    if (!line.trim()) return
    if (completed) throw new Error('Invalid assistant response after completion.')
    const event = parseEvent(line)
    if (event.type === 'error') throw new Error(event.message)
    if (event.type === 'done') completed = true
    onEvent(event)
  }
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) { ended = true; buffer += decoder.decode(); break }
      buffer += decoder.decode(value, { stream: true })
      if (buffer.length > 1_000_000) throw new Error('Assistant response is too large.')
      let newline: number
      while ((newline = buffer.indexOf('\n')) !== -1) {
        deliver(buffer.slice(0, newline))
        buffer = buffer.slice(newline + 1)
      }
    }
    deliver(buffer)
    if (!completed) throw new Error('Response ended early. Please try again.')
  } finally {
    if (!ended) await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}
