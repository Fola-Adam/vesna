-- Unsubscribe capability is a separate unguessable token; table stays private.
alter table public.email_subscribers
  add column unsubscribe_token uuid not null default gen_random_uuid(),
  add constraint email_subscribers_unsubscribe_token_key unique (unsubscribe_token);
