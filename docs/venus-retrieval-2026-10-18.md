# Venus retrieval and state hardening — 18 October 2026

## Scope

Existing PR 2 / `codex/vesna-reliability-2026-10-08`, `ves-na` Deploy Preview only. The catalog is shared with production by design; only empty editorial use/interest tags were filled. No production application deployment or membership writes.

## Confirmed gaps

- All 31 active non-archive records had empty use/interest tags. A hot-drink description did not necessarily match coffee wording.
- The bounded curator records omitted these metadata fields entirely.
- Planner `reset` could erase a retained brief without an explicit start-over command.
- No-match replies retained old selection IDs; model text could incorrectly describe a bounded candidate set as the entire catalog.
- A live recommendation invented a duration of “hours” for Ember despite no recorded duration. Model-generated rationale is now excluded from selection cards; only recorded suitability is displayed.

The user's exact earlier false no-match was not deterministically reproduced before these edits. The live replay after the catalog tag update found Ember at $89.99 under $100 total with no subscriptions.

## Changes

- General word extraction replaces the activity-specific interest alias map. Existing indexed retrieval, public RLS, price and exclusion filters, max 12 summaries and max 8 details remain.
- Curator input includes approved brand/use/interest metadata.
- Source-reviewed, idempotent `supabase/catalog-discovery-tags.sql` fills only empty fields on matching active record snapshots. Manual tags and changed descriptions are preserved. These labels express editorial suitability, not newly verified product specifications.
- Malformed planner output gets one schema-corrective retry within the existing global deadline. Provider errors do not authorize actions or cause automatic membership writes.
- Explicit budget refinements persist before the planner call; an AI reset alone cannot erase the brief.
- Empty search/selection clears the old set and produces an explicit “No set selected” state. Explanations cannot restore an invalidated offer.
- Empty model selection is reconsidered once, then described as a bounded review rather than a claim about the whole catalog.
- Admin field guidance explains uses versus interests and unknown compatibility.

## Evidence and remaining checks

- Local 68 targeted tests passed, including source-tag SQL, arbitrary interests, brief retention, malformed planner recovery, stale-set clearing and generated duration suppression.
- Live shared-catalog SQL: coffee under $100 excluding subscriptions → Ember; gardening under $100 → Smart Plant Pot; rollerskating → no match.
- A read-only preview API replay completed the coffee gift → under $100/no subscription refinement after the tag update. No returned shortlist action was executed.
- Deployment, final replay and authenticated browser mutation checks must be reported separately from local tests. Browser automation on this laptop timed out; a remote read-only API replay is available.

This remains lexical retrieval with editorial metadata and model query planning, not embedding-based semantic search. New products need supported tags; compatibility, warranties and current seller prices remain unknown unless recorded.
