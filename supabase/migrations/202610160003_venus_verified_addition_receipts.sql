-- Additional committed receipt field; existing callers remain compatible.
create or replace function public.change_member_shortlist(operation text, pick_ids uuid[] default '{}') returns jsonb
language plpgsql security invoker set search_path='' as $$
declare owner_id uuid := auth.uid(); current_ids uuid[]; before_ids uuid[]; removed_ids uuid[] := '{}'; added_ids uuid[] := '{}'; added_count integer := 0; next_count integer;
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
  if operation='add' then
    select coalesce(array_agg(id order by first_ord),'{}'::uuid[]) into added_ids from (select id,min(ord) first_ord from unnest(pick_ids) with ordinality as requested(id,ord) where id=any(current_ids) and not(id=any(before_ids)) group by id) actual_additions;
  end if;
  return jsonb_build_object('ids',current_ids,'userId',owner_id,'added',added_count,'addedIds',added_ids,'removedIds',removed_ids);
end;
$$;
revoke all on function public.change_member_shortlist(text,uuid[]) from public,anon;
grant execute on function public.change_member_shortlist(text,uuid[]) to authenticated;

