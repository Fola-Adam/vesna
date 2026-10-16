# Venus Guided Discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Ask useful clarifications, remember answers, and retrieve bounded relevant products without sending the full catalog to Venus.
**Architecture:** A validated JSON planner updates task state before indexed Supabase retrieval. Candidate summaries are capped at 12, detail reads at 8, and recommendations default to 3; current database facts validate selections and prices.
**Tech Stack:** Next.js, Groq JSON mode, Supabase Postgres full-text search, current React chat.
**Spec:** docs/superpowers/specs/2026-10-16-venus-guided-discovery-design.md

## Global Constraints

- ves-na PR2 preview only; shared production catalog, additive compatible migrations.
- No autonomous catalog edits, provider change, request-time embedding download or membership bypass.
- Semantic retrieval disabled pending verified freshness and runtime.
- Explicit proposal eligibility; pending questions and invalidated proposals cannot authorize saves.
- One 24-second request deadline; planner max 6 seconds, recommendation max 12 seconds; one revision maximum.

## Review Focus

- A yes after clarification never saves an old offer (Task1/3).
- Failure during refinement cannot leave a save button active (Task3).
- Active archive or inactive admin-visible rows never enter results (Task2).
- Natural budget answers retain currency and total semantics (Task1).
- Empty search versus unavailable database produce distinct outcomes (Task2/3).

## Tasks

### Task 1: Guided state and planner contract
Files: lib/venus-discovery.ts, lib/venus-task.ts, tests/unit/venus-discovery.test.mjs.
Produces: validated DiscoveryPlan/DiscoveryBrief, pending question and proposal status; patch-based state merging, candidate query terms.
- [ ] Write failing tests for short-answer merge, natural USD budget, pending yes, reset, malformed planner output and invalidated offers.
- [ ] Run tests and observe failure; implement pure helpers and extend bounded task validation.
- [ ] Run tests green; preserve existing task/action tests.

### Task 2: Indexed search and metadata
Files: supabase/migrations/202610160001_venus_discovery_search.sql, lib/venus-search.ts, lib/data.ts, components/admin/product-form.tsx, app/admin/products/[id]/edit/page.tsx.
Produces: read-only venus_search_products RPC, capped summaries and bounded active detail readers, editable approved metadata.
- [ ] Write SQL integration checks for price, tags, usage, no match, limit clamp, archive/inactive visibility and >200 product fixture; run transactionally or in local PGlite.
- [ ] Add optional arrays/brand, bounded metadata constraint, search-document trigger/index and compatible invoker RPC; preserve legacy vectors and RPC.
- [ ] Apply additive migration via Supabase MCP; verify anon grants and active filters, no production publish.
- [ ] Add typed summary/detail readers with cancellation and metadata editor normalization.

### Task 3: Planner -> retrieval -> recommendation
Files: app/api/venus/route.ts, lib/venus-discovery.ts, lib/venus-search.ts.
- [ ] Add route regression fixtures proving no catalog read for vague gift clarification and no stale action after errors.
- [ ] Start global deadline before planner. Run bounded planner on brief/history only. Clarify before catalog reads; otherwise search summaries and inspect at most 8 records.
- [ ] Remove readActiveCatalog from Venus. Bounded direct/selected/saved lookups preserve existing actions/compare; no assistant-prose confirmation for guided tasks.
- [ ] Recommendation uses inspected records only, original evidence and per-pick rationale. Limit to 3 by default; no-fit differs from outage.
- [ ] Verify exact confirmation and unknown-currency behavior.

### Task 4: Frontend state and rationale
Files: components/VenusChatWidget.tsx, lib/venus-stream.ts, lib/venus-task.ts.
- [ ] Test new validated state events and partial stream safety.
- [ ] Invalidate old selection immediately on non-confirmation; persist incoming invalidation even if later failure. Commit offered selection only after done; retain brief/pending answers.
- [ ] Display per-product fit rationale separately from recorded evidence; accurate activity labels.

### Task 5: Verification and preview
- [ ] Run targeted pure/SQL tests, tsc, lint, and relevant React review.
- [ ] Commit only changed files to existing feature branch and wait ves-na preview success.
- [ ] Verify vague gift -> short answer -> targeted selection -> refinement -> yes, distinct activity counts, no-match and guest write rejection.
- [ ] Obtain final read-only review from existing reviewers; fix important issues. Report semantic/authenticated-flow limits explicitly.

## Execution ledger

- Planning: Three reviews completed. Ruling: lexical/tag retrieval ships independently; legacy embeddings excluded because provenance and runtime are unverified.
