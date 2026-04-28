# VESNA — TECHNICAL BUILD: PHASE 3 AND 4

---

## PHASE 3 TECHNICAL IMPLEMENTATION

### Prerequisites from Phase 2
- Next.js fully operational
- Supabase with all Phase 2 tables and RLS
- Authentication working across all tiers
- Spring community live with real users
- pgvector extension enabled and ready

---

### Paystack Integration

Paystack is the payment backbone for all Phase 3 commerce.

**Accounts and keys:**
- Paystack business account (registered to the company — not personal)
- Test keys for development, live keys for production
- Webhook secret for verifying Paystack-originated events
- All keys in environment variables

**Environment variables:**
```
PAYSTACK_SECRET_KEY
PAYSTACK_PUBLIC_KEY
PAYSTACK_WEBHOOK_SECRET
```

**Core Paystack operations in Phase 3:**

1. **Initialize transaction** — create a payment link for a digital product purchase
2. **Verify transaction** — confirm payment was successful before granting access
3. **Identity verification** — verify seller BVN and bank account during KYC
4. **Bank account validation** — confirm seller's account number before wallet creation

**Webhook handler (`/api/webhooks/paystack.ts`):**
```typescript
// 1. Verify signature using PAYSTACK_WEBHOOK_SECRET
// 2. Parse event type
// 3. Route to appropriate handler:
//    - charge.success → grant product access, create order
//    - transfer.success → update wallet balance
//    - transfer.failed → notify seller, flag for review
// 4. Always return 200 quickly — process async if needed
// 5. Log all webhook events for audit trail
```

Security note: Never trust a payment is complete without verifying via webhook or server-side verification call. Client-side success callbacks can be manipulated.

---

### Digital Product Delivery

When a buyer purchases a digital product, they need secure, time-limited access.

**Access token flow:**
1. Paystack webhook confirms `charge.success`
2. Server generates a signed JWT access token:
   - `productId`
   - `buyerId`
   - `orderId`
   - `expiresAt` (7 days for most products, 365 days for courses)
3. Token stored in `product_access` table
4. Email sent to buyer with access link
5. Buyer clicks link → token verified → access granted

**`product_access` table:**
```sql
id              uuid primary key default gen_random_uuid()
order_id        uuid references orders(id)
buyer_id        uuid references profiles(id)
product_id      text  -- Airtable product ID
access_token    text unique
expires_at      timestamptz
accessed_at     timestamptz
revoked         boolean default false
created_at      timestamptz default now()
```

**Download endpoint (`/api/products/[id]/access`):**
- Verify access token (not expired, not revoked, belongs to requesting user)
- Increment access count
- Return signed Supabase Storage URL (time-limited, 1 hour)
- Log access for seller analytics

---

### Maker Onboarding and KYC

**Onboarding flow steps:**

1. **Application** — shop name, what they sell, category, social proof
2. **Agreement** — Seller Agreement displayed, timestamped acceptance recorded
3. **KYC** — BVN verification via Paystack Identity API
4. **Bank account** — account number + bank code validated via Paystack
5. **Review** — admin reviews application (Victory or delegated moderator)
6. **Approval** — status set to approved, first product listing unlocked

**`makers` table:**
```sql
id                  uuid primary key default gen_random_uuid()
user_id             uuid references profiles(id)
shop_name           text unique
shop_slug           text unique
description         text
category            text
bvn_verified        boolean default false
bank_account_name   text
bank_account_number text
bank_code           text
paystack_recipient_code text  -- for transfers
kyc_completed_at    timestamptz
agreement_accepted_at timestamptz
agreement_version   text
status              text check (status in
                    ('pending','approved','suspended','banned'))
level               text check (level in
                    ('new','trusted','power','partner'))
platform_fee_rate   decimal default 0.08
fulfillment_rate    decimal
review_score        decimal
dispute_rate        decimal
response_time_hours decimal
created_at          timestamptz default now()
```

**`products` table (Supabase — mirrors Airtable for marketplace products):**
```sql
id                  uuid primary key default gen_random_uuid()
maker_id            uuid references makers(id)
name                text
slug                text unique
description         text
why_recommended     text
price               integer  -- in kobo (smallest unit)
sale_price          integer
category            text
product_type        text check (type in ('digital','physical'))
status              text check (status in
                    ('draft','pending_review','approved','rejected','archived'))
featured            boolean default false
preview_url         text
delivery_url        text  -- for digital products
listing_snapshot    jsonb  -- immutable copy at time of first purchase
embedding           vector(1536)  -- for semantic search
rejection_reason    text
approved_at         timestamptz
created_at          timestamptz default now()
updated_at          timestamptz default now()
```

