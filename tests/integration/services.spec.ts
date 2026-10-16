import { test, expect } from '@playwright/test'

// Keep external assets and analytics out of the test transport. Local product
// image failures are rendered through the real CatalogImage fallback.
test.beforeEach(async ({ page }) => {
  await page.route('**/*', route => {
    const url = new URL(route.request().url())
    const image = url.pathname === '/_next/image' ? url.searchParams.get('url') : null
    if (!['127.0.0.1', 'localhost'].includes(url.hostname) || image?.startsWith('https://')) return route.abort()
    return route.continue()
  })
})

function sessionCookie(id: string) {
  const expires = Math.floor(Date.now() / 1000) + 3600
  const token = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url') + '.' + Buffer.from(JSON.stringify({ sub: id, exp: expires, aud: 'authenticated', role: 'authenticated' })).toString('base64url') + '.fixture'
  const session = { access_token: token, refresh_token: 'fixture-refresh', token_type: 'bearer', expires_in: 3600, expires_at: expires, user: { id } }
  return 'sb-127-auth-token=base64-' + Buffer.from(JSON.stringify(session)).toString('base64url')
}

test('signed-in non-admins are rejected and administrators reach the admin page', async ({ request }) => {
  const user = await request.get('/admin/products', { headers: { cookie: sessionCookie('00000000-0000-4000-8000-000000000011') }, maxRedirects: 0 })
  expect(user.status()).toBe(307)
  expect(user.headers().location).toContain('/login')
  const admin = await request.get('/admin/products', { headers: { cookie: sessionCookie('00000000-0000-4000-8000-000000000010') }, maxRedirects: 0 })
  expect(admin.status()).toBe(200)
  expect(await admin.text()).toContain('Add Product')
})

test('saved signup is real, duplicates are safe, and a new opt-in reactivates the record', async ({ page, request }) => {
  const email = 'integration-reader@example.com'
  await page.goto('/about')
  const form = page.locator('form').filter({ has: page.locator('input[type="email"]') })
  await form.locator('input').fill(email)
  await form.getByRole('button').click()
  await expect(page.getByRole('status').filter({ hasText: 'signup is saved' })).toBeVisible()
  const saved = await request.get(`http://127.0.0.1:3103/__fixture/subscriber?email=${email}`)
  expect(await saved.json()).toMatchObject({ email, source: 'about', unsubscribed_at: null })
  await request.post('http://127.0.0.1:3103/__fixture/unsubscribe', { data: { email } })
  const repeat = await request.post('/api/subscribe', { data: { email, source: 'journal' } })
  expect(repeat.status()).toBe(200)
  const reactivated = await request.get(`http://127.0.0.1:3103/__fixture/subscriber?email=${email}`)
  expect((await reactivated.json()).unsubscribed_at).toBeNull()
})

test('seller redirects use stored destinations and respond before tracking completes', async ({ request }) => {
  const response = await request.get('/api/track-click?productId=00000000-0000-4000-8000-000000000002&to=https://untrusted.example', { maxRedirects: 0 })
  expect(response.status()).toBe(302)
  expect(response.headers().location).toBe('https://seller.example/item?ref=vesna')
  const state = await request.get('http://127.0.0.1:3103/__fixture/tracking')
  expect((await state.json()).completed).toBe(false)
})

test('inactive and archive listings cannot redirect shoppers', async ({ request, page }) => {
  for (const id of ['00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000004']) {
    const response = await request.get(`/api/track-click?productId=${id}`, { maxRedirects: 0 })
    expect(response.status()).toBe(404)
  }
  // This slug exists in the old fallback dataset, but a successful empty lookup
  // for the inactive live record must not resurrect that demonstration product.
  await page.goto('/shop/quiet-luxury-interiors')
  await expect(page.getByRole('heading', { name: 'Page Not Found', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Quiet Luxury Interiors', exact: true })).toHaveCount(0)
  await expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', 'noindex')
})


test('authorized administrators can open product editing with async route params', async ({ request }) => {
  const response = await request.get('/admin/products/00000000-0000-4000-8000-000000000002/edit', {
    headers: { cookie: sessionCookie('00000000-0000-4000-8000-000000000010') },
  })
  expect(response.status()).toBe(200)
  expect(await response.text()).toContain('Update Product')
})
