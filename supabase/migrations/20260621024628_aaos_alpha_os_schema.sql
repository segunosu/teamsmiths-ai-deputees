-- AI Alpha OS (Agile AI Alpha) — Client Search & Acceptance Engine
-- All tables prefixed aaos_ to avoid collision with existing modules.
-- Access model: single owner/admin. RLS gates every table to is_admin(auth.uid()).

-- ============ companies ============
create table if not exists public.aaos_companies (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  website text,
  country text,
  region text,
  sector text,
  subsector text,
  company_size_band text,
  estimated_revenue_band text,
  ownership_type text,
  funding_stage text,
  owner_or_ceo_name text,
  owner_or_ceo_linkedin text,
  key_contact_name text,
  key_contact_role text,
  key_contact_email text,
  source text,
  source_url text,
  notes text,
  status text not null default 'New' check (status in ('New','Researching','Snapshot Ready','Outreach Ready','Contacted','Interested','Proposal Ready','Accepted','Nurture','Rejected','Onboarded')),
  acceptance_decision text check (acceptance_decision in ('Accept','Nurture','Reject','Research More')),
  decision_reason text,
  accepted_offer_route text check (accepted_offer_route in ('AI Alpha Diagnostic','90-Day AI Value Sprint','Operating Partner Subscription','Gain-Share Candidate','Warrant or Equity Candidate','Research More Before Offer')),
  rejection_reason text,
  next_action text,
  next_action_due_date date,
  human_review_required boolean not null default false,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ company_scores ============
create table if not exists public.aaos_company_scores (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.aaos_companies(id) on delete cascade,
  ai_value_potential_score integer check (ai_value_potential_score between 0 and 25),
  pain_visibility_score integer check (pain_visibility_score between 0 and 15),
  data_workflow_readiness_score integer check (data_workflow_readiness_score between 0 and 15),
  buyer_accessibility_score integer check (buyer_accessibility_score between 0 and 15),
  ability_to_pay_score integer check (ability_to_pay_score between 0 and 15),
  governance_risk_fit_score integer check (governance_risk_fit_score between 0 and 10),
  strategic_relevance_score integer check (strategic_relevance_score between 0 and 5),
  ai_alpha_fit_score integer check (ai_alpha_fit_score between 0 and 100),
  score_band text,
  scoring_notes text,
  old_manual_effort_hours numeric,
  new_ai_assisted_effort_hours numeric,
  leverage_factor numeric,
  automation_category text check (automation_category in ('Fully Automatable','AI-Assisted','Human Only')),
  human_review_required boolean not null default false,
  last_scored_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ company_signals ============
create table if not exists public.aaos_company_signals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.aaos_companies(id) on delete cascade,
  signal_type text check (signal_type in ('hiring','funding','website weakness','poor conversion','support bottleneck','customer complaints','manual workflow','software delivery bottleneck','regulatory pressure','growth signal','cost pressure','AI adoption signal','competitor pressure','operational inefficiency','other')),
  signal_summary text,
  signal_url text,
  signal_strength text check (signal_strength in ('weak','medium','strong')),
  implication text,
  evidence_notes text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ four_ps_scores ============
create table if not exists public.aaos_four_ps_scores (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.aaos_companies(id) on delete cascade,
  -- Primed
  leadership_literacy integer check (leadership_literacy between 1 and 5),
  workforce_literacy integer check (workforce_literacy between 1 and 5),
  data_readiness integer check (data_readiness between 1 and 5),
  infrastructure_readiness integer check (infrastructure_readiness between 1 and 5),
  use_case_clarity integer check (use_case_clarity between 1 and 5),
  primed_score integer,
  primed_band text,
  primed_evidence_notes text,
  -- Principled
  stated_principles integer check (stated_principles between 1 and 5),
  decision_rights integer check (decision_rights between 1 and 5),
  ethics_review_process integer check (ethics_review_process between 1 and 5),
  transparency_standards integer check (transparency_standards between 1 and 5),
  human_in_the_loop_rules integer check (human_in_the_loop_rules between 1 and 5),
  principled_score integer,
  principled_band text,
  principled_evidence_notes text,
  -- Practised
  use_case_lifecycle integer check (use_case_lifecycle between 1 and 5),
  model_lifecycle integer check (model_lifecycle between 1 and 5),
  operating_cadence integer check (operating_cadence between 1 and 5),
  team_capability integer check (team_capability between 1 and 5),
  vendor_partner_discipline integer check (vendor_partner_discipline between 1 and 5),
  practised_score integer,
  practised_band text,
  practised_evidence_notes text,
  -- Protected
  risk_inventory integer check (risk_inventory between 1 and 5),
  regulatory_alignment integer check (regulatory_alignment between 1 and 5),
  model_cards integer check (model_cards between 1 and 5),
  audit_trail integer check (audit_trail between 1 and 5),
  incident_response integer check (incident_response between 1 and 5),
  protected_score integer,
  protected_band text,
  protected_evidence_notes text,
  -- Overall
  overall_4ps_score integer,
  overall_4ps_band text,
  preliminary_flag boolean not null default true,
  human_review_required boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ agile_ai_scores ============
create table if not exists public.aaos_agile_ai_scores (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.aaos_companies(id) on delete cascade,
  backlog_quality integer check (backlog_quality between 1 and 5),
  definition_of_done integer check (definition_of_done between 1 and 5),
  delivery_flow integer check (delivery_flow between 1 and 5),
  human_ai_teaming integer check (human_ai_teaming between 1 and 5),
  review_discipline integer check (review_discipline between 1 and 5),
  automation_readiness integer check (automation_readiness between 1 and 5),
  kpi_discipline integer check (kpi_discipline between 1 and 5),
  agile_ai_maturity_score integer,
  agile_ai_maturity_band text,
  agile_ai_notes text,
  preliminary_flag boolean not null default true,
  human_review_required boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ snapshots ============
create table if not exists public.aaos_snapshots (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.aaos_companies(id) on delete cascade,
  title text,
  generated_content text,
  generated_at timestamptz,
  review_status text not null default 'draft' check (review_status in ('draft','needs human review','approved','rejected','sent')),
  approved_for_outreach boolean not null default false,
  reviewer_notes text,
  old_manual_effort_hours numeric,
  new_ai_assisted_effort_hours numeric,
  leverage_factor numeric,
  automation_category text check (automation_category in ('Fully Automatable','AI-Assisted','Human Only')),
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ outreach_drafts ============
create table if not exists public.aaos_outreach_drafts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.aaos_companies(id) on delete cascade,
  outreach_type text check (outreach_type in ('short email','LinkedIn connection note','follow-up email','call opener','meeting agenda')),
  subject text,
  body text,
  review_status text not null default 'draft' check (review_status in ('draft','needs human review','approved','rejected','sent')),
  approved_for_use boolean not null default false,
  contact_source text,
  lawful_basis_notes text,
  unsubscribe_required boolean not null default true,
  suppression_status text default 'not suppressed',
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ proposal_routes ============
create table if not exists public.aaos_proposal_routes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.aaos_companies(id) on delete cascade,
  route_type text check (route_type in ('AI Alpha Diagnostic','90-Day AI Value Sprint','Operating Partner Subscription','Gain-Share Candidate','Warrant or Equity Candidate','Research More')),
  problem_statement text,
  why_now text,
  evidence_from_signals text,
  proposed_scope text,
  baseline_data_needed text,
  target_kpis text,
  expected_value_range text,
  delivery_plan text,
  governance_wrapper text,
  price_placeholder text,
  next_step text,
  commercial_terms_warning text not null default 'Commercial terms require human review before client issue.',
  review_status text not null default 'draft' check (review_status in ('draft','needs human review','approved','rejected','sent')),
  human_review_required boolean not null default true,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ onboarding_tasks ============
create table if not exists public.aaos_onboarding_tasks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.aaos_companies(id) on delete cascade,
  task_title text not null,
  task_description text,
  owner text,
  status text not null default 'todo' check (status in ('todo','in progress','blocked','done')),
  due_date date,
  priority text default 'medium' check (priority in ('low','medium','high')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- ============ kpis ============
create table if not exists public.aaos_kpis (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.aaos_companies(id) on delete cascade,
  kpi_name text not null,
  kpi_category text,
  baseline_value numeric,
  target_value numeric,
  actual_value numeric,
  unit text,
  baseline_date date,
  target_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ value_hypotheses ============
create table if not exists public.aaos_value_hypotheses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.aaos_companies(id) on delete cascade,
  opportunity_name text not null,
  value_type text check (value_type in ('revenue increase','cost reduction','time saving','quality improvement','cycle time reduction','conversion improvement','retention improvement','risk reduction')),
  estimated_monthly_value_low numeric,
  estimated_monthly_value_high numeric,
  assumptions text,
  confidence_level text check (confidence_level in ('low','medium','high')),
  attribution_notes text,
  commercial_trigger text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ activity_log ============
create table if not exists public.aaos_activity_log (
  id uuid primary key default gen_random_uuid(),
  entity_type text,
  entity_id uuid,
  company_id uuid references public.aaos_companies(id) on delete cascade,
  action text,
  summary text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  metadata_json jsonb
);

-- ============ indexes ============
create index if not exists idx_aaos_scores_company on public.aaos_company_scores(company_id);
create index if not exists idx_aaos_signals_company on public.aaos_company_signals(company_id);
create index if not exists idx_aaos_fourps_company on public.aaos_four_ps_scores(company_id);
create index if not exists idx_aaos_agile_company on public.aaos_agile_ai_scores(company_id);
create index if not exists idx_aaos_snapshots_company on public.aaos_snapshots(company_id);
create index if not exists idx_aaos_outreach_company on public.aaos_outreach_drafts(company_id);
create index if not exists idx_aaos_proposals_company on public.aaos_proposal_routes(company_id);
create index if not exists idx_aaos_onboarding_company on public.aaos_onboarding_tasks(company_id);
create index if not exists idx_aaos_kpis_company on public.aaos_kpis(company_id);
create index if not exists idx_aaos_vh_company on public.aaos_value_hypotheses(company_id);
create index if not exists idx_aaos_activity_company on public.aaos_activity_log(company_id);
create index if not exists idx_aaos_activity_created on public.aaos_activity_log(created_at desc);
create index if not exists idx_aaos_companies_status on public.aaos_companies(status);

-- ============ updated_at triggers ============
do $$
declare t text;
begin
  foreach t in array array[
    'aaos_companies','aaos_company_scores','aaos_company_signals','aaos_four_ps_scores',
    'aaos_agile_ai_scores','aaos_snapshots','aaos_outreach_drafts','aaos_proposal_routes',
    'aaos_kpis','aaos_value_hypotheses'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.update_updated_at_column()', t);
  end loop;
end $$;

-- ============ RLS: admin-only on every table ============
do $$
declare t text;
begin
  foreach t in array array[
    'aaos_companies','aaos_company_scores','aaos_company_signals','aaos_four_ps_scores',
    'aaos_agile_ai_scores','aaos_snapshots','aaos_outreach_drafts','aaos_proposal_routes',
    'aaos_onboarding_tasks','aaos_kpis','aaos_value_hypotheses','aaos_activity_log'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "aaos_admin_all" on public.%I', t);
    execute format('create policy "aaos_admin_all" on public.%I for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()))', t);
  end loop;
end $$;