**Product approval queue:**
- New product submitted → status: `pending_review`
- AI legitimacy check runs (image reverse search, description originality, price plausibility)
- AI flags attached to record as JSON
- Admin reviews queue (Victory or delegated reviewer)
- Approved → `listing_snapshot` captured as immutable JSONB, status: `approved`
- Rejected → reason stored, Maker notified with specific reason

---

### Vector Search Implementation

**Product embedding pipeline:**

1. Product approved by admin
2. Edge function triggered (`embed-product`)
3. Build embedding text: `"${name} ${description} ${category} ${why_recommended}"`
4. Call OpenAI embeddings API (`text-embedding-3-small` — cheap and sufficient)
5. Store 1536-dimension vector in `products.embedding` column

**Semantic search query:**
```sql
select
  id, name, description, price, category,
  1 - (embedding <=> $1::vector) as similarity
from products
where status = 'approved'
order by similarity desc
limit 10;
```

`$1` is the query embedding generated from the user's Venus message.

**Venus search tool (Phase 3):**
```typescript
// Tool: search_products
// Input: { query: string, filters?: { category?, maxPrice?, minPrice? } }
// 1. Generate embedding for query
// 2. Run similarity search
// 3. Apply any filters
// 4. Return top 5-10 products with full details
```

---

### Dispute System

**`orders` table:**
```sql
id                  uuid primary key default gen_random_uuid()
buyer_id            uuid references profiles(id)
maker_id            uuid references makers(id)
product_id          uuid references products(id)
product_snapshot    jsonb  -- copy of listing_snapshot at purchase time
amount              integer  -- in kobo
platform_fee        integer
maker_payout        integer
status              text check (status in
                    ('pending','paid','delivered',
                     'confirmed','disputed','refunded','completed'))
verification_video_url  text
verification_video_uploaded_at timestamptz
escrow_release_at   timestamptz  -- for physical goods
created_at          timestamptz default now()
updated_at          timestamptz default now()
```

**`disputes` table:**
```sql
id                  uuid primary key default gen_random_uuid()
order_id            uuid references orders(id)
raised_by           uuid references profiles(id)
category            text check (category in
                    ('misdescription','missing_content',
                     'non_functional','content_quality',
                     'duplicate_stolen','inaccessible'))
description         text
evidence_urls       text[]
buyer_evidence      jsonb
seller_response     jsonb
status              text check (status in
                    ('open','seller_responded',
                     'under_review','resolved','appealed'))
resolution          text check (resolution in
                    ('full_refund','partial_refund',
                     'rejected','escalated'))
resolution_notes    text
resolved_by         uuid references profiles(id)
resolved_at         timestamptz
created_at          timestamptz default now()
```

**Dispute window logic:**
```typescript
function isWithinDisputeWindow(order: Order): boolean {
  const daysSincePurchase = differenceInDays(new Date(), order.created_at)

  if (order.product_type === 'course') {
    // 30 days OR until 50% completion — whichever comes first
    const completionRate = getCompletionRate(order.id)
    return daysSincePurchase <= 30 && completionRate < 0.5
  }

  // All other digital products: 14 days
  return daysSincePurchase <= 14
}
```

**Fraud cases (not bound by dispute window):**
These bypass the standard dispute flow entirely and go directly to Victory:
- Counterfeit products
- Plagiarized digital content
- KYC identity fraud
- Coordinated fake confirmation ring
- Pattern of fraud across multiple orders
- Prohibited item listing

---

### Maker Wallet System

**`maker_wallets` table:**
```sql
id                  uuid primary key default gen_random_uuid()
maker_id            uuid references makers(id)
available_balance   integer default 0  -- in kobo, ready for withdrawal
pending_balance     integer default 0  -- in escrow or dispute hold
lifetime_earned     integer default 0
created_at          timestamptz default now()
updated_at          timestamptz default now()
```

