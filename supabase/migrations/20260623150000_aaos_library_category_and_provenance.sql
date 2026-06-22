-- Neat categorisation + provenance for library items (additive).
alter table public.aaos_library add column if not exists category text;
alter table public.aaos_library add column if not exists source_client_id uuid references public.aaos_clients(id) on delete set null;
create index if not exists idx_aaos_library_category on public.aaos_library(category);
