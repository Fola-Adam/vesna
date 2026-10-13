create table if not exists public.member_shortlist (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);
alter table public.member_shortlist enable row level security;
revoke all on public.member_shortlist from anon;
grant select, insert, delete on public.member_shortlist to authenticated;
create policy "Members read their own shortlist" on public.member_shortlist for select to authenticated
  using ((select auth.uid())=user_id and coalesce((select auth.jwt()->>'is_anonymous'),'false') <> 'true');
create policy "Members save current picks" on public.member_shortlist for insert to authenticated
  with check ((select auth.uid())=user_id and coalesce((select auth.jwt()->>'is_anonymous'),'false') <> 'true'
    and exists(select 1 from public.products where id=product_id and is_active=true and item_type <> 'archive'));
create policy "Members remove their own picks" on public.member_shortlist for delete to authenticated
  using ((select auth.uid())=user_id and coalesce((select auth.jwt()->>'is_anonymous'),'false') <> 'true');

create or replace function public.change_member_shortlist(operation text, pick_ids uuid[] default '{}') returns jsonb
language plpgsql security invoker set search_path='' as $$
declare owner_id uuid := auth.uid(); current_ids uuid[]; before_ids uuid[]; removed_ids uuid[] := '{}'; added_count integer := 0; next_count integer;
begin
  if owner_id is null or coalesce(auth.jwt()->>'is_anonymous','false')='true' then
    raise exception 'Membership required' using errcode='42501';
  end if;
  if operation not in ('add','remove','clear') or cardinality(pick_ids)>200 or array_position(pick_ids,null) is not null then
    raise exception 'Invalid shortlist request' using errcode='22023';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text,0));
  select coalesce(array_agg(product_id),'{}'::uuid[]) into before_ids from public.member_shortlist where user_id=owner_id;
  if operation='add' then
    if exists(select 1 from unnest(pick_ids) as requested(id) where not exists(
      select 1 from public.products p where p.id=requested.id and p.is_active=true and p.item_type<>'archive')) then
      raise exception 'Some picks are no longer available' using errcode='22023';
    end if;
    select count(*) into next_count from (
      select product_id from public.member_shortlist where user_id=owner_id
      union select unnest(pick_ids)
    ) combined;
    if next_count>200 then raise exception 'Shortlist limit is 200 picks' using errcode='22023'; end if;
    insert into public.member_shortlist(user_id,product_id) select owner_id,id from unnest(pick_ids) as requested(id) on conflict do nothing;
    get diagnostics added_count = row_count;
  elsif operation='remove' then
    delete from public.member_shortlist where user_id=owner_id and product_id=any(pick_ids);
  else
    delete from public.member_shortlist where user_id=owner_id;
  end if;
  select coalesce(array_agg(product_id order by created_at,product_id),'{}'::uuid[]) into current_ids from public.member_shortlist where user_id=owner_id;
  select coalesce(array_agg(id),'{}'::uuid[]) into removed_ids from unnest(before_ids) as previous(id) where not(id=any(current_ids));
  return jsonb_build_object('ids',current_ids,'userId',owner_id,'added',added_count,'removedIds',removed_ids);
end;
$$;
revoke all on function public.change_member_shortlist(text,uuid[]) from public,anon;
grant execute on function public.change_member_shortlist(text,uuid[]) to authenticated;

create index if not exists member_shortlist_product_id_idx on public.member_shortlist(product_id);
-- These trigger-only functions do not need direct client invocation.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
