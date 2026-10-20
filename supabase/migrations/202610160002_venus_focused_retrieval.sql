-- Preserve lexical recall while requiring evidence of retained interests.
-- Keep the original search RPC signature for older preview/production code.
create or replace function public.venus_terms_query(terms text[]) returns tsquery
 language sql immutable security invoker set search_path='' as $$
 select coalesce(string_agg('('||q::text||')',' | ')::tsquery,''::tsquery)
 from (select plainto_tsquery('pg_catalog.english',left(term,80)) q from unnest(terms[1:12]) term) t where numnode(q)>0
$$;
create or replace function public.venus_search_focused_products(search_terms text[], focus_terms text[] default '{}', excluded_terms text[] default '{}', max_price numeric default null, boost_tags text[] default '{}', excluded_tags text[] default '{}', broad boolean default false, match_count integer default 12)
 returns table(id uuid,slug text,name text,price numeric,category text,excerpt text,uses text[],interests text[],score real)
 language sql stable security invoker set search_path='' as $$
 with queries as (select public.venus_terms_query(search_terms) q,public.venus_terms_query(focus_terms) focus,public.venus_terms_query(excluded_terms) exclusions),
 eligible as (
 select p.*,c.name category_name,case when p.sale_price is not null and p.price is not null and p.sale_price<p.price then p.sale_price else p.price end effective_price
 from public.products p left join public.categories c on c.id=p.category_id
 where p.is_active=true and p.item_type<>'archive'
 and not exists(select 1 from unnest(excluded_tags[1:12]) excluded where lower(trim(left(excluded,80)))=lower(c.name)
 or lower(trim(left(excluded,80)))=any(array(select lower(trim(t)) from unnest(p.uses||p.interests) t)))
 )
 select p.id,p.slug,p.name,p.effective_price,p.category_name,left(coalesce(p.best_for,p.description,''),300),p.uses,p.interests,
 (ts_rank_cd(p.search_document,queries.q)+0.05*(select count(*) from unnest(boost_tags[1:12]) b where lower(trim(left(b,80)))=any(array(select lower(trim(t)) from unnest(p.occasions||p.recipient_tags||p.interests) t))))::real rank
 from eligible p cross join queries
 where (max_price is null or max_price>=0 and p.effective_price is not null and p.effective_price<=least(max_price,1000000))
 and (p.search_document @@ queries.q or broad=true and numnode(queries.q)=0)
 and (numnode(queries.focus)=0 or p.search_document @@ queries.focus)
 and (numnode(queries.exclusions)=0 or not(p.search_document @@ queries.exclusions))
 order by rank desc,p.id asc limit greatest(1,least(coalesce(match_count,12),12))
$$;
revoke all on function public.venus_search_focused_products(text[],text[],text[],numeric,text[],text[],boolean,integer) from public;
grant execute on function public.venus_search_focused_products(text[],text[],text[],numeric,text[],text[],boolean,integer) to anon,authenticated;
