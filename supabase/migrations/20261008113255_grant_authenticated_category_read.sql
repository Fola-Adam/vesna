-- Product admin forms need to read category labels and IDs after sign-in.
grant select on public.categories to authenticated;
