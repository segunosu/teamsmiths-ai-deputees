-- Reusable governance LIBRARY + per-client generated governance ARTIFACTS. Additive, admin-only RLS.
create table if not exists public.aaos_library (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('policy','risk','control','questionnaire_qa','model_card_template','incident_playbook','playbook','prompt','attestation_template')),
  title text not null, framework text,
  four_p_dimension text check (four_p_dimension in ('primed','principled','practised','protected')),
  body text, question text, tags text[], source text not null default 'seed',
  created_by uuid default auth.uid(), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.aaos_gov_artifacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.aaos_companies(id) on delete set null,
  client_id uuid references public.aaos_clients(id) on delete set null,
  artifact_type text not null, title text, content text, source_context text, provider text, model text,
  review_status text not null default 'needs human review', human_review_required boolean not null default true,
  created_by uuid default auth.uid(), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists idx_aaos_library_kind on public.aaos_library(kind);
create index if not exists idx_aaos_gov_artifacts_company on public.aaos_gov_artifacts(company_id);
create index if not exists idx_aaos_gov_artifacts_client on public.aaos_gov_artifacts(client_id);
do $$ declare t text; begin
  foreach t in array array['aaos_library','aaos_gov_artifacts'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.update_updated_at_column()', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "aaos_admin_all" on public.%I', t);
    execute format('create policy "aaos_admin_all" on public.%I for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()))', t);
  end loop;
end $$;
