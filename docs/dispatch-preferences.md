# Dispatch preferences

- Supabase remains the subscriber record. Only administrators can read subscribers; public clients cannot read personal unsubscribe tokens.
- A signup inserts a new subscriber. A duplicate request preserves the existing row, verification state, and unsubscribe preference. Rejoining after opting out requires a future email ownership confirmation flow; the public form cannot reverse an opt-out.
- Each subscriber has a separate random unsubscribe token. Curator Studio can copy a personal link using the current site's origin. Preview links are for preview review; use the production studio's links for production email campaigns after this change is released.
- Opening a link changes nothing. The reader must press the unsubscribe button. The endpoint records local suppression immediately and, when configured, requests Brevo email blocklisting. Provider failures produce a retry message instead of claiming complete success.
- Include a personal unsubscribe link in every Dispatch campaign. The application does not send campaigns or confirmation emails by itself. Brevo's native unsubscribe link should also remain in Brevo templates.
- Signup does not mark a subscriber as verified. The studio's Pending status indicates that ownership has not been confirmed.
- If a mailing provider has its own unsubscribe flow, reconcile its suppressions into Supabase before using Supabase records for another sending system. This release does not install a provider webhook or an automatic reconciliation job.
- Endpoint rate limits are per server instance, matching the existing signup limiter. Use shared limits when traffic warrants them.
