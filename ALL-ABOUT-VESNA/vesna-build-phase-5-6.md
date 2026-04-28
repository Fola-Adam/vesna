# VESNA — TECHNICAL BUILD: PHASE 5 AND 6

---

## PHASE 5 TECHNICAL IMPLEMENTATION

### Prerequisites from Phase 4
- Physical marketplace fully operational
- Escrow system battle-tested with real transactions
- Sprout live with real financial data
- Vesna Score internal model validated
- Dispute system has real resolution history
- Platform generating consistent revenue

---

### Vesna Score — Portable Implementation

The Vesna Score transitions from an internal risk assessment tool to a user-facing portable reputation asset.

**Score calculation engine:**

```typescript
interface VesnaScoreComponents {
  commerce: number        // Purchase history, fulfillment (if Maker), reviews
  financial: number       // Sprout health, repayment history, savings consistency
  community: number       // Spring contributions, quality signals, trust history
  identity: number        // Verification tier, account age, consistency
  dispute: number         // Dispute rate, dispute outcomes, fraud flags
}

function calculateVesnaScore(userId: string): number {
  const weights = {
    commerce:   0.30,
    financial:  0.25,
    community:  0.20,
    identity:   0.15,
    dispute:    0.10
  }

  const components = calculateComponents(userId)

  const rawScore = Object.entries(weights).reduce((total, [key, weight]) => {
    return total + (components[key] * weight)
  }, 0)

  // Scale to 0-850 (mirrors credit score range for familiarity)
  return Math.round(rawScore * 8.5)
}
```

**Score sharing system:**

```sql
-- vesna_score_shares table
id                  uuid primary key
user_id             uuid references profiles(id)
recipient_name      text  -- who the user shared with
recipient_type      text  -- 'bank', 'supplier', 'platform', 'individual'
share_token         text unique  -- time-limited token
score_snapshot      jsonb  -- score at time of sharing
components_snapshot jsonb  -- breakdown at time of sharing
expires_at          timestamptz
accessed_at         timestamptz
revoked             boolean default false
created_at          timestamptz default now()
```

**Public verification endpoint (`/api/score/verify/[token]`):**
- Validates token (not expired, not revoked)
- Returns: score, component breakdown, account holder name (if user consented to name sharing), verification date
- Does NOT return: transaction history, full profile, contact details
- Logs every verification access

**Portable PDF generation:**
- Triggered when user requests PDF export
- Generated server-side (no client-side PDF generation)
- Includes: score, components, verification QR code linking to verification endpoint, generation date, Vesna digital signature
- Stored temporarily in Supabase Storage (72 hours) → user downloads → deleted

---

### Vesna Card — Technical Architecture

The Vesna Card is a debit card issued through a licensed microfinance bank partner. Vesna is the interface and experience layer; the bank handles regulatory compliance and card issuance.

**Integration model:**
```
User requests Vesna Card
    ↓
Vesna sends KYC data to partner bank API
    ↓
Bank runs NIN/BVN verification
    ↓
Bank issues virtual card (instant) → physical card (7-14 days)
    ↓
Card linked to user's Sprout wallet
    ↓
Transactions flow: Card POS/ATM → Bank → Webhook to Vesna → Sprout auto-categorized
```

**`vesna_cards` table:**
```sql
id                  uuid primary key
user_id             uuid references profiles(id)
card_reference      text  -- partner bank's card ID (never store full card number)
card_last_four      text
card_type           text  -- 'virtual' or 'physical'
status              text  -- 'active', 'frozen', 'cancelled'
cashback_earned     integer default 0  -- in kobo
partner_bank        text
issued_at           timestamptz
created_at          timestamptz default now()
```

**Cashback processing:**
- Vesna platform purchases: 1–2% cashback credited to Sprout savings
- Cashback accrues in `cashback_pending` balance
- Credited to savings account monthly (batch process)

---

### Vesna for Schools

**School account type:**

```sql
-- school_accounts table
id                  uuid primary key
admin_user_id       uuid references profiles(id)
institution_name    text
institution_type    text  -- 'secondary', 'university', 'training'
cac_number          text
verified            boolean default false
student_count       integer
created_at          timestamptz default now()

-- school_members table
id                  uuid primary key
school_id           uuid references school_accounts(id)
user_id             uuid references profiles(id)
role                text  -- 'admin', 'procurement', 'finance', 'student'
added_at            timestamptz
```

**Bulk purchasing:**
- School account can create a bulk order (multiple products, multiple quantities)
- Products priced with institutional pricing tier (negotiated per product)
- Multi-approver checkout: procurement submits → finance approves → payment processes
- Consolidated invoice generation (PDF, monthly or per-order)

**Sprout curriculum integration:**
- Schools can embed Sprout as a financial literacy tool
- Student accounts linked to school account (view-only for school admin)
- Curriculum-aligned financial challenges and exercises
- Progress tracking for financial literacy modules

---

### Advanced Analytics and BI

