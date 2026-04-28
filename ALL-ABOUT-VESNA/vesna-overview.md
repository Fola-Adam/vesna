# VESNA — OVERVIEW AND FULL EXPANSION PLAN

---

## WHAT VESNA IS

Vesna is a full-stack commerce and community ecosystem built for the Nigerian market with the architecture to scale beyond it. It is not a marketplace with community features bolted on. It is a platform built on one founding principle: **trust as infrastructure.**

At its center is Victory — a real person whose taste, standards, and judgment anchor everything the platform stands for. Around her: a curated affiliate discovery network, a digital and physical goods marketplace, a community layer, an AI intelligence system, and a financial operating system.

The name Vesna is Slavic for spring — the right resource at the right time changes everything, the same way spring changes everything after a long winter.

---

## THE PRODUCTS

| Product | What It Is |
|---|---|
| **Vesna** | The main platform — commerce, community, content |
| **Spring** | The community layer — Blooms, discussions, knowledge |
| **Venus** | The AI intelligence layer — conversational commerce |
| **Aide** | The AI assistant layer — serves Makers specifically |
| **Sprout** | The financial operating system — standalone and integrated |

---

## THE PARTICIPANTS

| Role | Who They Are |
|---|---|
| **Victory** | Founder and Editor-in-Chief — the platform anchor |
| **Curators** | Verified taste-makers who promote external affiliate products |
| **Makers** | Verified sellers who list and sell directly on Vesna |
| **Members** | Buyers, community participants, Spring contributors (Vesnaians) |
| **Moderators** | Trusted Members who govern Spring Blooms |

---

## THE BRAND

**Aesthetic:** Quiet luxury meets digital warmth. Dark editorial backgrounds, gold and forest green accents, warm off-white text.

**Typography:**
- Display: Caveat (Google Fonts) — cursive, warm, personal
- Labels/UI: Tenor Sans (Google Fonts) — small caps, elegant
- Body: DM Sans (Google Fonts) — light weight, readable

**Color System:**
```
--bg:           #0a0a0a    Primary background
--surface:      #141414    Card backgrounds
--surface-2:    #1c1c1c    Secondary surfaces
--border:       #242424    Subtle borders
--green:        #2d6a4f    Primary green accent
--green-light:  #40916c    Bright green emphasis
--gold:         #c9a84c    Primary gold accent
--gold-light:   #e2c06a    Hover state gold
--text:         #f0ebe0    Warm off-white
--muted:        #8a8480    Secondary text
```

---

## PHASE 1 — AFFILIATE SHOWCASE AND FOUNDATION
*The live product. Victory's curation platform.*

### What Exists at End of Phase 1

- Live site at vesna.ng
- Victory's curated affiliate product catalog
- Venus AI (Free tier — Groq/Gemini Flash, text only, product discovery)
- Email capture (Brevo)
- Affiliate click tracking
- SEO foundation (meta tags, sitemap, schema, Core Web Vitals)
- Google Analytics GA4, Search Console, Meta Pixel all connected
- Airtable CMS (Victory manages products without touching code)

