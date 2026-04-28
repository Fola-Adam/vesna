# VESNA — TECHNICAL BUILD: PHASE 1 AND 2

---

## HOW TO USE THIS FILE

This file covers the technical implementation of Vesna Phase 1 and Phase 2.

**Fola handles:**
- All architectural decisions
- Database schema design
- Security policy design
- Payment and auth logic
- Code review and final judgment on all generated code

**Claude assists with:**
- Generating component code from defined specs
- Writing utility functions
- Debugging specific errors
- Suggesting implementation patterns
- Writing tests

Never accept generated code without reading and understanding every line before it goes into the codebase.

---

## PHASE 1 TECHNICAL IMPLEMENTATION

### Environment Setup

**Accounts to create before writing code:**
- GitHub (repo: `vesna-platform`)
- Netlify (connect to GitHub repo)
- Airtable (Products base, Clicks table)
- Brevo (email — free tier)
- Anthropic API (Venus)
- Google Analytics GA4
- Google Search Console (verify on deploy)
- Meta Business (Pixel ID)

**Environment variables (Netlify dashboard — never in code):**
```
AIRTABLE_API_KEY
AIRTABLE_BASE_ID
AIRTABLE_TABLE_NAME=Products
ANTHROPIC_API_KEY
BREVO_API_KEY
```

**Repository structure:**
```
vesna/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   ├── api.js
│   ├── components.js
│   └── venus.js
├── pages/
│   ├── products.html
│   ├── about.html
│   └── product.html
├── functions/
│   └── api/
│       ├── products.js
│       ├── track-click.js
│       ├── subscribe.js
│       └── venus.js
├── _redirects
└── _headers
```

**`_redirects` file:**
```
/products/:slug    /pages/product.html    200
/api/*             /.netlify/functions/api/:splat    200
/*                 /index.html    200
```

