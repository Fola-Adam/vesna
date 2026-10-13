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

Group requests are supported with the save_matching_picks tool and one save_many browser action. Workspace membership uses the existing considered-workspace collection plus products whose recorded descriptions, curator notes, or best-for fields explicitly mention work use. Other named categories and purpose collections can be saved as groups. The server applies any explicit price cap, excludes archived products, and limits one group to 20 picks. Browser storage writes the deduplicated group atomically; it reports newly added versus already saved picks and refuses capacity failures before writing. A brief group clarification can complete an earlier bulk save request. Discovery requests such as `tellme products that can be used in a workspace` list matching records and never inherit a prior save action.


## Catalog tasks and activity (13 October 2026)

Venus now has a bounded tool loop: read the full current catalog, assess the request, and present a concrete selection citing recorded product details. It covers arbitrary activities rather than a fixed workspace/travel/morning matcher. The provider evaluates suitability; the server verifies current records and exact evidence excerpts. Evidence provenance is not a guarantee of physical compatibility, and missing specifications remain unknown.

Live activity events originate from catalog IO, provider steps and browser-local shortlist writes. Completed replies retain a collapsible activity summary in the current conversation. Failures and cancellation mark unfinished operations accordingly. No timed decorative progress or private reasoning is exposed.

Broad saves present a selection and a Save these picks button. The next request carries concrete selected IDs so refinements can refer to those picks. Confirmation rechecks those IDs against the live catalog before returning a bounded save action. Single named saves remain immediate. Browser storage is read back before a success receipt is displayed.

Selections and activity are not persisted across reloads; old product snapshots and action buttons cannot replay. Starting a new conversation clears selection context. Up to 20 records can be selected per task, with at most four provider turns and one browser action per completed response. Deployment remains on ves-na Deploy Preview using its production-backed catalog.


### Confirmation handoff correction

Discovery and broad-save requests now require a structured selection result after reading the catalog. Empty results permit a factual no-match answer or clarification, not an untracked offer to save products. Informal confirmations including yes pls and yes pls, add these three to my shortlist resolve the current selection without another provider request. Legacy prose offers are recovered only when every offered item resolves unambiguously to current catalog records; otherwise the visitor is asked to refresh the set. Errors no longer need to be repeated by sending approval back to the provider.