### Pages
- Homepage (hero, featured picks, categories, about preview, trust bar)
- Products page (full catalog, filter by category)
- Product detail pages (clean URL slugs)
- Curator profile page (Victory's)
- About page

### Stack
- Vanilla HTML, CSS, JavaScript
- Netlify hosting and serverless functions
- Airtable (products, clicks tracking)
- Brevo (email)
- Anthropic API (Venus — Groq/Gemini Flash for free tier)

---

## PHASE 2 — COMMUNITY AND CURATORS
*Spring launches. Other curators join under Victory's umbrella.*

### What Gets Added

**Accounts and Profiles**
- User authentication (Supabase Auth — email, phone, Google OAuth)
- Buyer profiles
- Curator profiles with personal URLs (vesna.ng/curators/[name])
- Following system (Members follow Curators)
- Verification badge tiers (Email → Phone → Identity → Business → Vesna Verified)

**Spring Community**
- Blooms (sub-communities by topic)
- Post types: Review, Discussion, Experience, Question, Milestone, Collab
- Upvote/downvote, nested comments, saved posts
- Verified Purchase badge on reviews
- Trending surface on main Spring page
- Venus active in Spring (public data only — hard wall from private user data)
- Spring Challenges, Live Spaces (audio), AMAs
- Knowledge Base (elevated high-value community posts)
- Vesnaian Fund (community crowdfunding for product access)

**Curator Tools**
- Collections (themed product groups with editorial notes)
- Articles platform (editorial content with inline product cards)
- Recommendation Integrity Score
- Curator certificate and QR system for affiliate purchase verification
- Vision AI receipt verification for certificates
- Click-through analytics

**Content and SEO**
- Articles system with proper slugs and OG tags
- Spring posts as indexable pages
- Category guides and editorial content hub

### Stack Additions
- Supabase (full migration from Airtable for user data, community)
- Supabase Realtime (live comments, notifications)
- Supabase Storage (images, video uploads)
- PWA service worker and manifest
- pgvector extension (ready for Phase 3 semantic search)

---

## PHASE 3 — DIGITAL MARKETPLACE AND SPROUT
*Makers join. Vesna generates transaction revenue. Sprout launches.*

### What Gets Added

**Maker Onboarding**
- Maker application and KYC flow (BVN, bank account via Paystack identity API)
- Seller agreement with timestamped acceptance
- Product listing with admin approval queue
- Listing snapshot captured at purchase (immutable dispute evidence)
- Preview requirement (10% of digital content accessible before purchase)

**Digital Marketplace**
- Instant digital product delivery (secure time-limited access tokens)
- Paystack payment integration
- Platform fee deduction (8% New Maker → 6% Trusted → 4% Power → 3% Partner)
- Maker dashboard (sales, orders, wallet, performance metrics)
- Maker levels (New → Trusted → Power → Vesna Partner)

**Aide (AI Assistant for Makers)**
- Basic tier: FAQ responses, order status, offline acknowledgment
- Standard tier: Full customer attendance, escalation with context, abandoned cart recovery, review requests
- Pro tier: Sprout integration, proactive outreach, multilingual, analytics
- Transparent AI labeling in all buyer interactions
- Off-platform warning enforcement built in

**Venus Upgrade**
- Vector search via Supabase pgvector (semantic product discovery)
- Product embeddings generated on approval
- Venus Pro tier (Claude-powered, subscription)
- Full conversational capability with tool use

**Dispute System**
- 14-day window for digital products (30 days / 50% completion for courses)
- Mandatory 15–30 second video upload within 24 hours of access
- Structured dispute categories
- Vision AI first-pass review
- Human reviewer adjudication
- Seller 48-hour response window
- One appeal per party

**Sprout Core**
- Sales and expense tracking (voice input, quick-tap, manual)
- Receipt scanning (vision AI)
- Bank statement import (PDF parsing, auto-categorization)
- Offline mode with UUID-based sync conflict resolution
- Profit and loss, cash flow, basic reports
- Three view tiers: Simple, Visual, Professional
- Cashier Mode for staff
- Client and supplier management
- Vesna Maker integration (sales auto-populate)

### Stack Additions
- Paystack (payments, identity verification, transfers)
- OpenAI embeddings or similar (product vector embeddings)
- Video upload and compressed storage (30-day retention)
- Stripe (international payments consideration)

---

## PHASE 4 — PHYSICAL GOODS AND FULL FINANCIAL LAYER
*Escrow launches. Sprout expands. Vesnaian Fund goes full.*

### What Gets Added

**Physical Marketplace with Escrow**
- Full escrow flow (Paystack Transfer API)
- Seller wallet and bank withdrawal (Paystack disbursement)
- 72-hour buyer confirmation window (starts on active acknowledgment)
- Auto-release with pattern detection safeguards
- Dispute system extended to physical goods
- Seller KYC required before any disbursement
- Courier integration requirements (GIG, DHL, Sendbox)
- Returns policy enforcement

**Fraud Prevention**
- Rate limiting on delivery confirmations
- Device fingerprinting on confirmation actions
- Review pattern monitoring (fake review detection, rating bomb detection)
- Price manipulation detection
- Coordinated fake confirmation detection

**Sprout Expansion**
- Market intelligence feeds (FX rates, commodity prices, port alerts, customs updates)
- Personalized by business category (importers, exporters, agricultural, electronics)
- Morning brief (Venus-generated, daily, opt-in)
- Group saving / digital Ajo-Esusu (escrow-held, rotation-managed)
- Locked savings (willpower feature, 48-hour cooling period)
- Family savings (multiple contributors, shared visibility)
- Zero-Day Emergency Fund (separate vault, instant release for medical emergencies)
- Sprout Retire (10% Vesna contribution after 6 months consistency, funded by float income)
- Vesna Credit (buy now, pay in 2 instalments — verified Members only)
- Sales Advance (advance against future Maker payouts)

**Vesnaian Fund Full Version**
- Venus interview or human call for applications
- Community review in dedicated Spring Bloom
- 72-hour fundraising window
- Hard cap at exact product cost
- Optimistic locking deduplication
- Auto-refund if target not met
- Under-18 and elder-optimized flows
- Spring integration (success stories, dedicated Bloom)

**Vesna Score (Internal)**
- Components: purchase history, Sprout health, Spring standing, dispute history, verification tier
- Business Health Score (0–100, weekly, top 3 factors)
- Basis for Vesna Credit and Sales Advance decisions

**Voice and Accessibility**
- STT: Whisper API (Nigerian accent quality)
- TTS: ElevenLabs (natural voice)
- Multilingual: Yoruba, Igbo, Hausa (beta with English fallback)
- Elder-optimized flows (voice-first, slower pacing, family member option)
- Full WCAG 2.1 accessibility compliance

### Stack Additions
- Termii (Nigerian SMS — better delivery than Twilio)
- ElevenLabs API (TTS)
- OpenAI Whisper API (STT)
- WhatsApp Business API (Twilio) — order notifications

---

## PHASE 5 — SCALE AND INFRASTRUCTURE
*Vesna Score goes portable. Sprout Retire launches. Vesna Card.*

### What Gets Added

**Vesna Score (Portable)**
- User-initiated sharing only — explicit consent per recipient
- Score + category breakdown (not raw data)
- Shareable with banks, suppliers, other platforms
- Portable PDF export (verified, timestamped)
- NDPR compliant (right to access, correction, deletion)
- CBN engagement for alternative credit data positioning

**Sprout Retire (Full Launch)**
- Only after funding model stress-tested at projected scale
- Reserve fund: 6 months of projected contributions maintained
- Licensed fund manager or microfinance bank partner holds funds
- Dynamic projection chart
- Milestone celebrations

**Vesna Card**
- Branded debit card via microfinance bank partner
- Sprout wallet connected
- 1–2% cashback on Vesna purchases credited to savings
- Every purchase auto-categorized in Sprout

**Vesna for Schools**
- Education institution accounts
- Bulk purchasing for students
- Curriculum integration
- Sprout as financial literacy teaching tool

**Vesna for Teams**
- Business accounts
- Multi-user with role permissions
- Department budgets
- Approval workflows
- Consolidated invoicing

**Advanced Analytics**
- Full BI dashboard for Victory
- GMV, take rate, DAU/WAU/MAU, conversion, AOV
- Seller and curator performance deep-dives
- Venus usage analytics (conversation patterns, failure modes)
- Cohort analysis and retention tracking

### Stack Additions
- Microfinance bank partnership API (Vesna Card)
- BI tooling (custom dashboard or Metabase)
- Advanced fraud ML models

---

## PHASE 6 — EXPANSION
*Vesna Live. Open API. International.*

### What Gets Added

**Vesna Live**
- Live video commerce (Daily.co or Agora infrastructure)
- Restricted to Verified Makers and Curators only
- Pre-registered sessions reviewed before approval
- Real-time moderation (automated + human)
- Products sidebar (clickable product cards during live stream)
- All streams recorded and retained 30 days

**Vesna Escrow API**
- Infrastructure-as-a-service for external platforms
- Two-party transaction protection for off-platform deals
- Both parties declare transaction nature
- Prohibited categories enforced
- Small percentage fee per transaction

**Vesna API (Open)**
- Limited API for external developers
- Product catalog access
- Trust infrastructure access
- Rate-limited, authenticated, documented

**International Expansion**
- Multi-currency (Naira primary, USD secondary)
- Multi-language expansion beyond initial three
- Cross-border shipping framework
- International seller onboarding

**Pop-Up Markets**
- Quarterly physical markets (Lagos → Abuja → Port Harcourt)
- QR-coded products linking to Vesna listings
- Curator presence for IRL audience building
- Brand sponsorship offsets cost

---

## MONETIZATION MODEL

| Revenue Stream | Phase |
|---|---|
| Platform fees on marketplace sales (5–8%, reduces with Maker level) | 3 |
| Venus Pro subscription | 3 |
| Aide Standard and Pro subscriptions | 3 |
| Vesna Pass buyer subscription | 3 |
| Featured listing placements | 3 |
| Curator brand partnership matchmaking fee | 3 |
| Vesna Verified badge (external credibility certification) | 4 |
| Vesna Credit interest on late payments | 4 |
| Sprout premium analytics tier | 4 |
| Vesna Score API access for banks and partners | 5 |
| Vesna Card interchange fees | 5 |
| Vesna Escrow API transaction fees | 6 |
| Vesna API developer tier | 6 |

---

## LEGAL AND COMPLIANCE

**Documents Required Before Phase 3 Launch:**
- Terms of Service (general — all users)
- Seller/Maker Agreement (with permanent fraud clause, no time limit)
- Curator Agreement
- Privacy Policy (NDPR compliant)
- Cookie Policy
- Returns and Refunds Policy
- Dispute Resolution Policy
- Prohibited Items Policy
- Community Guidelines
- Affiliate Disclosure Policy
- Intellectual Property Policy

**Legal Structure:**
- Escrow structured through licensed PSP (Paystack/Flutterwave) to avoid CBN licensing requirement
- Platform liability limited to escrow amount held at time of dispute
- Seller fraud cases not bound by 72-hour dispute window
- Evidence retained permanently for fraud cases
- KYC records retained per regulatory requirement

---

## KEY CONFLICTS AND RESOLUTIONS

| Conflict | Resolution |
|---|---|
| Victory as bottleneck at scale | Delegation framework with documented standards from Phase 1 |
| Curator independence vs platform liability | Recommendation Integrity Score + accountability tiers |
| Overlapping financial assistance products | Single entry point, combined exposure limit, Venus routing |
| Spring authenticity vs commerce revenue | Published editorial independence policy — non-negotiable |
| Venus free vs Pro capability gap | Capability difference in depth not basic quality |
| Certificate verification reliability | Vision AI + pattern detection + high consequence for fraud |
| Vesna Score vs privacy | User-initiated sharing only, score not raw data |
| Retirement 10% sustainability | Float income model, per-user cap, reserve fund, stress-tested before launch |
| Vesna Live moderation | Phase 6 only, restricted access, pre-registration, real-time human moderator |
| Multi-product complexity vs user clarity | Four tabs max, progressive disclosure, simplicity at surface |