**`_headers` file:**
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/api/*
  Cache-Control: public, max-age=300
```

---

### Airtable Schema

**Base: Vesna CMS**

**Products table:**
```
Product Name        Single line text        (required)
Price               Currency ₦              (required)
Sale Price          Currency ₦              (optional)
Image               Attachment
Affiliate Link      URL                     (required)
Category            Single select:
                    Courses, Ebooks, Tools,
                    Templates, Apps, Finance,
                    Fashion, Tech, Home,
                    Food, Creator Tools
Description         Long text
Why Victory         Long text               (personal endorsement)
Featured            Checkbox
Active              Checkbox
Curator             Link to Curators table
Date Added          Created time            (auto)
Slug                Formula:
                    LOWER(SUBSTITUTE(
                      SUBSTITUTE({Product Name},
                      " ", "-"), "'", ""))
```

**Curators table:**
```
Name                Single line text
Slug                Single line text
Bio                 Long text
Niche               Single line text
Photo               Attachment
Instagram           URL
Twitter             URL
Website             URL
Active              Checkbox
Date Approved       Date
```

**Clicks table:**
```
Product             Link to Products
Timestamp           Created time (auto)
Referrer            Single line text
User Agent          Single line text
Session ID          Single line text
```

**Subscribers table:**
```
Email               Email
First Name          Single line text
Subscribed At       Created time (auto)
Source              Single line text
Active              Checkbox
```

---

### Netlify Functions

**`/functions/api/products.js`**

Logic:
1. Fetch from Airtable using API key (server-side only)
2. Filter: Active = true
3. Sort: Featured first, then Date Added descending
4. Transform: clean field names, extract image URL from attachment object
5. Set Cache-Control header (5-minute cache)
6. Return `{ products: [...] }`

Key security notes:
- API key in env var, never in response
- Rate limit: check Netlify's built-in rate limiting
- Validate response before sending — never forward raw Airtable errors

**`/functions/api/track-click.js`**

Logic:
1. Receive: `{ productId, referrer, sessionId }`
2. Validate inputs (productId required, others optional)
3. Write record to Clicks table
4. Return `{ success: true }` — never block the affiliate link click

**`/functions/api/subscribe.js`**

Logic:
1. Receive: `{ email, firstName }`
2. Validate email format
3. Check if already subscribed (Airtable lookup)
4. Add to Brevo contact list via API
5. Add to Subscribers table in Airtable
6. Return `{ success: true }`

**`/functions/api/venus.js`**

Logic:
1. Receive: `{ message, conversationHistory }`
2. Rate limit check (10 conversations per session via cookie/IP)
3. Fetch relevant products from Airtable (keyword search on product names and descriptions)
4. Build system prompt (Venus personality + product context)
5. Call Anthropic API (claude-haiku-20241022 for Phase 1 — cheapest)
6. Stream response back to client
7. Return streamed text

Venus Phase 1 system prompt structure:
```
You are Venus, the AI assistant for Vesna — a curated digital
product platform built around Victory's personal recommendations.

Your personality: warm, direct, knowledgeable. You sound like
someone who genuinely works at Vesna and cares about helping
visitors find the right product. Never robotic. Never
sycophantic. Never pushy.

Your capability in Phase 1: You help visitors discover products
from Vesna's catalog through natural conversation. You can search
products, explain what they are, compare them, and tell people
where to get them. You cannot process purchases yet.

Current catalog context:
[PRODUCTS INJECTED HERE]

Rules:
- Only recommend products that are in the catalog above
- If asked about something not in the catalog, say so honestly
  and suggest the closest match
- Never make up product details
- Always mention the Why Victory note if one exists for the product
- Keep responses concise — 2 to 4 sentences usually enough
- If someone seems ready to buy, point them to the affiliate link
```

---

### CSS Design System

All tokens defined as CSS custom properties before any component is built. No hardcoded colors, sizes, or spacing anywhere in the codebase.

**Token categories:**
- Colors (full palette as listed in overview)
- Typography (font families, scale, weights, line heights)
- Spacing (4px base unit, scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96)
- Border radius (sm: 6px, md: 10px, lg: 16px, xl: 24px, full: 9999px)
- Shadows (card, gold glow, green glow)
- Transitions (fast: 150ms, base: 250ms, slow: 400ms)
- Z-index scale (dropdown: 10, sticky: 20, overlay: 30, modal: 40, toast: 50)

**Component build order:**
1. Reset and base styles
2. Typography classes
3. Button variants (primary, secondary, ghost, outline — all sizes)
4. Badge variants (sale, featured, new)
5. Card (product card, skeleton card, category card)
6. Navigation
7. Filter chips
8. Toast notifications
9. Empty states
10. Loading states (skeleton shimmer)
11. Search overlay
12. Modal/overlay base
13. Footer
14. Hero section
15. Page-specific layouts

---

### SEO Implementation

Every page before going live:

**Meta tags (every page):**
```html
<title>[Page Title] — Vesna</title>
<meta name="description" content="[150-160 chars, written to earn the click]">
<meta property="og:title" content="[Same as title]">
<meta property="og:description" content="[Same as meta description]">
<meta property="og:image" content="[Product image or Vesna default OG image]">
<meta property="og:url" content="[Canonical URL]">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="[Canonical URL]">
```

**Product page schema markup:**
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "[Product Name]",
  "description": "[Description]",
  "image": "[Image URL]",
  "offers": {
    "@type": "Offer",
    "price": "[Price]",
    "priceCurrency": "NGN",
    "availability": "https://schema.org/InStock"
  }
}
```

**Sitemap:** Auto-generated on build, submitted to Search Console on launch.

**Core Web Vitals targets:**
- LCP (Largest Contentful Paint): under 2.5s
- FID/INP (Interaction): under 100ms
- CLS (Cumulative Layout Shift): under 0.1
- Lighthouse mobile score: 90+

**Image rules:**
- All images: explicit `width` and `height` attributes (prevents CLS)
- Below-fold images: `loading="lazy"`
- Above-fold hero: preloaded with `<link rel="preload">`
- Format: WebP with JPEG fallback
- Max size before compression: 200KB per image

---

### Analytics Setup

**Google Analytics GA4:**
- Page view events (automatic)
- Custom events to track:
  - `affiliate_click` (product_id, product_name, category)
  - `venus_conversation_start`
  - `email_subscribe`
  - `product_view`
  - `category_filter`

**Meta Pixel:**
- PageView (automatic)
- ViewContent (product pages)
- Lead (email subscribe)

**Internal click tracking:**
- Every affiliate link click fires `track-click` function
- Stores in Airtable Clicks table
- Used for Victory's dashboard (Phase 2)

---

### Phase 1 Launch Checklist

**Before going live — every item must be checked:**

Technical:
- [ ] All pages load on mobile without horizontal scroll
- [ ] All pages load under 3 seconds on simulated 3G
- [ ] All affiliate links open in new tab with `rel="noopener noreferrer"`
- [ ] Airtable API key not visible in any client-side code
- [ ] Error states tested (what happens when API fails)
- [ ] 404 page exists and is helpful
- [ ] `_headers` file in place (security headers)
- [ ] HTTPS active (Netlify handles automatically)

Content:
- [ ] Email capture tested end-to-end (subscribe → welcome email received)
- [ ] Venus tested with 20 different query types
- [ ] All meta tags and OG tags verified (Facebook Sharing Debugger)
- [ ] All product slugs are unique and URL-safe
- [ ] Affiliate disclosure visible on every page with affiliate links

Analytics:
- [ ] Click tracking verified (Clicks table populating)
- [ ] GA4 events firing correctly (use DebugView)
- [ ] Meta Pixel verified (use Pixel Helper extension)
- [ ] Search Console ownership verified

Legal:
- [ ] Affiliate disclosure in footer
- [ ] Privacy policy page live
- [ ] Cookie notice (minimal — first-party analytics only)

---

## PHASE 2 TECHNICAL IMPLEMENTATION

### Stack Migration

Phase 2 introduces Supabase as the primary database. Airtable remains for product management (Victory's CMS interface) but all user data, community data, and dynamic platform data moves to Supabase.

**Supabase project setup:**
- Enable pgvector extension (ready for Phase 3)
- Enable Realtime (for Spring comments and notifications)
- Configure Row Level Security from day one — not as an afterthought

**Framework migration:**
Phase 2 is the point to migrate from vanilla HTML/CSS/JS to Next.js.

Reasons:
- User authentication requires protected routes
- Spring community requires complex state management
- Curator profiles require dynamic routing
- SEO requires server-side rendering for user-generated content
- Real-time features require WebSocket management

**Next.js setup:**
```
vesna/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    (homepage)
│   ├── products/
│   │   ├── page.tsx                (all products)
│   │   └── [slug]/
│   │       └── page.tsx            (product detail)
│   ├── curators/
│   │   └── [slug]/
│   │       └── page.tsx            (curator profile)
│   ├── spring/
│   │   ├── page.tsx                (main Spring feed)
│   │   └── [bloom]/
│   │       └── page.tsx            (Bloom page)
│   ├── about/
│   │   └── page.tsx
│   └── api/
│       ├── products/
│       ├── venus/
│       ├── spring/
│       └── auth/
├── components/
│   ├── ui/                         (design system components)
│   ├── product/                    (product-specific components)
│   ├── spring/                     (community components)
│   ├── venus/                      (Venus chat components)
│   └── layout/                     (nav, footer, etc.)
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── airtable/
│   └── utils/
├── types/
│   └── index.ts
└── middleware.ts
```

---

### Supabase Schema

**Auth (Supabase built-in):**
Extended with a `profiles` table that joins to `auth.users`.

**`profiles` table:**
```sql
id              uuid references auth.users primary key
username        text unique
display_name    text
avatar_url      text
bio             text
role            text check (role in ('member', 'curator', 'maker', 'admin'))
verification_tier integer default 1  -- 1=email, 2=phone, 3=identity, 4=business, 5=vesna
created_at      timestamptz default now()
updated_at      timestamptz default now()
```

**`curator_profiles` table:**
```sql
id              uuid primary key default gen_random_uuid()
user_id         uuid references profiles(id)
slug            text unique
niche           text
instagram       text
twitter         text
website         text
integrity_score integer default 100
approved_at     timestamptz
approved_by     uuid references profiles(id)
created_at      timestamptz default now()
```

**`spring_posts` table:**
```sql
id              uuid primary key default gen_random_uuid()
author_id       uuid references profiles(id)
bloom           text
post_type       text check (post_type in
                ('review','discussion','experience',
                 'question','milestone','collab'))
title           text
content         text
product_id      text  -- Airtable product ID if linked
upvotes         integer default 0
is_pinned       boolean default false
is_archived     boolean default false
created_at      timestamptz default now()
updated_at      timestamptz default now()
```

**`spring_comments` table:**
```sql
id              uuid primary key default gen_random_uuid()
post_id         uuid references spring_posts(id)
author_id       uuid references profiles(id)
parent_id       uuid references spring_comments(id)  -- for nesting
content         text
upvotes         integer default 0
created_at      timestamptz default now()
```

**`follows` table:**
```sql
follower_id     uuid references profiles(id)
following_id    uuid references profiles(id)
created_at      timestamptz default now()
primary key (follower_id, following_id)
```

**`curator_certificates` table:**
```sql
id              uuid primary key default gen_random_uuid()
buyer_id        uuid references profiles(id)
curator_id      uuid references profiles(id)
product_airtable_id text
product_name    text
purchase_proof_url  text
verification_status text check (status in
                  ('pending','verified','rejected'))
certificate_code    text unique
qr_data             text
issued_at           timestamptz
created_at          timestamptz default now()
```

**`email_subscribers` table:**
```sql
id              uuid primary key default gen_random_uuid()
email           text unique
first_name      text
source          text
is_active       boolean default true
created_at      timestamptz default now()
```

**Row Level Security policies (critical — define these before any data is written):**

```sql
-- Profiles: users can only update their own profile
create policy "Users can update own profile"
on profiles for update
using (auth.uid() = id);

-- Spring posts: authenticated users can insert
create policy "Authenticated users can post"
on spring_posts for insert
to authenticated
with check (auth.uid() = author_id);

-- Spring posts: accounts under 7 days cannot post
create policy "Account age gate for posting"
on spring_posts for insert
to authenticated
with check (
  (select created_at from profiles where id = auth.uid())
  < now() - interval '7 days'
);
```

---

### Authentication Flow

**Supabase Auth configuration:**
- Email/password signup with email verification
- Phone OTP for Tier 2 verification
- Google OAuth for convenience login
- Session: JWT stored in httpOnly cookie (not localStorage)

**Protected route middleware (`middleware.ts`):**
```typescript
// Redirect unauthenticated users away from protected routes
// Redirect authenticated users away from auth pages
// Check user role for admin routes
```

**Verification tier progression:**
- Tier 1 (Email): automatic on email confirmation
- Tier 2 (Phone): OTP sent via Termii, verified in profile
- Tier 3 (Identity): BVN check via Paystack Identity API
- Tier 4 (Business): CAC number verified manually by Victory
- Tier 5 (Vesna Verified): Victory manually grants in admin dashboard

---

### Spring Community Architecture

**Real-time comments:**
- Supabase Realtime subscription on `spring_comments` table filtered by `post_id`
- New comments appear instantly without page reload
- Optimistic UI — comment appears immediately, confirmed or rolled back on server response

**Trending algorithm:**
```
trending_score = (upvotes * 2) + (comments * 1.5) + (saves * 1)
                 divided by (hours_since_posted ^ 1.8)
```
Recalculated every 15 minutes via Supabase Edge Function.

**Content moderation pipeline:**
1. Post submitted
2. Automated checks: spam patterns, external links, prohibited content keywords
3. Account age check (under 7 days → queued for review)
4. If passes all checks → published
5. Published posts can be flagged by community
6. Flag threshold (3 flags) → auto-hides pending review

**Vesnaian Fund flow:**
1. Application submitted via Venus interview or form
2. Review in dedicated Spring Bloom (anonymized)
3. Community upvotes past threshold → Victory approves
4. Fundraising window opens (72 hours)
5. Contributions tracked with optimistic locking (prevents over-funding)
6. On completion → product purchased by system, delivered to applicant
7. On failure → all contributions refunded

---

### PWA Configuration

**`manifest.json`:**
```json
{
  "name": "Vesna",
  "short_name": "Vesna",
  "description": "Things I actually recommend.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#0a0a0a",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Service worker strategy:**
- App shell: cache-first (layout, fonts, CSS, JS)
- API responses: network-first with stale-while-revalidate fallback
- Images: cache-first with size limit (max 50 entries, 30-day TTL)
- Offline page: custom offline.html shown when network unavailable

---

### Notification System

**Single notification engine — one trigger, multiple channel routing:**

```typescript
type NotificationTrigger = {
  userId: string
  type: NotificationType
  data: Record<string, unknown>
  urgency: 'critical' | 'standard' | 'informational'
}

// Critical: email + SMS + in-app + push
// Standard: preferred channel + in-app
// Informational: in-app only
```

**Channel providers:**
- Email: Brevo API
- SMS: Termii API (Nigerian numbers — better delivery than Twilio)
- In-app: Supabase Realtime
- Push: Web Push API via service worker

**Phase 2 notification events:**
- New follower
- Someone purchased via your curator pick
- New Spring post in your Bloom
- Your post got upvoted past threshold
- Vesnaian Fund campaign you contributed to succeeded
- New curator added by Victory (system-wide)
- Weekly Spring digest (email, Sunday evening)

---

### Phase 2 Checklist

- [ ] Next.js migration complete — all Phase 1 pages rebuilt as React components
- [ ] Supabase project created with all tables and RLS policies
- [ ] Authentication flow working (email, phone OTP, Google OAuth)
- [ ] Curator profiles live with personal URLs
- [ ] Spring community: at least 5 Blooms, post creation, comments, upvotes
- [ ] Following system working
- [ ] Curator certificate system working (manual issuance for Phase 2)
- [ ] Vesnaian Fund basic flow working
- [ ] PWA manifest and service worker live
- [ ] Push notification permission request working
- [ ] Email notifications working (Brevo)
- [ ] SMS notifications working (Termii)
- [ ] All Phase 1 SEO maintained through migration
- [ ] Lighthouse score maintained at 90+

---

## PERFORMANCE BUDGET

These are hard limits — if anything exceeds them, investigate before shipping:

| Metric | Budget |
|---|---|
| JavaScript bundle (initial load) | < 150KB gzipped |
| CSS bundle | < 30KB gzipped |
| Hero image | < 150KB WebP |
| Product card image | < 60KB WebP |
| Time to First Byte | < 200ms |
| Largest Contentful Paint | < 2.5s (mobile 4G) |
| Cumulative Layout Shift | < 0.1 |
| First Input Delay | < 100ms |

---

## SECURITY CHECKLIST

Applied throughout both phases:

- [ ] All API keys in environment variables — never in client code
- [ ] Security headers via `_headers` file (Phase 1) / Next.js headers config (Phase 2)
- [ ] All user inputs sanitized before database writes
- [ ] Parameterized queries only — no string concatenation in SQL
- [ ] CORS configured to allow only vesna.ng origin
- [ ] Rate limiting on all API routes
- [ ] Authentication required for all write operations
- [ ] RLS policies on all Supabase tables
- [ ] HTTPS enforced (Netlify/Vercel handles)
- [ ] No sensitive data in client-accessible storage (no localStorage for tokens)
- [ ] Content Security Policy header configured
- [ ] Dependency audit before each deployment (`npm audit`)
