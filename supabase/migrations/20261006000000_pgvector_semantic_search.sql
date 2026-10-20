-- ============================================================================
-- Vesna: enable pgvector + semantic search for the Venus AI assistant.
--
-- app/api/venus/route.ts calls the `match_products` RPC, and lib/embeddings.ts
-- expects a products.embedding column — neither existed in schema.sql, so
-- semantic search silently fell back to keyword matching. This migration adds
-- both, plus admin-role RLS hardening.
--
-- Apply with:  supabase db push   (or paste into the SQL editor)
-- ============================================================================

-- 1. pgvector extension (available on all Supabase Postgres projects)
create extension if not exists vector with schema extensions;

-- 2. Embedding column on products (MiniLM-L6-v3 => 384 dims)
alter table public.products
  add column if not exists embedding extensions.vector(384);

comment on column public.products.embedding is
  'Local embedding of name+description+category via @xenova/transformers MiniLM (384d). Populated by scripts/seed-embeddings.sql or the admin "Reindex" action.';

-- 3. ANN index for fast similarity search
create index if not exists products_embedding_idx
  on public.products using hnsw (embedding extensions.vector_cosine_ops);

-- 4. The RPC the Venus route calls (param names must match app/api/venus/route.ts:
--    query_embedding, match_threshold, match_count)
create or replace function public.match_products(
  query_embedding extensions.vector(384),
  match_threshold float default 0.4,
  match_count int default 6
)
returns table (
  id uuid,
  name text,
  slug text,
  description text,
  price numeric,
  image_urls text[],
  why_victory text,
  item_type text,
  category_id uuid,
  similarity float
)
language sql
security invoker
stable
as $$
  select
    p.id,
    p.name,
    p.slug,
    p.description,
    p.price,
    p.image_urls,
    p.why_victory,
    p.item_type,
    p.category_id,
    1 - (p.embedding <=> query_embedding) as similarity
  from public.products p
  where p.is_active = true
    and p.embedding is not null
    and 1 - (p.embedding <=> query_embedding) >= match_threshold
  order by p.embedding <=> query_embedding
  limit match_count;
$$;

-- Public (anon) can execute the read-only search RPC
grant execute on function public.match_products to anon, authenticated;

-- 5. Admin RLS hardening: writes go through server routes that use the
-- user's own session; make sure only admins can mutate catalog tables.
drop policy if exists "admins can manage products" on public.products;
create policy "admins can manage products"
  on public.products for all
  using (
    exists (select 1 from public.profiles pr
            where pr.id = auth.uid() and pr.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles pr
            where pr.id = auth.uid() and pr.role = 'admin')
  );

-- 6. Click-tracking retention: delete rows older than 18 months.
--    Requires pg_cron (enable it in Database -> Extensions in the dashboard):
-- select cron.schedule('click-retention', '0 3 1 * *',
--   $$delete from public.click_tracking where clicked_at < now() - interval '18 months'$$);
