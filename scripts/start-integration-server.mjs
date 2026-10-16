import http from 'node:http'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const products = [
  { id: '00000000-0000-4000-8000-000000000001', slug: 'test-course', name: 'Test course', price: 50, affiliate_link: null, is_active: true, item_type: 'curated' },
  { id: '00000000-0000-4000-8000-000000000002', slug: 'test-bag', name: 'Test bag', price: 100, affiliate_link: 'https://seller.example/item?ref=vesna', is_active: true, item_type: 'shop' },
  { id: '00000000-0000-4000-8000-000000000003', slug: 'quiet-luxury-interiors', name: 'Inactive pick', price: 50, affiliate_link: 'https://seller.example/old', is_active: false, item_type: 'shop' },
  { id: '00000000-0000-4000-8000-000000000004', slug: 'archive-piece', name: 'Archive piece', price: null, affiliate_link: 'https://seller.example/archive', is_active: true, item_type: 'archive' },
].map(product => ({ description: 'Fixture description', sale_price: null, image_urls: [], why_victory: 'Fixture curator note', is_featured: false, categories: { name: 'Tech' }, ...product }))
const subscribers = new Map()
let trackingCompleted = false
const fixture = http.createServer(async (request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1:3103')
  response.setHeader('Content-Type', 'application/json')
  function send(status, body) { response.writeHead(status); response.end(JSON.stringify(body)) }
  const chunks = []
  for await (const chunk of request) chunks.push(chunk)
  const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : null
  if (url.pathname === '/auth/v1/user') {
    try {
      const token = request.headers.authorization.split(' ')[1]
      const claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
      return send(200, { id: claims.sub, email: 'fixture@example.com', aud: 'authenticated', role: 'authenticated' })
    } catch { return send(401, { message: 'Invalid token' }) }
  }
  if (url.pathname === '/rest/v1/profiles') {
    const id = url.searchParams.get('id')?.replace('eq.', '')
    const row = { id, role: id === '00000000-0000-4000-8000-000000000010' ? 'admin' : 'user' }
    return send(200, request.headers.accept?.includes('object') ? row : [row])
  }
  if (url.pathname === '/rest/v1/categories') return send(200, [])
  if (url.pathname === '/rest/v1/products') {
    let rows = products
    for (const field of ['id', 'slug']) {
      const match = url.searchParams.get(field)
      if (match?.startsWith('eq.')) rows = rows.filter(row => row[field] === match.slice(3))
    }
    if (url.searchParams.get('is_active') === 'eq.true') rows = rows.filter(row => row.is_active)
    if (url.searchParams.has('limit')) rows = rows.slice(0, Number(url.searchParams.get('limit')))
    return send(200, request.headers.accept?.includes('object') ? rows[0] ?? null : rows)
  }
  if (url.pathname === '/rest/v1/email_subscribers') {
    if (request.headers.apikey !== 'fixture-service-key') return send(403, { message: 'Server key required' })
    if (request.method === 'POST') {
      if (subscribers.has(body.email)) return send(409, { code: '23505' })
      subscribers.set(body.email, { ...body, unsubscribed_at: null })
      return send(201, null)
    }
    if (request.method === 'PATCH') {
      const email = url.searchParams.get('email')?.replace('eq.', '')
      Object.assign(subscribers.get(email) ?? {}, body)
      return send(200, null)
    }
  }
  if (url.pathname === '/rest/v1/click_tracking' && request.method === 'POST') {
    setTimeout(() => { trackingCompleted = true; send(201, null) }, 3000)
    return
  }
  if (url.pathname === '/__fixture/subscriber') return send(200, subscribers.get(url.searchParams.get('email')) ?? null)
  if (url.pathname === '/__fixture/tracking') return send(200, { completed: trackingCompleted })
  if (url.pathname === '/__fixture/unsubscribe' && request.method === 'POST') {
    const contact = subscribers.get(body.email)
    if (contact) contact.unsubscribed_at = new Date().toISOString()
    return send(200, null)
  }
  return send(404, { message: 'Unknown fixture endpoint' })
})
await new Promise(resolve => fixture.listen(3103, '127.0.0.1', resolve))
const testEnv = { ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:3103',
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'fixture-public-key',
  SUPABASE_SERVICE_ROLE_KEY: 'fixture-service-key',
}
for (const name of ['GROQ_API_KEY', 'BREVO_API_KEY']) delete testEnv[name]
const server = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'dev', '--port', '3104', '--hostname', '127.0.0.1'], { stdio: 'inherit', env: testEnv })
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => { server.kill(signal); fixture.close() })
server.on('exit', code => { fixture.close(); process.exit(code ?? 1) })
