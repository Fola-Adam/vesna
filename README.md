# Vesna — Curated Living

An editorial product catalog with affiliate seller links, Supabase administration, newsletter signup, and the Venus discovery assistant. Built with Next.js 16, React 19, Tailwind CSS, and Supabase.

## Development

Use Node.js 22.18 or newer (the test runner uses native TypeScript support).

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for catalog reads and administration. Without them, the public catalog displays an explicitly labeled preview collection. Preview products never have working purchase links. A successful database lookup for an inactive or missing product renders the not-found page rather than restoring a preview listing.

The public domain defaults to `https://vesna-seven.vercel.app` and the contact address to the `victoryvesna2@gmail.com` address stored in Supabase site settings. Override these with `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_CONTACT_EMAIL` when needed.

## Administration and database upgrade

Administration lives at `/admin/dashboard`, `/admin/products`, `/admin/analytics`, and `/admin/subscribers`. Both the proxy and server layout require a validated Supabase user whose own profile has `role = 'admin'`. Anonymous and non-admin users are redirected to `/login`; configuration or authentication failures do not grant access.

For an existing project, apply `supabase/migrations/202610070001_protect_profile_roles.sql` in the Supabase SQL Editor using the database owner. It is transactional and repeatable. The migration:

- Defaults new signup profiles to `user`, regardless of signup metadata.
- Restricts profile reads to the owner and profile edits to name/avatar/phone/bio.
- Adds an invoker trigger to block client role changes if column grants are accidentally expanded later.
- Preserves existing trusted role assignments; review existing administrators before deployment.
- Lets administrators read inactive products and keeps subscriber records inaccessible to anonymous clients.

For a fresh project, `schema.sql` includes these same protections. Provision the first administrator through a trusted database-owner operation after creating their account; never supply an admin role as signup metadata. The repository does not automatically apply migrations or create administrators.

## Newsletter

Homepage, About, and Journal share one signup form. `/api/subscribe` validates requests and saves them using **`SUPABASE_SERVICE_ROLE_KEY`**, which must be configured only on the server. Never prefix it with `NEXT_PUBLIC_` or put it in client code. Public insert/read access to subscriber records is not needed. Missing server configuration or a persistence failure returns a clear 503 response; the form retains the email for retry.

Duplicate emails are accepted without revealing membership. A repeated signup reactivates a previously unsubscribed database record. Signup records are initially unverified. Email ownership confirmation and production delivery automation still need to be configured before sending campaigns; saving a row alone does not confirm delivery.

`BREVO_API_KEY` optionally syncs contacts; `BREVO_LIST_ID` selects the delivery list. The UI confirms a saved signup, not that an email was delivered. Brevo delivery and preference management must be verified in the configured account. This release does not implement a complete double-opt-in or unsubscribe email workflow.

## Catalog and seller links

`/picks` is the main catalog; `/shop` redirects there while retaining query parameters. Search (`q`), category (`category`), maximum listed USD price (`maxPrice`), and sorting (`sort`) are shareable and survive reloads. Homepage spotlight items and counts come from the same catalog.

Product pages show stored descriptions and curator notes without inventing included benefits. Supply real categories, accurate images, product-specific notes, and seller links through administration. An absent or invalid destination is displayed as unavailable. Archive pieces do not offer seller redirects.

`/api/track-click?productId=<uuid>` resolves an active product's **stored** destination and ignores a caller-supplied `to` URL. Tracking runs after the redirect response; a tracking outage must not delay the seller visit. HTTP(S) links containing embedded credentials are rejected.

## Venus

Configure `GROQ_API_KEY` on the server. Contextual product questions use shared React state and retrieve the selected active listing. Keyword lookup is the default; only enable `VENUS_SEMANTIC_SEARCH=true` after provisioning vector search and the embedding model cache. The API streams structured NDJSON events; the client buffers frames across network and UTF-8 boundaries. Failed or incomplete streams do not become successful answers.

Chat history stays in browser storage and can be cleared in the assistant. The Privacy page describes message processing, signup storage, and seller-link analytics.

## Verification

```bash
npm run lint
npm run build
npx playwright install chromium
npm test
```

`npm test` runs the entire unit/database suite, public browser journeys without credentials, and local service integration checks. The database suite applies the migration to a legacy schema in PGlite and verifies role ownership, profile privacy, trusted administrator access, and subscriber protection. Integration tests exercise the real Next routes against an isolated HTTP Supabase fixture; they never save real signups, call Groq, or place orders.

The browser suites start and stop their own Next dev servers sequentially (ports 3102–3104), since Next uses one dev-output lock per checkout. `TEST_BASE_URL` can point the public journey suite at an already running **preview/fallback** build. For system Chromium in this cloud workspace, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium`.

Cloud HTTPS requests must retain the platform proxy and CA trust. Node 24 in this environment supports `NODE_USE_ENV_PROXY=1`, which makes SDK reads use the configured proxy. Use it for live catalog builds/startup when direct egress is unavailable. Do not disable TLS verification.

## Release checks

Before deploying, apply and verify the role-policy migration, configure the server-only signup key, confirm email delivery/preferences, and replace incomplete catalog records with verified seller links and categories. Automated fixtures establish application behavior; they do not verify the live Supabase policy state or providers.
