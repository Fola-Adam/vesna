-- Review before applying to the live Vesna project. No rows are deleted.
-- This enables the existing catalog policies so the public site sees only active
-- products while authenticated admins can manage the full catalog and media.
begin;

alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.click_tracking enable row level security;
alter table public.email_subscribers enable row level security;

-- Product catalog: public users see active items; admins can manage all items.
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

drop policy if exists "Products are viewable by everyone" on public.products;
create policy "Products are viewable by everyone"
  on public.products for select to anon, authenticated
  using (is_active = true);

drop policy if exists "Products readable by admins" on public.products;
drop policy if exists "admins can manage products" on public.products;
create policy "Products readable by admins"
  on public.products for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  ));

drop policy if exists "Products are insertable by admins only" on public.products;
create policy "Products are insertable by admins only"
  on public.products for insert to authenticated
  with check (exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  ));

drop policy if exists "Products are updatable by admins only" on public.products;
create policy "Products are updatable by admins only"
  on public.products for update to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  ))
  with check (exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  ));

drop policy if exists "Products are deletable by admins only" on public.products;
create policy "Products are deletable by admins only"
  on public.products for delete to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  ));

-- Subscriber addresses are private. Only authenticated admins may read them;
-- signup and unsubscribe actions continue to use server-only credentials.
revoke all on public.email_subscribers from anon, public;
grant select on public.email_subscribers to authenticated;
drop policy if exists "Email subscribers admin only" on public.email_subscribers;
drop policy if exists "Email subscribers admin read" on public.email_subscribers;
create policy "Email subscribers admin read"
  on public.email_subscribers for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  ));

-- Click records are insertable for storefront tracking and readable only by admins.
revoke select on public.click_tracking from anon, public;
grant insert on public.click_tracking to anon, authenticated;
grant select on public.click_tracking to authenticated;
drop policy if exists "Click tracking insertable by all" on public.click_tracking;
create policy "Click tracking insertable by all"
  on public.click_tracking for insert to anon, authenticated
  with check (true);
drop policy if exists "Click tracking readable by admin" on public.click_tracking;
create policy "Click tracking readable by admin"
  on public.click_tracking for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  ));

-- Public bucket URLs make storefront images readable; writes stay admin-only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images', 'product-images', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Vesna product images admin upload" on storage.objects;
create policy "Vesna product images admin upload"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
  );

drop policy if exists "Vesna product images admin update" on storage.objects;
create policy "Vesna product images admin update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
  )
  with check (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
  );

drop policy if exists "Vesna product images admin delete" on storage.objects;
create policy "Vesna product images admin delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
  );

commit;
