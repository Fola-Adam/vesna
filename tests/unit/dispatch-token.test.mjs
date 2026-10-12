import { test } from 'node:test'
import assert from 'node:assert/strict'
import { consentFingerprint, emailFingerprint, issueConfirmation, readConfirmation } from '../../lib/dispatch-token.ts'

const row = { id: 'd6ce4e5c-cf6c-4b13-bb2a-a921a1240125', email: 'reader@example.invalid', unsubscribe_token: '086789fe-6fe6-4675-9606-5a3c593715fa', unsubscribed_at: null }
const origin = 'https://deploy-preview-2--ves-na.netlify.app'
const secret = 'test-only-dispatch-signing-secret'
const now = 1791830000000

test('confirmation proves ownership without exposing the email or unsubscribe capability', () => {
  const token = issueConfirmation(row, origin, secret, now)
  const claims = readConfirmation(token, origin, secret, now)
  assert.equal(claims.id, row.id)
  assert.equal(claims.emailHash, emailFingerprint(row.email))
  assert.equal(claims.state, consentFingerprint(row))
  const decoded = Buffer.from(token.split('.')[0], 'base64url').toString('utf8')
  assert.ok(!decoded.includes(row.email))
  assert.ok(!decoded.includes(row.unsubscribe_token))
})

test('tampering, wrong signing keys, and a different deployment cannot verify', () => {
  const token = issueConfirmation(row, origin, secret, now)
  const [payload, signature] = token.split('.')
  const changed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  changed.id = '2f9f03d2-4b50-4635-9532-e685e7177d78'
  assert.equal(readConfirmation(`${Buffer.from(JSON.stringify(changed)).toString('base64url')}.${signature}`, origin, secret, now), null)
  assert.equal(readConfirmation(token, origin, 'wrong-secret', now), null)
  assert.equal(readConfirmation(token, 'https://ves-na.netlify.app', secret, now), null)
})

test('links expire at 24 hours; malformed and oversized input is rejected', () => {
  const token = issueConfirmation(row, origin, secret, now)
  assert.ok(readConfirmation(token, origin, secret, now + 86399000))
  assert.equal(readConfirmation(token, origin, secret, now + 86400000), null)
  for (const input of [null, {}, '', 'invalid', 'x.y.z', 'x'.repeat(1501)]) assert.equal(readConfirmation(input, origin, secret, now), null)
})

test('a new unsubscribe invalidates old confirmation consent; rejoining needs a fresh link', () => {
  const before = readConfirmation(issueConfirmation(row, origin, secret, now), origin, secret, now)
  const unsubscribed = { ...row, unsubscribed_at: '2026-10-12T19:12:00.000Z' }
  assert.notEqual(before.state, consentFingerprint(unsubscribed))
  const rejoin = readConfirmation(issueConfirmation(unsubscribed, origin, secret, now), origin, secret, now)
  assert.equal(rejoin.state, consentFingerprint(unsubscribed))
  assert.notEqual(rejoin.state, consentFingerprint({ ...unsubscribed, unsubscribed_at: '2026-10-13T19:12:00.000Z' }))
})
