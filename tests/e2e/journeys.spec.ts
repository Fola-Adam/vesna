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

// These checks run without live credentials; no real signups or AI calls are made.
test('legacy admin URL does not expose administration', async ({ request }) => {
  const response = await request.get('/products', { maxRedirects: 0 })
  expect([404, 307, 308]).toContain(response.status())
  expect(await response.text()).not.toContain('Add Product')
})

test('anonymous admin visitor is sent to login', async ({ request }) => {
  const response = await request.get('/admin/products', { maxRedirects: 0 })
  expect(response.status()).toBe(307)
  expect(response.headers().location).toContain('/login')
})

test('arbitrary caller supplied seller destinations are rejected', async ({ request }) => {
  const response = await request.get('/api/track-click?to=https%3A%2F%2Fexample.com', { maxRedirects: 0 })
  expect(response.status()).toBe(400)
  expect(response.headers().location).toBeUndefined()
})

for (const path of ['/about', '/journal']) {
  test(`${path} signup reports failure instead of pretending success`, async ({ page }) => {
    await page.route('**/api/subscribe', route => route.fulfill({ status: 503, json: { error: 'Signup is temporarily unavailable. Please try again later.' } }))
    await page.goto(path)
    const form = page.locator('form').filter({ has: page.locator('input[type="email"]') })
    await form.locator('input').fill('reader@example.com')
    await form.getByRole('button').click()
    await expect(form.getByRole('alert')).toContainText('temporarily unavailable')
    await expect(form.locator('input')).toBeVisible()
  })
}

test('category links preserve the chosen collection', async ({ page }) => {
  await page.goto('/')
  const tech = page.locator('a').filter({ has: page.getByRole('heading', { name: 'Tech', exact: true }) })
  await tech.click()
  await expect(page).toHaveURL(/\/picks\?category=tech/)
  await expect(page.getByRole('button', { name: 'Tech', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

test('footer destinations resolve to useful pages', async ({ page, request }) => {
  await page.goto('/')
  const destinations = await page.locator('footer a[href^="/"]').evaluateAll(links => links.map(link => link.getAttribute('href')).filter((href): href is string => !!href && href !== '/'))
  expect(destinations.length).toBeGreaterThanOrEqual(5)
  for (const destination of destinations) {
    const response = await request.get(destination)
    expect(response.status(), destination).toBe(200)
  }
})

test('mobile assistant leaves the hero readable and menu is keyboard accessible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const heading = await page.getByRole('heading', { level: 1 }).boundingBox()
  const launcher = await page.getByRole('button', { name: 'Open chat assistant' }).boundingBox()
  expect(heading).not.toBeNull()
  expect(launcher).not.toBeNull()
  expect(launcher!.y).toBeGreaterThan(heading!.y + heading!.height)
  const menu = page.getByRole('button', { name: 'Toggle menu', exact: true, includeHidden: true })
  await menu.click()
  await expect(menu).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Escape')
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  await expect(menu).toBeFocused()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('unconfigured signup fails cleanly without claiming persistence', async ({ request }) => {
  const response = await request.post('/api/subscribe', { data: { email: 'reader@example.com' } })
  expect(response.status()).toBe(503)
  expect(await response.json()).toEqual({ error: 'Signup is temporarily unavailable. Please try again later.' })
})

test('search and budget persist in the URL across reloads', async ({ page }) => {
  await page.goto('/picks')
  await page.getByRole('searchbox', { name: 'Search picks' }).fill('keyboard')
  await page.getByRole('spinbutton', { name: 'Maximum price (USD)' }).fill('400')
  await expect(page).toHaveURL(/q=keyboard/)
  await expect(page).toHaveURL(/maxPrice=400/)
  await page.reload()
  await expect(page.getByRole('searchbox', { name: 'Search picks' })).toHaveValue('keyboard')
  await expect(page.getByRole('spinbutton', { name: 'Maximum price (USD)' })).toHaveValue('400')
  await expect(page.getByRole('heading', { name: 'Mechanical Keyboard Pro' })).toBeVisible()
})

test('a listing without a seller link clearly explains its availability', async ({ page }) => {
  await page.goto('/shop/masterclass-digital-curation')
  await expect(page.getByText('Seller link unavailable', { exact: true })).toBeVisible()
  await expect(page.getByText('Lifetime access with future updates')).toHaveCount(0)
  await expect(page.getByText('Secure checkout via affiliate partner')).toHaveCount(0)
})

test('product questions open Venus with controlled context and render structured responses', async ({ page }) => {
  await page.route('**/api/venus', async route => {
    const body = route.request().postDataJSON()
    expect(body.productSlug).toBe('masterclass-digital-curation')
    expect(body.message).toContain('Masterclass: Digital Curation')
    await route.fulfill({ status: 200, contentType: 'application/x-ndjson', body: [
      { type: 'text', text: 'Check the seller’s course terms before choosing it.' },
      { type: 'products', products: [] }, { type: 'done' },
    ].map(event => JSON.stringify(event)).join('\n') + '\n' })
  })
  await page.goto('/shop/masterclass-digital-curation')
  await page.getByRole('button', { name: 'Ask Venus about Masterclass: Digital Curation', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('textbox', { name: 'Message Venus' })).toHaveValue(/Masterclass: Digital Curation/)
  await dialog.getByRole('button', { name: 'Send message' }).click()
  await expect(dialog.getByText('Check the seller’s course terms before choosing it.')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
})
