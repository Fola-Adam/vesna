-- Admin reporting and lightweight partner register.
-- This migration changes shared catalog structure when applied. Review first.
begin;

-- Keep analytics aggregation in Postgres; invoker security preserves the
-- click_tracking and products RLS policies for the authenticated admin.
create or replace view public.daily_click_stats
with (security_invoker = true) as
select
  date(clicked_at) as date,
  count(*)::bigint as total_clicks,
  count(distinct session_id)::bigint as unique_sessions,
  count(distinct product_id)::bigint as products_clicked
from public.click_tracking
group by date(clicked_at);

create or replace view public.product_click_stats
with (security_invoker = true) as
select
  date(ct.clicked_at) as click_date,
  ct.product_id,
  count(*)::bigint as total_clicks
from public.click_tracking ct
where ct.product_id is not null
group by date(ct.clicked_at), ct.product_id;

create or replace view public.referrer_click_stats
with (security_invoker = true) as
select
  date(clicked_at) as click_date,
  coalesce(nullif(trim(referrer), ''), 'Direct') as referrer,
  count(*)::bigint as total_clicks
from public.click_tracking
group by date(clicked_at), coalesce(nullif(trim(referrer), ''), 'Direct');

revoke all on public.daily_click_stats, public.product_click_stats, public.referrer_click_stats from anon, public;
grant select on public.daily_click_stats, public.product_click_stats, public.referrer_click_stats to authenticated;

create table if not exists public.catalog_partners (
  id uuid primary key default gen_random_uuid(),
  partner_type text not null check (partner_type in ('vendor', 'maker')),
  name text not null check (length(trim(name)) between 1 and 160),
  status text not null default 'prospect' check (status in ('prospect', 'active', 'paused', 'archived')),
  contact_name text,
  contact_email text,
  website text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.catalog_partners enable row level security;
grant select, insert, update on public.catalog_partners to authenticated;
drop policy if exists "Catalog partners manageable by admin" on public.catalog_partners;
create policy "Catalog partners manageable by admin"
  on public.catalog_partners for all to authenticated
  using (exists (
    select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'
  ))
  with check (exists (
    select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'
  ));

alter table public.products add column if not exists partner_id uuid references public.catalog_partners(id) on delete set null;
create index if not exists products_partner_id_idx on public.products(partner_id) where partner_id is not null;
create index if not exists catalog_partners_status_type_idx on public.catalog_partners(status, partner_type);

commit;
