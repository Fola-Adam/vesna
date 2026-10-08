import { test } from 'node:test'
import assert from 'node:assert/strict'

test('seller destinations reject executable URLs and embedded credentials', async () => {
  const { sellerDetails } = await import('../../lib/affiliate.ts')
  for (const url of [null, 'javascript:alert(1)', '//example.com', 'https://user:secret@example.com']) assert.equal(sellerDetails(url), null)
})

test('seller links identify the actual stored destination without losing affiliate parameters', async () => {
  const { sellerDetails } = await import('../../lib/affiliate.ts')
  assert.deepEqual(sellerDetails('https://www.example.com/item?ref=vesna'), { href: 'https://www.example.com/item?ref=vesna', name: 'example.com' })
})