**`wallet_transactions` table:**
```sql
id                  uuid primary key default gen_random_uuid()
wallet_id           uuid references maker_wallets(id)
type                text check (type in
                    ('credit','debit','hold','release','refund','advance_repayment'))
amount              integer  -- in kobo
reference           text unique
description         text
order_id            uuid references orders(id)
created_at          timestamptz default now()
```

**Payout flow:**
1. Maker requests withdrawal (minimum ₦2,000)
2. Validate: available_balance >= requested amount
3. Check: no active fraud flags on account
4. Initiate Paystack Transfer to stored recipient code
5. Record debit transaction
6. Webhook confirms transfer success → mark complete
7. Webhook reports transfer failure → return to available balance, notify Maker

---

### Aide Implementation

Aide is Venus's sibling but serves Makers, not buyers. Separate context, separate tools, same underlying infrastructure.

**Aide tools (Phase 3 Standard tier):**
```typescript
// get_shop_products — fetch Maker's own products
// get_recent_orders — last N orders with status
// get_conversation_history — previous chats with this buyer
// send_message — reply to buyer (logs to conversation)
// flag_for_escalation — notify Maker immediately
// add_to_faq — save Q&A to shop FAQ database
```

**Escalation triggers (automatic):**
```typescript
const escalationTriggers = [
  // Sentiment
  (msg: string) => containsNegativeSentiment(msg, threshold: 0.7),
  // Dispute keywords
  (msg: string) => /dispute|refund|broken|wrong|missing|fake/i.test(msg),
  // Negotiation
  (msg: string) => /discount|cheaper|negotiate|best price/i.test(msg),
  // Human request
  (msg: string) => /real person|speak to|talk to|owner/i.test(msg),
  // High-value inquiry
  (msg: string, shop: Shop) => extractOrderValue(msg) > shop.escalation_threshold,
  // Aide uncertainty
  (confidence: number) => confidence < 0.6
]
```

**`aide_conversations` table:**
```sql
id              uuid primary key default gen_random_uuid()
shop_id         uuid references makers(id)
buyer_id        uuid references profiles(id)
messages        jsonb[]
escalated       boolean default false
escalated_at    timestamptz
resolved        boolean default false
created_at      timestamptz default now()
updated_at      timestamptz default now()
```

---

### Venus Pro (Phase 3)

**Tier differentiation:**

| Capability | Venus Free | Venus Pro |
|---|---|---|
| Product discovery | ✓ (Groq/Gemini Flash) | ✓ (Claude) |
| Navigation | Basic | Full (SBS, cart actions) |
| Voice (STT/TTS) | — | ✓ |
| Multilingual | — | ✓ (Phase 4) |
| Personalization | — | Purchase history, loyalty |
| Spring synthesis | — | ✓ |
| Morning Brief | — | ✓ |
| Daily conversations | 10 | Unlimited |
| Response speed | Standard | Priority |

**Venus Pro subscription:**
- ₦1,500–₦2,500/month (exact price TBD)
- Managed via Paystack subscription API
- Stored in `subscriptions` table with tier and status
- Checked on every Venus API call

**SBS (Side-by-Side) module:**
Triggered when Venus calls `open_comparison_view(productIds: string[])` tool.
- Opens a dedicated comparison panel
- Products displayed with identical information architecture
- Venus minimizes to a strip at bottom
- User can swap products in/out via Venus conversation
- Venus stays context-aware of what's being compared

---

### Sprout Core Implementation

Sprout is a separate Next.js application sharing the Supabase instance. It can be deployed at `sprout.vesna.ng` or embedded as a section within the Vesna app for Makers.

**`sprout_transactions` table:**
```sql
id              uuid primary key default gen_random_uuid()
user_id         uuid references profiles(id)
type            text check (type in ('sale','expense','transfer'))
amount          integer  -- in kobo
currency        text default 'NGN'
category        text
description     text
payment_method  text
client_id       uuid references sprout_clients(id)
supplier_id     uuid references sprout_suppliers(id)
receipt_url     text
is_recurring    boolean default false
recurring_id    uuid
offline_id      text unique  -- UUID generated client-side for sync dedup
synced_at       timestamptz
created_at      timestamptz default now()
```

**Offline sync with UUID deduplication:**
```typescript
// Client generates UUID when transaction recorded offline
// On sync: INSERT ... ON CONFLICT (offline_id) DO NOTHING
// This prevents duplicate entries from failed syncs
```

