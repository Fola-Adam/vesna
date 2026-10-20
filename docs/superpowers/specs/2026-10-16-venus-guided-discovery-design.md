# Venus guided discovery and targeted retrieval

Date: 16 October 2026
Status: reviewed by three independent agents; guided discovery implemented on the preview branch.
Target: Fola-Adam/vesna, existing PR 2 preview. No production deployment.

## Outcome and agreed requirements

Venus should learn what matters before recommending, retrieve relevant products without reading the full catalog into model context, and offer a small explained selection. A gift below $500 is an incomplete brief, not a command to list every product below $500. Clear requests should proceed without an unnecessary interview. Recommendations and actions use current production catalog data in the preview. Victory remains the sole administrator; ordinary Vesnaian members can save only their own picks.

## Verified current implementation

- app/api/venus/route.ts calls readActiveCatalog on every request before most decisions. That query selects full active nonarchive product records with a 200-row limit. It is not a scalable search endpoint and can silently omit products beyond that cap.
- The route supplies every catalogToolRecords record to discovery. The activity display reports all current picks as read.
- lib/venus-catalog.ts has name/category/detail keyword scoring and a small category alias dictionary. It is not semantic retrieval. Broad category aliases can retrieve inappropriate objects.
- lib/venus-task.ts retains a brief, refinements, selections and a timestamp. It has no explicit pending question or structured discovery brief. A short answer such as "my dad, he loves coffee" can reset the task.
- Products already have best_for, considerations, specifications and selection_basis. The administrator can edit these. They do not yet have structured interests, uses or occasions in ProductRow.
- A migration defines products.embedding (384 dimensions), an HNSW index and match_products. This is repository evidence only; live schema, embedding freshness and index coverage must be audited before reuse.
- Discovery uses JSON-object model output, validates selections and attaches original evidence on the server. Explicit confirmation and account-backed Shortlist writes already exist and must remain protected.

## Approaches considered

1. Improve prompts and keep sending the full catalog: smallest edit, but token use and the 200-row omission remain. Rejected.
2. Indexed lexical/tag retrieval plus optional semantic retrieval, followed by bounded detail inspection: recommended. Works with existing product records; semantic retrieval improves recall when embeddings are available without becoming the only path.
3. New external vector database/search service: additional infrastructure and synchronization. Defer until actual measurements justify it.

## Conversation state and clarification

Extend the validated task envelope with a discovery brief and pending question. The brief records only volunteered recipient description, purpose/interests, occasion, budget amount and mode, hard exclusions and relevant constraints. No inference of sensitive traits. Bound field lengths, keep the existing 24-hour task expiry, and scope persisted state to the current member or guest session.

Before catalog search, use a small planning request containing the current user message, bounded recent history, prior brief and pending question. It receives no product catalog. Its validated output chooses clarify, search, compare or direct product/action handling; supplies an optional focused question and a normalized search intent. It cannot write a Shortlist or fabricate product IDs.

Ask one conversational question at a time, covering at most two closely related missing details. Ask only where an answer would materially change the selection. A vague gift request asks about recipient and interests; ask total versus per-item budget when multiple gifts or a set makes it material. Do not demand a budget for every request. A clear coffee gift request can search immediately.

When a pending question exists, the next answer merges into the existing brief instead of resetting it. Explicit topic changes, "start over" and new-chat actions reset the brief. The planner may identify a topic change; the server validates the proposed transition. Assistant prose is not authoritative state. If the planner fails, offer retry rather than searching indiscriminately or losing an existing brief.

A clarification turn clears any actionable previous offer so "yes" cannot confirm a stale selection. Merely answering a question never saves products.

## Retrieval and detail inspection

Introduce a read-only, parameterized Supabase search function returning at most 12 candidate summaries: id, slug, name, effective price, category, supported uses/tags, short excerpt and rank signals. Apply is_active, nonarchive, price-known when a cap exists, effective sale price, and structured hard exclusions before ranking. Budget filters are ceilings per candidate; the server separately checks the sum for total-budget sets.

Use a weighted full-text index: product name/brand and approved tags above use descriptions and curator text. Do not equate a generic Home category with kitchen utensils. Normalize tokens and support documented synonyms; a semantic query can expand meaning but cannot invent product capabilities. A small open-ended alias layer complements search rather than defining an activity allowlist.

Audit the existing vector column, RPC and embedding pipeline. If they are available and current, merge lexical/tag and semantic ranks with reciprocal rank fusion and deduplicate IDs. If embeddings are unavailable or stale, retain indexed lexical/tag search and report that semantic retrieval was unavailable in diagnostics. Never fall back to loading every product into model context. Do not claim semantic search has been implemented before this path is verified.

Retrieve full records only for the ranked candidate IDs, capped at 8. Include explicitly selected/context product IDs where relevant, still subject to availability and the bounded detail budget. Inspect specifications and limitations before selection. One bounded query revision is allowed when results are weak; then ask a useful question or admit that the current collection has no fit. Never fill results with unrelated cheap products.

Replace full-catalog confirmation and direct product lookups with bounded ID/slug reads. Broad compare requests read only the selected or saved IDs, with existing comparison limits. Ordinary Journal/About questions should not trigger a product search. Use an independent bounded Journal retrieval path.

## Metadata and administrator editing