**Platform-level metrics dashboard (Victory's admin view):**

```typescript
interface PlatformMetrics {
  // Volume
  gmv: number               // Gross Merchandise Value (total transaction value)
  takeRate: number          // Platform fees as % of GMV
  orderCount: number
  averageOrderValue: number

  // Users
  dau: number               // Daily Active Users
  wau: number               // Weekly Active Users
  mau: number               // Monthly Active Users
  newUsers: number
  retentionRate: number     // % who return after first visit

  // Commerce
  conversionRate: number    // Visitors who purchase
  cartAbandonmentRate: number
  topProducts: Product[]
  topCategories: Category[]

  // Community
  springPostsToday: number
  activeBloomsCount: number
  vesnaianFundSuccessRate: number

  // Health
  disputeRate: number
  chargebackRate: number
  makerFulfillmentRate: number
  averageDisputeResolutionTime: number
}
```

**Cohort analysis:**
- Group users by signup week
- Track: first purchase rate, 30-day retention, 90-day retention, LTV
- Visualized as cohort table (week vs retention week)

**Venus analytics:**
- Conversation count per day
- Average messages per conversation
- Most common search queries (product discovery intelligence)
- Failure rate (conversations where Venus couldn't find what user needed)
- Free vs Pro conversion from Venus interactions

---

## PHASE 6 TECHNICAL IMPLEMENTATION

### Vesna Live

**Infrastructure choice:** Daily.co or Agora.io for WebRTC infrastructure.

Both provide:
- Global TURN/STUN servers (handles Nigerian network conditions)
- Recording (for 30-day retention requirement)
- Participant management
- Low-latency video (< 500ms target)

**Live session flow:**

```typescript
// Pre-session (24 hours before)
// 1. Host submits session details (title, products to feature, scheduled time)
// 2. Admin reviews and approves
// 3. Session listed in Vesna Live schedule
// 4. Followers notified

// At session start
// 1. Host joins → Daily.co room created
// 2. Viewers join as observers (no camera/mic)
// 3. Product sidebar populated with host's featured products
// 4. Live chat enabled (moderated)
// 5. Recording starts automatically

// During session
// - Real-time viewer count
// - Product card interactions tracked
// - Chat moderation (Venus automated + human flagging)
// - Host can add/remove products from sidebar

// Session end
// 1. Recording stops and uploads to Supabase Storage
// 2. Session archived with product interaction analytics
// 3. VOD available for 30 days
// 4. Analytics report generated for host
```

**`live_sessions` table:**
```sql
id                  uuid primary key
host_id             uuid references profiles(id)
title               text
status              text  -- 'scheduled','live','ended','archived'
scheduled_at        timestamptz
started_at          timestamptz
ended_at            timestamptz
peak_viewers        integer default 0
total_viewers       integer default 0
featured_products   text[]  -- product IDs
recording_url       text
recording_expires_at timestamptz
approved_by         uuid references profiles(id)
created_at          timestamptz default now()
```

**Content moderation during live:**
```typescript
// Automated: keyword detection on chat messages
// Automated: nudity/violence detection on video frames (ML model, sampled every 30s)
// Human: moderator assigned to every session > 100 viewers
// Reporting: viewers can flag session → moderator notified within 60 seconds
// Nuclear option: Victory/admin can terminate session instantly
```

---

### Vesna Escrow API

**API design:**

```
POST /api/v1/escrow/transactions
Authorization: Bearer {api_key}
{
  "buyer_reference": "string",      // external buyer ID
  "seller_reference": "string",     // external seller ID
  "amount": 50000,                  // in kobo
  "currency": "NGN",
  "description": "string",
  "transaction_type": "goods|services",
  "release_conditions": {
    "type": "manual|timed|webhook",
    "release_after_hours": 72,      // for timed
    "webhook_url": "string"         // for webhook-triggered release
  }
}

Response:
{
  "transaction_id": "string",
  "payment_link": "string",        // buyer pays here
  "status": "pending_payment"
}
```

**API key management:**
- External developers register at `developers.vesna.ng`
- API keys scoped to environment (test/live)
- Rate limited by tier
- Usage tracked for billing
- Webhook events sent to developer's registered endpoint

**Revenue model:**
- 1.5% per transaction via Vesna Escrow API
- Monthly billing to developer accounts

---

### Vesna Open API

**API versioning strategy:** URL versioning (`/api/v1/`, `/api/v2/`)

**Available endpoints (v1):**

```
GET  /api/v1/products              List active products (paginated)
GET  /api/v1/products/{slug}       Single product details
GET  /api/v1/curators              List verified curators
GET  /api/v1/curators/{slug}       Curator profile and picks
GET  /api/v1/categories            Product categories with counts
GET  /api/v1/spring/posts          Public Spring posts (paginated)
GET  /api/v1/search                Semantic product search
```

**Authentication:**
- API key in `Authorization: Bearer {key}` header
- Keys created at developer portal
- Free tier: 1,000 requests/day
- Paid tier: 50,000 requests/day

**Developer portal (`developers.vesna.ng`):**
- API key management
- Usage analytics
- Documentation (auto-generated from OpenAPI spec)
- Changelog
- Sandbox environment

---

### International Expansion

**Multi-currency architecture:**

```typescript
// All amounts stored in smallest unit of local currency
// NGN: kobo (1 NGN = 100 kobo)
// USD: cents
// GBP: pence

interface Money {
  amount: number    // in smallest unit
  currency: string  // ISO 4217 code
}

// Display conversion uses CBN rate for NGN, live rate for others
// Rate fetched every 6 hours, cached
// Timestamp shown on all converted prices
```

**Multi-language implementation:**

Next.js i18n routing:
```
/en/products/[slug]  → English
/yo/products/[slug]  → Yoruba
/ig/products/[slug]  → Igbo
/ha/products/[slug]  → Hausa
```

Translation files structured as JSON:
```json
{
  "hero.title": "Things I actually recommend.",
  "hero.subtitle": "Handpicked courses, tools, and products.",
  "products.filter.all": "All",
  ...
}
```

Machine translation for initial launch (Google Translate API) with community correction layer — verified speakers of each language can flag and correct translations via a dedicated Spring Bloom.

---

### Pop-Up Market Infrastructure

This is more operations than engineering, but the digital layer matters.

**QR code generation for physical products:**
- Each product gets a unique QR code printed for the pop-up
- QR links to: `vesna.ng/products/[slug]?ref=popup`
- `ref=popup` tracked in analytics as a source
- Enables: "scan to buy online later", "scan for product details", post-event online orders from in-person discovery

**Event-specific landing pages:**
- `vesna.ng/events/[event-slug]`
- Shows: event details, featured vendors, products available at the event, post-event order form
- SEO optimized for "Vesna Lagos pop-up" etc.

**Check-in and attendance:**
- QR codes for event attendance (optional — for partnerships requiring headcount)
- Feeds into analytics: how many in-person attendees converted to online users

---

## INFRASTRUCTURE SCALING

By Phase 5/6, Vesna has real traffic. The infrastructure must match.

**Database scaling:**
- Supabase Pro or higher (or self-hosted Supabase on dedicated Postgres)
- Read replicas for analytics queries (don't run heavy reports on primary)
- Connection pooling (PgBouncer — Supabase includes this)
- Partitioning on high-volume tables (`wallet_transactions`, `spring_posts`, `clicks`)

**CDN and edge:**
- Vercel Edge Network for Next.js (already included)
- Cloudinary or similar for image transformation and delivery
- Edge caching for product listings, Spring feed

**Observability stack:**
- Sentry for error tracking (frontend and backend)
- Vercel Analytics for performance
- Custom metrics dashboard (built on Supabase + Grafana or Metabase)
- Uptime monitoring (Better Uptime or similar)
- Alert channels: Victory's WhatsApp + engineering team

**Backup and recovery:**
- Supabase automated daily backups (point-in-time recovery)
- Tested recovery procedure documented — run a recovery drill before Phase 5 launch
- Critical data (KYC, financial records) backed up to separate storage

**Dependency risk mitigation:**
| Dependency | Risk | Mitigation |
|---|---|---|
| Supabase | Downtime or pricing change | Self-hosted Supabase option prepared |
| Paystack | API changes | Abstraction layer so provider can be swapped |
| Anthropic API | Pricing or availability | Venus Free uses Groq/Gemini (no Anthropic dependency) |
| Netlify/Vercel | Pricing change | Dockerfile prepared for self-hosted deployment |
| Airtable | API changes | Phase 3 reduces Airtable dependency significantly |
| ElevenLabs | Service change | Voice clone portable — can switch provider |
| Google Fonts | Unlikely but possible | Fonts self-hosted as backup |

---

## THE FULL TECHNICAL STACK — CONSOLIDATED

| Layer | Phase 1–2 | Phase 3–4 | Phase 5–6 |
|---|---|---|---|
| Frontend | Vanilla HTML/CSS/JS → Next.js | Next.js + TypeScript | Next.js + TypeScript |
| Styling | CSS custom properties | CSS + Tailwind (optional) | CSS + Tailwind |
| State | Vanilla JS | Zustand or Jotai | Zustand |
| Database | Airtable (CMS) | Supabase (Postgres) | Supabase + read replicas |
| Auth | None → Supabase Auth | Supabase Auth | Supabase Auth + SSO |
| Real-time | None | Supabase Realtime | Supabase Realtime |
| Storage | Airtable | Supabase Storage + CDN | Supabase Storage + Cloudinary |
| AI | Anthropic API (Haiku) | Anthropic API (Sonnet) + Groq | Anthropic API (Opus) + custom models |
| Embeddings | None | OpenAI text-embedding-3-small | OpenAI + custom fine-tuned |
| Payments | None | Paystack | Paystack + Stripe (international) |
| Email | Brevo | Brevo | Brevo + SendGrid (scale) |
| SMS | None | Termii | Termii |
| Voice (STT) | None | Whisper API | Whisper API |
| Voice (TTS) | None | ElevenLabs | ElevenLabs + Victory voice clone |
| Live video | None | None | Daily.co or Agora |
| Hosting | Netlify | Vercel | Vercel + edge functions |
| Monitoring | None | Sentry | Sentry + custom dashboard |
| CI/CD | GitHub + Netlify | GitHub Actions + Vercel | GitHub Actions + Vercel |