**Business Health Score calculation:**
```typescript
function calculateHealthScore(userId: string): number {
  const metrics = {
    profitMarginTrend: getProfitMarginTrend(userId),      // weight: 0.25
    cashFlowStability: getCashFlowStability(userId),        // weight: 0.20
    expenseControl: getExpenseControl(userId),              // weight: 0.20
    debtLevel: getDebtLevel(userId),                        // weight: 0.15
    savingsRate: getSavingsRate(userId),                    // weight: 0.10
    invoicePaymentRate: getInvoicePaymentRate(userId),      // weight: 0.10
  }
  // Returns 0-100
}
```

---

## PHASE 4 TECHNICAL IMPLEMENTATION

### Physical Goods Escrow

**The escrow flow (detailed):**

```
Buyer pays
    ↓
Paystack captures payment to Vesna account
    ↓
Order status: 'paid' — funds in Vesna wallet
    ↓
Seller ships → provides courier + tracking number
    ↓
Order status: 'shipped'
    ↓
Buyer receives notification: "Confirm receipt within 72 hours"
    ↓
BUYER ACTION REQUIRED (window starts on acknowledgment, not delivery)
    ↓
[Path A] Buyer confirms receipt and quality
    → Order status: 'confirmed'
    → Release timer: funds release to Maker wallet in 24 hours
    → Platform fee deducted automatically
    ↓
[Path B] Buyer raises dispute within window
    → Funds frozen
    → Dispute flow begins
    ↓
[Path C] Window expires without buyer action (72 hours after acknowledgment)
    → Fraud pattern check runs
    → If clean: auto-release to Maker wallet
    → If suspicious: flag for human review before release
```

**Escrow release function (runs as scheduled Edge Function):**
```typescript
async function processEscrowReleases() {
  // Find orders where:
  // status = 'confirmed' AND release_at < now()
  // OR acknowledgment_at + 72 hours < now() AND status = 'delivered'

  for (const order of eligibleOrders) {
    // Run fraud checks
    const isFraudSuspicious = await checkFraudPatterns(order)

    if (isFraudSuspicious) {
      await flagForReview(order)
      continue
    }

    // Calculate amounts
    const platformFee = order.amount * order.maker.platform_fee_rate
    const makerPayout = order.amount - platformFee

    // Credit Maker wallet
    await creditWallet(order.maker_id, makerPayout)

    // Update order status
    await updateOrderStatus(order.id, 'completed')

    // Notify Maker
    await notify(order.maker_id, 'payment_released', { amount: makerPayout })
  }
}
```

**Fraud pattern checks:**
```typescript
async function checkFraudPatterns(order: Order): Promise<boolean> {
  const checks = await Promise.all([
    // Same device confirming multiple orders rapidly
    checkDeviceConfirmationVelocity(order.buyer_id),
    // Buyer's dispute-to-purchase ratio
    checkBuyerDisputeRate(order.buyer_id),
    // IP address associated with known fraud
    checkIPReputation(order.buyer_ip),
    // Seller's fraud flag history
    checkSellerFraudHistory(order.maker_id),
  ])

  return checks.some(Boolean)
}
```

---

### Sprout Market Intelligence

**Intelligence feed architecture:**

External data sources (fetched via Edge Functions on schedule):

```typescript
const intelligenceSources = {
  fx_rates: {
    provider: 'CBN API or Wise API',
    currencies: ['USD', 'GBP', 'EUR', 'CNY', 'AED'],
    schedule: 'every 6 hours',
    table: 'market_intelligence_fx'
  },
  commodity_prices: {
    provider: 'AFEX API or manual aggregation',
    commodities: ['cocoa', 'sesame', 'cashew', 'palm_oil', 'rice', 'beans'],
    schedule: 'daily at 7am',
    table: 'market_intelligence_commodities'
  },
  port_alerts: {
    provider: 'NPA (Nigerian Ports Authority) feed or manual curation',
    ports: ['Apapa', 'Tin Can', 'Onne'],
    schedule: 'daily',
    table: 'market_intelligence_alerts'
  },
  fuel_prices: {
    provider: 'NNPC or aggregated manual',
    schedule: 'daily',
    table: 'market_intelligence_fuel'
  }
}
```

**User feed personalization:**
On onboarding, user selects business categories. Intelligence feed filtered to relevant categories only.