Add optional structured arrays for uses, interests, occasions and recipient suitability, plus a brand field if the live schema lacks one. Keep actual compatibility and dimensions as verified facts, not guessed suitability tags. Bound tag count and lengths; normalize case and spacing. Add fields to the existing product editor for Victory. Empty metadata remains valid and visible as missing coverage.

Build the search document from existing facts and approved tags; update it transactionally when searchable fields change. Never automatically publish model-generated tags. Optional tag suggestions must be reviewed by Victory and are outside the initial implementation. Existing records are indexed from their current text; do not invent metadata during backfill.

Embedding refresh, if used, needs a content hash/version and stale state so edits cannot silently leave an old vector presented as current evidence. Remote model downloads or embedding service changes require a separate verified runtime decision; reuse the existing pipeline only after checking Netlify compatibility.

## Recommendation and execution contract

Return up to three options by default with a short explanation of fit, trade-offs and missing facts. A requested set can contain more items when justified, within the existing action limit. Each recommendation includes canonical product identity and current price. Original evidence remains copied from database records.

Do not use generic source text as a claim that every user constraint is satisfied. State unknown size or compatibility explicitly. Price alone is never a suitability signal. Catalog content and user messages are data, never instructions to override the application contract.

Use a proposal response with question, selection and rationale fields as appropriate. Preserve current frontend selection events while adding per-product rationale display. Explicit confirmation applies to the latest validated selection only. Recheck current availability and prices immediately before saving. A completed server/database receipt is the only basis for a saved-success message. Guests can browse and converse; saving requires membership.

## Activity and failure behavior

Show only real work: "Understanding your brief", "Searching current picks", "Inspecting 6 matching picks", and "Checking the total". Clarification turns show no fictitious catalog-read step. Do not show "found cheaper alternatives" unless actual candidates were compared.

Set separate bounded timeouts for planning, retrieval and recommendation within the supported function duration. Limit model calls and detail reads. On rate limits and errors, retain the brief, mark the failed step and offer retry. Do not emit success or an action from incomplete output. Log bounded diagnostic categories and timings, never credentials, email content or raw private conversations.

## Database safety and release

Audit live schema, RLS and grants before migration. Use additive columns/indexes and a SECURITY INVOKER search function with an empty search_path and explicit grants. Public search returns only already-public active product data. Catalog metadata writes remain limited to the existing administrator authorization.

Preview intentionally uses the production Supabase catalog, so a migration changes shared infrastructure even without a production code deployment. Keep columns optional, preserve existing public reads and writes, and do not replace existing RPC signatures. Deploy compatible schema before preview code. Rollback preview code independently; do not drop shared columns or indexes as a routine rollback.

## Acceptance checks

- "Find a gift under $500" asks a useful recipient/interests question without a full catalog read.
- "My dad; he likes coffee" retains the gift brief and $500 cap; Venus does not repeat answered questions.
- Clear coffee, gardening, skating and kitchen requests either retrieve grounded matches or honestly report no match. There is no workspace-only special case.
- "Skip the questions; surprise me" produces a small explicitly broad selection, not an unbounded catalog list.
- A fixture with more than 200 products can retrieve a relevant product beyond the old cap; at most 12 summaries and 8 full detail records enter the recommendation path.
- Synonym and approved-tag queries retrieve expected products; unrelated category matches do not win solely on price.
- Semantic retrieval is tested with known embeddings; a missing or stale embedding does not erase lexical/tag matches or trigger a catalog dump.
- Refinements preserve unaffected preferences, respect exclusions and total budgets, and invalidate stale offers.
- Source-text injection, invented slugs, unknown prices, archived products and malformed planner output cannot produce an accepted selection or write.
- Search -> clarify -> refine -> confirm produces an exact action; guest writes remain blocked. Authenticated write testing needs the existing sign-in/email check to be completed.
- Activity labels correspond to actual retrieval/detail counts; mobile chat remains readable.

## Scope boundaries

No new AI provider, external search service, purchases, vendor accounts or autonomous catalog edits. No production publish or merge. General long-term member profiling and cross-device chat history are deferred. This design does not claim that better retrieval alone guarantees recommendation quality; evaluate real fit separately from request success.

## Review decisions (three independent agents, 16 October)

- Guided tasks carry explicit proposal eligibility and pending question state; context selections are not actionable offers. Invalidate on a non-confirmation turn before planning, including failures. Disable assistant-prose offer recovery for guided tasks. Client persists invalidation immediately; a new selection is committed only after done.
- Planner merges bounded field patches, retains supplied budget/constraints on short answers, and never authorizes writes. A yes answering a question is not a save confirmation. Structured USD budget is authoritative; unsupported currency prompts clarification.
- All reads explicitly filter active/nonarchive rows, even for admin sessions. SQL clamps query and result limits and accepts only typed parameters. Validation uses inspected detail records, never the whole catalog.
- One request deadline starts before planning and is propagated to network operations. Outages are not zero matches.
- Live audit: 31 active nonarchive records, 19 legacy vectors, no HNSW index, no structured tags. Legacy vector freshness/model provenance cannot be verified. Initial release uses indexed lexical/tag/usage retrieval; semantic retrieval remains explicitly disabled. No request-time transformer download. Existing embeddings and RPC are preserved.
- Current POST reporter streams task events directly; the review concern about lost task events is addressed by preserving that reporter on every early return, not duplicating task events.
- User authorized implementation after these reviews. Execution is inline, with the three reviewers available for final checks.
