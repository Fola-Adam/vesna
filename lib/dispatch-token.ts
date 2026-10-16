import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

export interface DispatchConsent {
  id: string
  email: string
  unsubscribe_token: string
  unsubscribed_at: string | null
}
interface ConfirmationClaims { id: string; emailHash: string; state: string; audience: string; expires: number }
const digest = (value: string) => createHash('sha256').update(value).digest('base64url')
export const emailFingerprint = (email: string) => digest(email.trim().toLowerCase())
export const consentFingerprint = (row: DispatchConsent) => digest(`${row.unsubscribe_token}:${row.unsubscribed_at ?? 'active'}`)
// Derive a purpose-specific signing key; the underlying secret never leaves the server.
const signature = (payload: string, secret: string) => createHmac('sha256', digest(`vesna-dispatch-confirmation-v1:${secret}`)).update(payload).digest()

export function issueConfirmation(row: DispatchConsent, audience: string, secret: string, now = Date.now()): string {
  if (!secret || !audience) throw new Error('Confirmation is not configured')
  const payload = Buffer.from(JSON.stringify({ id: row.id, emailHash: emailFingerprint(row.email), state: consentFingerprint(row), audience, expires: Math.floor(now / 1000) + 86400 })).toString('base64url')
  return `${payload}.${signature(payload, secret).toString('base64url')}`
}

export function readConfirmation(token: unknown, audience: string, secret: string, now = Date.now()): ConfirmationClaims | null {
  if (typeof token !== 'string' || token.length > 1500 || !secret || !audience) return null
  const parts = token.split('.')
  if (parts.length !== 2 || !parts.every(part => /^[A-Za-z0-9_-]+$/.test(part))) return null
  try {
    const actual = Buffer.from(parts[1], 'base64url')
    const expected = signature(parts[0], secret)
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null
    const claims = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')) as ConfirmationClaims
    if (typeof claims.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(claims.id) ||
      typeof claims.emailHash !== 'string' || typeof claims.state !== 'string' ||
      claims.audience !== audience || !Number.isInteger(claims.expires) || claims.expires <= Math.floor(now / 1000)) return null
    return claims
  } catch { return null }
}
