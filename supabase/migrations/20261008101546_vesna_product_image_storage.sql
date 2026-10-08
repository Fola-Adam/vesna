-- Review before applying to the live Vesna project. No rows are deleted.
-- This enables the existing catalog policies so the public site sees only active
-- products while authenticated admins can manage the full catalog and media.
begin;

alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.click_tracking enable row level security;
alter table public.email_subscribers enable row level security;

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
