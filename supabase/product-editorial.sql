-- Additive fields; existing listings retain their original content and access policies.
alter table public.products
  add column best_for text check (char_length(best_for) <= 2000),
  add column considerations text check (char_length(considerations) <= 2000),
  add column specifications text check (char_length(specifications) <= 8000),
  add column selection_basis text not null default 'not_recorded'
    check (selection_basis in ('not_recorded', 'researched', 'personally_used', 'design'));
