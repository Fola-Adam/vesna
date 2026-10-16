-- Additive shared-catalog search; existing vectors and RPCs remain untouched.
alter table public.products add column if not exists brand text,
 add column if not exists uses text[] not null default '{}',
 add column if not exists interests text[] not null default '{}',
 add column if not exists occasions text[] not null default '{}',
 add column if not exists recipient_tags text[] not null default '{}';
create or replace function public.venus_valid_tags(tags text[]) returns boolean
 language sql immutable security invoker set search_path='' as $$
 select tags is not null and cardinality(tags)<=12 and not exists(select 1 from unnest(tags) t where t is null or length(trim(t))=0 or length(t)>80)
$$;
alter table public.products add constraint products_discovery_metadata_check check (
 (brand is null or length(brand)<=100) and public.venus_valid_tags(uses) and public.venus_valid_tags(interests)
 and public.venus_valid_tags(occasions) and public.venus_valid_tags(recipient_tags));
create or replace function public.venus_normalize_tags(tags text[]) returns text[] language sql immutable security invoker set search_path='' as $$
 select case when cardinality(tags)>12 then tags else array(select distinct lower(trim(t)) from unnest(tags) t order by 1) end
$$;
create or replace function public.venus_normalize_product_metadata() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 new.uses:=public.venus_normalize_tags(new.uses);new.interests:=public.venus_normalize_tags(new.interests);
 new.occasions:=public.venus_normalize_tags(new.occasions);new.recipient_tags:=public.venus_normalize_tags(new.recipient_tags);
 return new;
end
$$;
create trigger venus_normalize_product_metadata before insert or update of uses,interests,occasions,recipient_tags on public.products for each row execute function public.venus_normalize_product_metadata();
create or replace function public.venus_product_document(product_name text, product_brand text, product_uses text[], product_interests text[], product_occasions text[], recipients text[], description text, suitability text, curator_note text, specifications text)
 returns tsvector language sql immutable security invoker set search_path='' as $$
 select setweight(to_tsvector('pg_catalog.english',coalesce(product_name,'')||' '||coalesce(product_brand,'')),'A')
 || setweight(to_tsvector('pg_catalog.english',array_to_string(product_uses,' ')||' '||array_to_string(product_interests,' ')),'A')
 || setweight(to_tsvector('pg_catalog.english',array_to_string(product_occasions,' ')||' '||array_to_string(recipients,' ')),'B')
 || setweight(to_tsvector('pg_catalog.english',coalesce(suitability,'')||' '||coalesce(description,'')||' '||coalesce(curator_note,'')||' '||coalesce(specifications,'')),'C')
$$;
alter table public.products add column if not exists search_document tsvector generated always as
 (public.venus_product_document(name,brand,uses,interests,occasions,recipient_tags,description,best_for,why_victory,specifications)) stored;
create index if not exists products_venus_search_idx on public.products using gin(search_document) where is_active=true and item_type<>'archive';
create or replace function public.venus_search_products(search_terms text[], max_price numeric default null, boost_tags text[] default '{}', excluded_tags text[] default '{}', broad boolean default false, match_count integer default 12)
 returns table(id uuid,slug text,name text,price numeric,category text,excerpt text,uses text[],interests text[],score real)
 language sql stable security invoker set search_path='' as $$
 with query as (
 select coalesce(string_agg('('||q::text||')',' | ')::tsquery,''::tsquery) q
 from (select plainto_tsquery('pg_catalog.english',left(term,80)) q from unnest(search_terms[1:12]) term) terms where numnode(q)>0
 ), eligible as (
 select p.*,c.name category_name,case when p.sale_price is not null and p.price is not null and p.sale_price<p.price then p.sale_price else p.price end effective_price
 from public.products p left join public.categories c on c.id=p.category_id
 where p.is_active=true and p.item_type<>'archive'
 and not exists(select 1 from unnest(excluded_tags[1:12]) excluded where lower(trim(left(excluded,80)))=lower(c.name)
 or lower(trim(left(excluded,80)))=any(array(select lower(t) from unnest(p.uses||p.interests) t)))
 )
 select p.id,p.slug,p.name,p.effective_price,p.category_name,left(coalesce(p.best_for,p.description,''),300),p.uses,p.interests,
 (ts_rank_cd(p.search_document,query.q)+0.05*(select count(*) from unnest(boost_tags[1:12]) b where lower(trim(left(b,80)))=any(array(select lower(t) from unnest(p.occasions||p.recipient_tags||p.interests) t))))::real rank
 from eligible p cross join query
 where (max_price is null or max_price>=0 and p.effective_price is not null and p.effective_price<=least(max_price,1000000))
 and (p.search_document @@ query.q or broad=true and numnode(query.q)=0)
 order by rank desc,p.id asc limit greatest(1,least(coalesce(match_count,12),12))
$$;
revoke all on function public.venus_search_products(text[],numeric,text[],text[],boolean,integer) from public;
grant execute on function public.venus_search_products(text[],numeric,text[],text[],boolean,integer) to anon,authenticated;
