import { test, after } from 'node:test'
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createRequire } from 'node:module'
import ts from 'typescript'
const directory = mkdtempSync(join(tmpdir(), 'vesna-stream-'))
for (const name of ['pricing','catalog-collections','venus-actions', 'venus-stream']) writeFileSync(join(directory, `${name}.js`), ts.transpileModule(readFileSync(new URL(`../../lib/${name}.ts`, import.meta.url), 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2021}}).outputText)
const { readVenusStream } = createRequire(import.meta.url)(join(directory, 'venus-stream.js'))
after(() => rmSync(directory, {recursive:true,force:true}))
import assert from 'node:assert/strict'

const product = { name: 'Desk lamp', slug: 'desk-lamp', price: 50, image_urls: [], description: 'A lamp', item_type: 'curated', similarity: 0 }
function bodyFrom(chunks) {
  return new ReadableStream({ start(controller) { for (const chunk of chunks) controller.enqueue(chunk); controller.close() } })
}
const encoded = events => new TextEncoder().encode(events.map(event => JSON.stringify(event)).join('\n') + '\n')

test('text and product events survive every byte boundary, including UTF-8 characters', async () => {
  const expected = [{ type: 'text', text: 'Café ✨\nA useful pick.' }, { type: 'products', products: [product] }, { type: 'done' }]
  const bytes = encoded(expected)
  for (let boundary = 1; boundary < bytes.length; boundary++) {
    const received = []
    await readVenusStream(bodyFrom([bytes.slice(0, boundary), bytes.slice(boundary)]), event => received.push(event))
    assert.deepEqual(received, expected, `split at byte ${boundary}`)
  }
})

test('server errors and incomplete responses cannot masquerade as successful answers', async () => {
  await assert.rejects(readVenusStream(bodyFrom([encoded([{ type: 'error', message: 'Please try again.' }])]), () => {}), /Please try again/)
  await assert.rejects(readVenusStream(bodyFrom([encoded([{ type: 'text', text: 'Partial' }])]), () => {}), /ended early/)
})

test('malformed or invalid events are rejected without exposing their payload as prose', async () => {
  await assert.rejects(readVenusStream(bodyFrom([encoded([{ type: 'text', text: 5 }])]), () => {}), /Invalid/)
  await assert.rejects(readVenusStream(bodyFrom([new TextEncoder().encode('{broken}\n')]), () => {}), /Invalid/)
})


test('untrusted action paths and identifiers are rejected', async () => {
  await assert.rejects(readVenusStream(bodyFrom([encoded([{type:'action',action:{kind:'navigate',path:'https://evil.example'}}])]),()=>{}),/Invalid/)
  await assert.rejects(readVenusStream(bodyFrom([encoded([{type:'action',action:{kind:'save',id:'fake',name:'Fake',slug:'fake'}}])]),()=>{}),/Invalid/)
  const events=[{type:'action',action:{kind:'navigate',path:'/shortlist'}},{type:'done'}]
  const received=[]
  await readVenusStream(bodyFrom([encoded(events)]),event=>received.push(event))
  assert.deepEqual(received,events)
})
