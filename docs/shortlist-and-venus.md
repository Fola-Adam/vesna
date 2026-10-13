# Shortlist and Venus actions

The public `/shortlist` page uses the active production catalog and browser-local saved product IDs. It shares Gallery, Compact Grid, and List browsing with Picks. Visitors can select two or three available picks to draft a grounded Venus comparison, remove items, confirm clearing the list, and undo the latest removal or clear. Unavailable saved IDs remain stored and are counted separately rather than silently discarded.

Venus accepts explicit commands such as:

- `Save Sony WH-1000XM6 to my shortlist`
- `Remove Sony WH-1000XM6 from my shortlist`
- `Save this pick` when a single product is in focus
- `Open my shortlist`
- `Open Sony WH-1000XM6`
- `Show audio picks under $200`
- `Clear my shortlist` (requires the visible confirmation button)

The server resolves names against current catalog records. Ambiguous names produce a clarification; removal also requires the ID in the submitted shortlist. Browser actions use an allowlist and UUID/slug validation. No model-generated arbitrary URL, administrative action, purchase, or database write is accepted. Ordinary AI replies cannot perform actions.

Actions execute only after the complete stream passes validation. Save and removal messages are produced by the browser after storage succeeds. A failed or stopped stream does not execute an action. Chat history persists prose only and never replays actions or pending confirmations after reload. Save/remove are idempotent, so a repeated request cannot toggle an item into the opposite state.

Saved IDs live in localStorage; the latest undo snapshot lives in sessionStorage. Both are scoped to the browser and deployment origin. There is no account sync or checkout in this release.

Explicit comparisons of two or three named picks use a catalog-backed table and recorded curator notes. They do not require the AI provider. Missing specifications and limitations are labeled as unrecorded; table overflow is contained inside the chat on narrow screens. General discovery and explanatory conversations still use the configured AI provider.