**Morning Brief generation:**
Daily Edge Function at 6:30am:
1. Fetch user's relevant intelligence from last 24 hours
2. Pass to Claude with brief prompt: "Generate a 3-bullet morning brief for a [category] business owner. Be specific and actionable. Max 60 words total."
3. Store generated brief in `morning_briefs` table
4. Send via preferred notification channel at user's configured time

---

### Voice Features (Phase 4)

**STT (Speech to Text):**
- Web Speech API for basic (free, Chrome/Edge support)
- OpenAI Whisper API for quality (`whisper-1` model)
- $0.006 per minute — very cheap
- Whisper handles Nigerian accents significantly better than Web Speech API

**TTS (Text to Speech):**
- Web Speech API for basic (free, robotic)
- ElevenLabs API for natural voice
- Victory voice clone: Victory records 30–60 minutes of natural speech → ElevenLabs fine-tunes a voice model → Venus speaks in Victory's voice
- This is a Phase 4 premium feature — Venus Pro subscribers only

**Live voice call (Venus):**
Real-time audio conversation. This is the hardest feature technically.

Architecture:
```
User microphone → WebRTC audio capture
    ↓
Whisper streaming STT (transcribes as user speaks)
    ↓
Claude API (processes text, generates response)
    ↓
ElevenLabs streaming TTS (speaks response as text generates)
    ↓
User hears Venus responding
```

End-to-end latency target: under 2.5 seconds on good WiFi.
On Nigerian mobile networks: up to 4–5 seconds acceptable.

Rate limited to: 5 voice calls per day on Venus Pro.

**Multilingual implementation:**
```typescript
// Detect language from first user utterance
const detectedLanguage = await detectLanguage(userMessage)

// Supported: 'en', 'yo' (Yoruba), 'ig' (Igbo), 'ha' (Hausa)
// Fallback: 'en' if confidence < 0.7

// Pass language to Venus system prompt
// Pass language to ElevenLabs TTS (multilingual model)
// Whisper handles all four languages natively
```

---

### Vesnaian Fund — Technical Implementation

**`vesnaian_fund_applications` table:**
```sql
id                  uuid primary key default gen_random_uuid()
applicant_id        uuid references profiles(id)
product_name        text
product_url         text
product_cost        integer  -- in kobo
reason              text
additional_context  text
interview_transcript jsonb
verification_docs   text[]
status              text check (status in
                    ('draft','submitted','community_review',
                     'approved','fundraising','funded',
                     'product_purchased','completed','rejected'))
approved_by         uuid references profiles(id)
spring_post_id      uuid references spring_posts(id)
created_at          timestamptz default now()
```

**`vesnaian_fund_contributions` table:**
```sql
id                  uuid primary key default gen_random_uuid()
application_id      uuid references vesnaian_fund_applications(id)
contributor_id      uuid references profiles(id)
amount              integer  -- in kobo
payment_reference   text
status              text check (status in ('pending','confirmed','refunded'))
created_at          timestamptz default now()
```

**Deduplication and cap enforcement:**
```typescript
async function processContribution(
  applicationId: string,
  contributorId: string,
  amount: number
): Promise<'accepted' | 'over_cap' | 'duplicate'> {

  // Use database transaction with SELECT FOR UPDATE
  // to prevent race conditions
  return await db.transaction(async (tx) => {
    const application = await tx
      .selectFrom('vesnaian_fund_applications')
      .where('id', '=', applicationId)
      .forUpdate()  // Lock this row
      .executeTakeFirst()

    const currentTotal = await tx
      .selectFrom('vesnaian_fund_contributions')
      .where('application_id', '=', applicationId)
      .where('status', '=', 'confirmed')
      .sum('amount')
      .executeTakeFirst()

    if (currentTotal + amount > application.product_cost) {
      return 'over_cap'  // Refund in-transit payment
    }

    // Record contribution
    await tx.insertInto('vesnaian_fund_contributions')
      .values({ applicationId, contributorId, amount, status: 'confirmed' })
      .execute()

    return 'accepted'
  })
}
```

---

### Zero-Day Emergency Fund

