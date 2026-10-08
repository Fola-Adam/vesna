import { test } from 'node:test'
import assert from 'node:assert/strict'

const product = { name: 'Desk lamp', slug: 'desk-lamp', price: 50, image_urls: [], description: 'A lamp', item_type: 'curated', similarity: 0 }
function bodyFrom(chunks) {
  return new ReadableStream({ start(controller) { for (const chunk of chunks) controller.enqueue(chunk); controller.close() } })
}
const encoded = events => new TextEncoder().encode(events.map(event => JSON.stringify(event)).join('\n') + '\n')

test('text and product events survive every byte boundary, including UTF-8 characters', async () => {
  const { readVenusStream } = await import('../../lib/venus-stream.ts')
  const expected = [{ type: 'text', text: 'Café ✨\nA useful pick.' }, { type: 'products', products: [product] }, { type: 'done' }]
  const bytes = encoded(expected)
  for (let boundary = 1; boundary < bytes.length; boundary++) {
    const received = []
    await readVenusStream(bodyFrom([bytes.slice(0, boundary), bytes.slice(boundary)]), event => received.push(event))
    assert.deepEqual(received, expected, `split at byte ${boundary}`)
  }
})

test('server errors and incomplete responses cannot masquerade as successful answers', async () => {
  const { readVenusStream } = await import('../../lib/venus-stream.ts')
  await assert.rejects(readVenusStream(bodyFrom([encoded([{ type: 'error', message: 'Please try again.' }])]), () => {}), /Please try again/)
  await assert.rejects(readVenusStream(bodyFrom([encoded([{ type: 'text', text: 'Partial' }])]), () => {}), /ended early/)
})

test('malformed or invalid events are rejected without exposing their payload as prose', async () => {
  const { readVenusStream } = await import('../../lib/venus-stream.ts')
  await assert.rejects(readVenusStream(bodyFrom([encoded([{ type: 'text', text: 5 }])]), () => {}), /Invalid/)
  await assert.rejects(readVenusStream(bodyFrom([new TextEncoder().encode('{broken}\n')]), () => {}), /Invalid/)
})
