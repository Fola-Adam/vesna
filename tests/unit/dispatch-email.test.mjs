import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

// Next resolves this marker at build time; load the same server module in Node
// with only that environment-specific import removed. Network calls are mocked.
const source = (await readFile(new URL('../../lib/dispatch-email.ts', import.meta.url), 'utf8')).replace(/^import 'server-only'\r?\n/m, '')
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText
const { sendDispatchConfirmation } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

function sender(t, value) {
  const previous = process.env.BREVO_SENDER_ID
  if (value) process.env.BREVO_SENDER_ID = value
  else delete process.env.BREVO_SENDER_ID
  t.after(() => { if (previous === undefined) delete process.env.BREVO_SENDER_ID; else process.env.BREVO_SENDER_ID = previous })
}
test('only a confirmation message is sent; pending email is never added to marketing contacts', async t => {
  sender(t, '1')
  const requests = []
  t.mock.method(globalThis, 'fetch', async (url, options) => { requests.push({ url, body: JSON.parse(options.body) }); return new Response('{}', { status: 201 }) })
  await sendDispatchConfirmation('reader@example.invalid', 'https://preview.example.invalid/dispatch/confirm#token=synthetic', 'test-key')
  assert.equal(requests.length, 1)
  assert.equal(requests[0].url, 'https://api.brevo.com/v3/smtp/email')
  assert.deepEqual(requests[0].body.sender, { id: 1 })
  assert.ok(requests[0].body.htmlContent.includes('Confirm my email'))
  assert.ok(requests[0].body.textContent.includes('expires in 24 hours'))
})
test('provider rejection and network failure are reported as failures', async t => {
  sender(t, '1')
  const mock = t.mock.method(globalThis, 'fetch', async () => new Response('{}', { status: 401 }))
  await assert.rejects(sendDispatchConfirmation('reader@example.invalid', 'https://preview.example.invalid/dispatch/confirm', 'test-key'), /delivery unavailable/)
  mock.mock.mockImplementation(async () => { throw new Error('Timeout') })
  await assert.rejects(sendDispatchConfirmation('reader@example.invalid', 'https://preview.example.invalid/dispatch/confirm', 'test-key'), /Timeout/)
})
test('automatic sender selection requires exactly one active verified sender', async t => {
  sender(t)
  const requests = []
  const mock = t.mock.method(globalThis, 'fetch', async url => {
    requests.push(url)
    return new Response(JSON.stringify({ senders: [{ id: 1, active: true }, { id: 2, active: true }] }), { status: 200 })
  })
  await assert.rejects(sendDispatchConfirmation('reader@example.invalid', 'https://preview.example.invalid/dispatch/confirm', 'test-key'), /Choose a verified/)
  assert.deepEqual(requests, ['https://api.brevo.com/v3/senders'])
  mock.mock.mockImplementation(async url => url.endsWith('/senders') ? new Response(JSON.stringify({ senders: [{ id: 1, active: true }] })) : new Response('{}', { status: 201 }))
  await sendDispatchConfirmation('reader@example.invalid', 'https://preview.example.invalid/dispatch/confirm', 'test-key')
})