**`sprout_emergency_funds` table:**
```sql
id              uuid primary key default gen_random_uuid()
user_id         uuid references profiles(id)
balance         integer default 0  -- in kobo
target          integer  -- user's goal
auto_save_rate  decimal  -- % of each recorded income
is_locked       boolean default true
unlock_requests jsonb[]  -- history of unlock attempts
created_at      timestamptz default now()
```

**Unlock flow:**
```typescript
async function requestEmergencyUnlock(
  userId: string,
  reason: 'medical' | 'business' | 'family' | 'natural_disaster',
  evidence?: string  // URL to uploaded evidence
) {
  if (reason === 'medical' && evidence) {
    // Instant release — no cooling period
    await releaseEmergencyFunds(userId)
    return { released: true, cooldown: false }
  }

  // All other reasons: 48-hour cooling period
  await scheduleRelease(userId, addHours(new Date(), 48))
  return { released: false, cooldown: true, releaseAt: addHours(new Date(), 48) }
}
```

---

### Sprout Retire

**Only launches after financial model validated.**

Pre-launch validation checklist:
- [ ] Float income model stress-tested at 10,000 users
- [ ] Float income model stress-tested at 100,000 users
- [ ] Platform fee allocation model validated
- [ ] Per-user cap (₦2,000/month Vesna contribution) modeled at scale
- [ ] Reserve fund (6 months projected contributions) established
- [ ] Licensed fund manager partnership signed
- [ ] Legal structure reviewed by Nigerian financial lawyer
- [ ] CBN informal guidance obtained

**`sprout_retirement_accounts` table:**
```sql
id                      uuid primary key default gen_random_uuid()
user_id                 uuid references profiles(id)
balance                 integer default 0  -- in kobo
vesna_contributions     integer default 0  -- total Vesna has contributed
qualification_started_at timestamptz  -- when streak began
qualified_at            timestamptz  -- when 6-month threshold met
streak_months           integer default 0
last_contribution_at    timestamptz
retirement_age          integer  -- user's target retirement age
monthly_target          integer  -- calculated target contribution
partner_account_ref     text  -- reference at licensed fund manager
created_at              timestamptz default now()
```

---

## PHASE 3 AND 4 PERFORMANCE CONSIDERATIONS

**Database indexing (critical at this scale):**
```sql
-- Products semantic search
create index on products using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Orders lookup
create index on orders (buyer_id, status, created_at desc);
create index on orders (maker_id, status, created_at desc);

-- Spring posts trending
create index on spring_posts (bloom, trending_score desc);

-- Wallet transactions
create index on wallet_transactions (wallet_id, created_at desc);

-- Dispute lookup
create index on disputes (order_id, status);
```

**Caching strategy:**
- Product listings: 5-minute edge cache (invalidated on approval/update)
- Maker dashboard stats: 1-minute cache (feels real-time, reduces DB load)
- Spring trending: 15-minute cache (acceptable staleness)
- Market intelligence: 6-hour cache per category
- User profiles: 5-minute SWR (stale-while-revalidate)

**Background jobs (Supabase Edge Functions on schedule):**
- `process-escrow-releases`: every 15 minutes
- `calculate-trending-scores`: every 15 minutes
- `send-morning-briefs`: 6:30am daily
- `fetch-market-intelligence`: various schedules per source
- `embed-new-products`: triggered on product approval
- `calculate-health-scores`: every Sunday midnight
- `send-weekly-digest`: Sunday evening
- `check-curator-inactivity`: daily

---

## SECURITY ADDITIONS IN PHASE 3 AND 4

**Payment security:**
- All payment amounts validated server-side — never trust client-submitted amounts
- Idempotency keys on all Paystack API calls (prevents duplicate charges)
- Webhook signature verified on every event
- Payment status only set by verified webhook — never by client callback

**KYC data handling:**
- BVN never stored in plaintext — hashed after verification
- Bank account numbers encrypted at rest
- KYC documents stored in encrypted Supabase Storage bucket
- Access to KYC data restricted to admin role only via RLS

**Escrow integrity:**
- All escrow operations in database transactions
- Wallet balance never goes negative (constraint enforced at DB level)
- Every balance change has an immutable audit record
- Auto-release process runs with idempotency — running twice never double-releases

**Fraud detection:**
- Device fingerprinting on delivery confirmations (FingerprintJS or similar)
- IP rate limiting on all write operations
- Anomaly detection on review submission patterns
- Seller account velocity checks (too many products too fast = flag)
