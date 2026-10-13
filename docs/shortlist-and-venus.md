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

The server resolves names against current catalog records. Ambiguous names produce a clarification; removal also requires the ID in the submitted shortlist. Browser actions use an allowlist and UUID/slug validation. Groq can request the defined save, remove, navigation, and filter tools for natural wording. The server validates the tool name, product, and user intent before returning a browser action. No arbitrary URL, administrative action, purchase, or database write is accepted. Ordinary AI prose cannot perform actions or serve as a success receipt.

Actions execute only after the complete stream passes validation. Save and removal messages are produced by the browser after storage succeeds. A failed or stopped stream does not execute an action. Chat history persists prose only and never replays actions or pending confirmations after reload. Save/remove are idempotent, so a repeated request cannot toggle an item into the opposite state.

Saved IDs live in localStorage; the latest undo snapshot lives in sessionStorage. Both are scoped to the browser and deployment origin. There is no account sync or checkout in this release.

Explicit comparisons of two or three named picks use a catalog-backed table and recorded curator notes. They do not require the AI provider. Missing specifications and limitations are labeled as unrecorded; table overflow is contained inside the chat on narrow screens. General discovery and explanatory conversations still use the configured AI provider.

Conversational offers name one canonical catalog pick. A direct yes to the latest specific offer executes that action; ambiguous or stale approvals do not. Bare product names produce a save offer. `done?` checks the current browser-supplied shortlist instead of trusting prior assistant claims. Spacing variants such as `Sonos Era100` resolve to the canonical `Sonos Era 100` record. Provider prose is buffered until any tool calls are validated; invented completion prose is replaced with a truthful no-action message. An empty heartbeat keeps the streaming connection active while the provider is deciding.
