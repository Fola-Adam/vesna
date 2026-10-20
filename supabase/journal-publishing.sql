begin;
create table public.journal_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (length(title) between 1 and 180),
  excerpt text not null default '',
  body text not null default '',
  image text not null default '',
  caption text not null default '',
  author text not null default 'Vesna',
  category text not null default 'curator' check (category in ('curator','objects','philosophy')),
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  check (status = 'draft' or (length(trim(body)) > 0 and length(trim(excerpt)) > 0 and length(trim(image)) > 0 and published_at is not null))
);
alter table public.journal_articles enable row level security;
revoke all on public.journal_articles from anon, authenticated;
grant select on public.journal_articles to anon;
grant select, insert, update on public.journal_articles to authenticated;
grant all on public.journal_articles to service_role;
create policy "Published stories are public" on public.journal_articles for select to anon, authenticated using (status = 'published');
create policy "Admins read journal drafts" on public.journal_articles for select to authenticated using (exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin'));
create policy "Admins create stories" on public.journal_articles for insert to authenticated with check (exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin'));
create policy "Admins edit stories" on public.journal_articles for update to authenticated using (exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')) with check (exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin'));
create index journal_published_date on public.journal_articles (published_at desc) where status = 'published';
commit;
