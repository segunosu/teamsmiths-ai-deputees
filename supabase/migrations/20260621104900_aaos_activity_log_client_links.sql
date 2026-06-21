-- Make activity log client/engagement aware (additive).
alter table public.aaos_activity_log add column if not exists client_id uuid references public.aaos_clients(id) on delete cascade;
alter table public.aaos_activity_log add column if not exists engagement_id uuid references public.aaos_engagements(id) on delete set null;
create index if not exists idx_aaos_activity_client on public.aaos_activity_log(client_id);
