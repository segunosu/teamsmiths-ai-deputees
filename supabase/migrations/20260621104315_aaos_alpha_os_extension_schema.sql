-- AI Alpha OS — Stage 1+ extension schema (additive only).
-- Continues the spine from the Client Search & Acceptance Engine (Stage 0).
-- All new tables prefixed aaos_, admin-only RLS via public.is_admin(auth.uid()).
-- Nothing existing is dropped or renamed. Idempotent (safe to re-run / Lovable sync).

-- ===================== CLIENTS =====================
create table if not exists public.aaos_clients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.aaos_companies(id) on delete set null,
  created_from_company_id uuid references public.aaos_companies(id) on delete set null,
  client_name text not null,
  primary_contact_name text,
  primary_contact_email text,
  sector text,
  region text,
  status text not null default 'Active' check (status in ('Active','Paused','Completed','Nurture','Archived')),
  source_company_status text,
  onboarding_status text,
  current_engagement_id uuid,
  notes text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===================== ENGAGEMENTS =====================
create table if not exists public.aaos_engagements (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.aaos_clients(id) on delete cascade,
  company_id uuid references public.aaos_companies(id) on delete set null,
  engagement_name text not null,
  engagement_type text check (engagement_type in ('AI Alpha Diagnostic','90-Day AI Value Sprint','AI Operating Partner Subscription','4Ps Governance Review','Agile AI Maturity Review','AI Build Sprint','Continuous Improvement')),
  status text not null default 'Draft' check (status in ('Draft','Active','At Risk','Complete','Paused','Cancelled')),
  start_date date,
  target_end_date date,
  commercial_model text check (commercial_model in ('Fixed Fee','Subscription','Fixed Fee Plus Upside','Gain-Share','Warrant or Equity Candidate','Internal Demo')),
  agreed_price numeric,
  upside_model text,
  owner text,
  notes text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'aaos_clients_current_engagement_fk') then
    alter table public.aaos_clients
      add constraint aaos_clients_current_engagement_fk
      foreign key (current_engagement_id) references public.aaos_engagements(id) on delete set null;
  end if;
end $$;

-- ===================== DIAGNOSTICS =====================
create table if not exists public.aaos_diagnostics (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.aaos_clients(id) on delete cascade,
  engagement_id uuid references public.aaos_engagements(id) on delete set null,
  diagnostic_name text not null default 'AI Alpha Diagnostic',
  status text not null default 'Draft' check (status in ('Draft','In Progress','Ready for Review','Approved','Shared','Archived')),
  diagnostic_summary text,
  key_findings text,
  top_opportunities_summary text,
  top_risks_summary text,
  recommended_90_day_focus text,
  readiness_score integer,
  value_potential_low numeric,
  value_potential_high numeric,
  confidence_level text check (confidence_level in ('low','medium','high')),
  human_review_required boolean not null default true,
  review_status text not null default 'draft',
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aaos_diagnostic_inputs (
  id uuid primary key default gen_random_uuid(),
  diagnostic_id uuid not null references public.aaos_diagnostics(id) on delete cascade,
  input_type text check (input_type in ('interview note','document note','public signal','process observation','KPI data','system inventory','AI tool inventory','risk note','client statement','consultant observation')),
  title text,
  content text,
  source text,
  evidence_url text,
  confidence_level text check (confidence_level in ('low','medium','high')),
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);

-- ===================== AI OPPORTUNITIES =====================
create table if not exists public.aaos_ai_opportunities (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.aaos_clients(id) on delete cascade,
  engagement_id uuid references public.aaos_engagements(id) on delete set null,
  diagnostic_id uuid references public.aaos_diagnostics(id) on delete set null,
  opportunity_title text not null,
  opportunity_description text,
  business_area text,
  value_type text,
  estimated_monthly_value_low numeric,
  estimated_monthly_value_high numeric,
  estimated_annual_value_low numeric,
  estimated_annual_value_high numeric,
  implementation_effort text,
  time_to_impact text,
  confidence_level text check (confidence_level in ('low','medium','high')),
  risk_level text,
  governance_impact text,
  required_data text,
  required_people text,
  suggested_solution text,
  acceptance_criteria text,
  recommended_next_action text,
  status text not null default 'New' check (status in ('New','Qualified','Selected for Sprint','In Delivery','Delivered','Rejected','Deferred','Measuring Impact')),
  value_potential_score integer,
  urgency_score integer,
  confidence_score integer,
  strategic_fit_score integer,
  effort_score integer,
  risk_score integer,
  priority_score integer,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===================== SPRINTS =====================
create table if not exists public.aaos_sprints (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.aaos_clients(id) on delete cascade,
  engagement_id uuid references public.aaos_engagements(id) on delete set null,
  sprint_name text not null,
  sprint_goal text,
  sprint_type text check (sprint_type in ('Diagnostic Sprint','Build Sprint','Governance Sprint','KPI Sprint','Automation Sprint','Reporting Sprint')),
  start_date date,
  end_date date,
  status text not null default 'Planned' check (status in ('Planned','Active','Review','Complete','Cancelled')),
  sprint_review_notes text,
  retrospective_notes text,
  velocity_points_planned numeric,
  velocity_points_completed numeric,
  ai_points_completed numeric,
  human_points_completed numeric,
  blockers text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===================== STORIES =====================
create table if not exists public.aaos_stories (
  id uuid primary key default gen_random_uuid(),
  sprint_id uuid references public.aaos_sprints(id) on delete cascade,
  client_id uuid references public.aaos_clients(id) on delete set null,
  engagement_id uuid references public.aaos_engagements(id) on delete set null,
  opportunity_id uuid references public.aaos_ai_opportunities(id) on delete set null,
  story_title text not null,
  user_story text,
  story_type text check (story_type in ('discovery','analysis','build','automation','governance','reporting','testing','data','client action','internal action')),
  acceptance_criteria text,
  definition_of_done text,
  golden_test text,
  owner_type text check (owner_type in ('Human Consultant','AI Product Owner','AI Scrum Master','AI Analyst','AI Builder','AI Governance Reviewer','AI QA Reviewer','Client Owner')),
  owner_name text,
  points numeric,
  value_points numeric,
  status text not null default 'Inbox' check (status in ('Inbox','Ready','In Progress','Needs Review','Rejected','Done','Blocked','Deferred')),
  blocker_notes text,
  human_review_required boolean not null default false,
  review_status text not null default 'Not Required' check (review_status in ('Not Required','Needs Human Review','Approved','Rejected','Rework Required')),
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===================== AGENT ROLES =====================
create table if not exists public.aaos_agent_roles (
  id uuid primary key default gen_random_uuid(),
  role_name text not null,
  role_description text,
  responsibilities text,
  permissions text,
  human_review_required_for_outputs boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===================== EVIDENCE =====================
create table if not exists public.aaos_evidence_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.aaos_clients(id) on delete cascade,
  engagement_id uuid references public.aaos_engagements(id) on delete set null,
  four_p_dimension text check (four_p_dimension in ('primed','principled','practised','protected')),
  sub_dimension text,
  evidence_title text,
  evidence_type text check (evidence_type in ('policy','procedure','screenshot','meeting note','decision log','risk register','control record','model card','audit trail','incident response test','training record','vendor assessment','sprint artefact','KPI report')),
  evidence_summary text,
  evidence_url text,
  evidence_status text not null default 'Missing' check (evidence_status in ('Missing','Draft','Current','Stale','Approved','Rejected')),
  evidence_date date,
  reviewed_by text,
  review_status text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===================== GOVERNANCE RISKS =====================
create table if not exists public.aaos_governance_risks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.aaos_clients(id) on delete cascade,
  engagement_id uuid references public.aaos_engagements(id) on delete set null,
  risk_title text not null,
  risk_description text,
  risk_domain text check (risk_domain in ('privacy','security','bias','transparency','explainability','human oversight','legal','operational','supplier','data quality','model performance','reputation','financial')),
  four_p_dimension text check (four_p_dimension in ('primed','principled','practised','protected')),
  related_opportunity_id uuid references public.aaos_ai_opportunities(id) on delete set null,
  likelihood integer check (likelihood between 1 and 5),
  impact integer check (impact between 1 and 5),
  risk_score integer,
  mitigation text,
  owner text,
  due_date date,
  status text not null default 'Open',
  human_review_required boolean not null default false,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===================== CONTROLS =====================
create table if not exists public.aaos_controls (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.aaos_clients(id) on delete cascade,
  engagement_id uuid references public.aaos_engagements(id) on delete set null,
  control_name text not null,
  control_description text,
  control_type text,
  related_risk_id uuid references public.aaos_governance_risks(id) on delete set null,
  related_four_p_dimension text check (related_four_p_dimension in ('primed','principled','practised','protected')),
  owner text,
  implementation_status text not null default 'Not Started' check (implementation_status in ('Not Started','Designed','Implemented','Operating','Needs Review','Retired')),
  evidence_required boolean not null default false,
  evidence_item_id uuid references public.aaos_evidence_items(id) on delete set null,
  review_frequency text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===================== FRAMEWORK MAPPINGS =====================
create table if not exists public.aaos_framework_mappings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.aaos_clients(id) on delete cascade,
  engagement_id uuid references public.aaos_engagements(id) on delete set null,
  framework_name text check (framework_name in ('EU AI Act','NIST AI RMF','ISO/IEC 42001','ISO/IEC 27001 adjacent','GDPR','SOC 2 readiness','UK AI principles')),
  requirement_reference text,
  requirement_summary text,
  related_four_p_dimension text check (related_four_p_dimension in ('primed','principled','practised','protected')),
  related_control_id uuid references public.aaos_controls(id) on delete set null,
  related_evidence_item_id uuid references public.aaos_evidence_items(id) on delete set null,
  status text not null default 'Not Started',
  notes text,
  human_review_required boolean not null default false,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===================== EXTEND aaos_kpis (additive) =====================
alter table public.aaos_kpis add column if not exists client_id uuid references public.aaos_clients(id) on delete cascade;
alter table public.aaos_kpis add column if not exists engagement_id uuid references public.aaos_engagements(id) on delete set null;
alter table public.aaos_kpis add column if not exists opportunity_id uuid references public.aaos_ai_opportunities(id) on delete set null;
alter table public.aaos_kpis add column if not exists data_source text;
alter table public.aaos_kpis add column if not exists actual_date date;
alter table public.aaos_kpis add column if not exists confidence_level text;

-- ===================== VALUE LEDGER =====================
create table if not exists public.aaos_value_ledger (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.aaos_clients(id) on delete cascade,
  engagement_id uuid references public.aaos_engagements(id) on delete set null,
  opportunity_id uuid references public.aaos_ai_opportunities(id) on delete set null,
  kpi_id uuid references public.aaos_kpis(id) on delete set null,
  value_title text not null,
  value_type text,
  baseline_value numeric,
  actual_value numeric,
  calculated_uplift numeric,
  financial_value_low numeric,
  financial_value_high numeric,
  attribution_confidence text check (attribution_confidence in ('Low','Medium','High')),
  attribution_notes text,
  client_agreed text check (client_agreed in ('Yes','No','Pending','Disputed')) default 'Pending',
  evidence_item_id uuid references public.aaos_evidence_items(id) on delete set null,
  monetisation_triggered boolean not null default false,
  monetisation_record_id uuid,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===================== MONETISATION =====================
create table if not exists public.aaos_monetisation_records (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.aaos_clients(id) on delete cascade,
  engagement_id uuid references public.aaos_engagements(id) on delete set null,
  value_ledger_id uuid references public.aaos_value_ledger(id) on delete set null,
  commercial_model text check (commercial_model in ('Fixed Fee','Subscription','Fixed Fee Plus Upside','Gain-Share','Warrant or Equity Candidate','No Commercial Trigger')),
  fee_amount numeric,
  subscription_amount numeric,
  gain_share_percentage numeric,
  gain_share_amount_estimated numeric,
  gain_share_amount_agreed numeric,
  warrant_or_equity_notes text,
  invoice_status text not null default 'Not Required' check (invoice_status in ('Not Required','Draft','Ready','Sent','Paid','Disputed','Cancelled')),
  trigger_condition text,
  trigger_status text not null default 'Not Triggered' check (trigger_status in ('Not Triggered','Triggered','Human Review Required','Approved','Rejected','Invoiced')),
  human_review_required boolean not null default true,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===================== PORTFOLIO LEARNING =====================
create table if not exists public.aaos_portfolio_patterns (
  id uuid primary key default gen_random_uuid(),
  pattern_title text not null,
  pattern_type text check (pattern_type in ('AI use case','sales playbook','delivery playbook','governance control','KPI benchmark','risk pattern','proposal pattern','sprint pattern','automation pattern','prompt pattern')),
  sector text,
  company_size_band text,
  summary text,
  reusable_playbook text,
  source_client_id uuid references public.aaos_clients(id) on delete set null,
  anonymised boolean not null default true,
  confidence_level text check (confidence_level in ('low','medium','high')),
  related_opportunity_type text,
  related_risk_type text,
  related_control_type text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aaos_benchmarks (
  id uuid primary key default gen_random_uuid(),
  benchmark_name text not null,
  sector text,
  company_size_band text,
  metric_name text,
  low_value numeric,
  median_value numeric,
  high_value numeric,
  sample_size integer,
  confidence_level text check (confidence_level in ('low','medium','high')),
  notes text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===================== REPORTS =====================
create table if not exists public.aaos_reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.aaos_clients(id) on delete cascade,
  engagement_id uuid references public.aaos_engagements(id) on delete set null,
  report_type text check (report_type in ('AI Alpha Diagnostic Report','90-Day AI Alpha Plan','Sprint Review Report','Monthly Value Creation Report','4Ps Governance Report','KPI Attribution Report','Board Pack','Portfolio Learning Summary','Monetisation Summary')),
  title text,
  generated_content text,
  input_data_used jsonb,
  assumptions text,
  confidence_level text,
  review_status text not null default 'Draft' check (review_status in ('Draft','Needs Human Review','Approved','Shared','Archived')),
  approved_for_client boolean not null default false,
  generated_at timestamptz,
  exported_at timestamptz,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===================== NARRATIVE INTELLIGENCE LAYER =====================
create table if not exists public.aaos_narrative_notes (
  id uuid primary key default gen_random_uuid(),
  entity_type text,
  entity_id uuid,
  company_id uuid references public.aaos_companies(id) on delete set null,
  client_id uuid references public.aaos_clients(id) on delete set null,
  engagement_id uuid references public.aaos_engagements(id) on delete set null,
  observation_title text,
  observation_text text not null,
  observation_type text check (observation_type in ('general observation','client situation','stakeholder dynamic','pain point','opportunity','risk','governance concern','data concern','delivery concern','commercial concern','KPI/value note','sprint retrospective','decision note')),
  source text,
  confidence_level text check (confidence_level in ('low','medium','high')),
  ai_extraction_status text not null default 'not_analysed',
  human_review_status text not null default 'pending',
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Suggestions extracted from a narrative note (review panel; nothing auto-applied).
create table if not exists public.aaos_narrative_suggestions (
  id uuid primary key default gen_random_uuid(),
  narrative_note_id uuid not null references public.aaos_narrative_notes(id) on delete cascade,
  suggested_item_type text,
  suggested_title text,
  reasoning text,
  confidence_level text check (confidence_level in ('low','medium','high')),
  related_four_p_dimension text,
  related_kpi text,
  payload jsonb,
  review_status text not null default 'pending' check (review_status in ('pending','accepted','edited','rejected')),
  applied_entity_type text,
  applied_entity_id uuid,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===================== INDEXES =====================
create index if not exists idx_aaos_clients_company on public.aaos_clients(company_id);
create index if not exists idx_aaos_engagements_client on public.aaos_engagements(client_id);
create index if not exists idx_aaos_diagnostics_client on public.aaos_diagnostics(client_id);
create index if not exists idx_aaos_diag_inputs_diag on public.aaos_diagnostic_inputs(diagnostic_id);
create index if not exists idx_aaos_opps_client on public.aaos_ai_opportunities(client_id);
create index if not exists idx_aaos_opps_engagement on public.aaos_ai_opportunities(engagement_id);
create index if not exists idx_aaos_sprints_client on public.aaos_sprints(client_id);
create index if not exists idx_aaos_stories_sprint on public.aaos_stories(sprint_id);
create index if not exists idx_aaos_stories_opp on public.aaos_stories(opportunity_id);
create index if not exists idx_aaos_evidence_client on public.aaos_evidence_items(client_id);
create index if not exists idx_aaos_risks_client on public.aaos_governance_risks(client_id);
create index if not exists idx_aaos_controls_client on public.aaos_controls(client_id);
create index if not exists idx_aaos_fw_client on public.aaos_framework_mappings(client_id);
create index if not exists idx_aaos_vl_client on public.aaos_value_ledger(client_id);
create index if not exists idx_aaos_monet_client on public.aaos_monetisation_records(client_id);
create index if not exists idx_aaos_reports_client on public.aaos_reports(client_id);
create index if not exists idx_aaos_narr_company on public.aaos_narrative_notes(company_id);
create index if not exists idx_aaos_narr_client on public.aaos_narrative_notes(client_id);
create index if not exists idx_aaos_narr_entity on public.aaos_narrative_notes(entity_type, entity_id);
create index if not exists idx_aaos_narr_sugg_note on public.aaos_narrative_suggestions(narrative_note_id);
create index if not exists idx_aaos_kpis_client on public.aaos_kpis(client_id);

-- ===================== updated_at triggers =====================
do $$
declare t text;
begin
  foreach t in array array[
    'aaos_clients','aaos_engagements','aaos_diagnostics','aaos_ai_opportunities','aaos_sprints',
    'aaos_stories','aaos_agent_roles','aaos_evidence_items','aaos_governance_risks','aaos_controls',
    'aaos_framework_mappings','aaos_value_ledger','aaos_monetisation_records','aaos_portfolio_patterns',
    'aaos_benchmarks','aaos_reports','aaos_narrative_notes','aaos_narrative_suggestions'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.update_updated_at_column()', t);
  end loop;
end $$;

-- ===================== RLS: admin-only on every new table =====================
do $$
declare t text;
begin
  foreach t in array array[
    'aaos_clients','aaos_engagements','aaos_diagnostics','aaos_diagnostic_inputs','aaos_ai_opportunities',
    'aaos_sprints','aaos_stories','aaos_agent_roles','aaos_evidence_items','aaos_governance_risks',
    'aaos_controls','aaos_framework_mappings','aaos_value_ledger','aaos_monetisation_records',
    'aaos_portfolio_patterns','aaos_benchmarks','aaos_reports','aaos_narrative_notes','aaos_narrative_suggestions'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "aaos_admin_all" on public.%I', t);
    execute format('create policy "aaos_admin_all" on public.%I for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()))', t);
  end loop;
end $$;

-- ===================== Seed default agent roles =====================
insert into public.aaos_agent_roles (role_name, role_description, responsibilities, human_review_required_for_outputs)
select v.role_name, v.role_description, v.responsibilities, true
from (values
  ('AI Product Owner','Shapes and prioritises the value backlog','Backlog shaping, story framing, prioritisation'),
  ('AI Scrum Master','Keeps delivery flowing and surfaces blockers','Flow, blockers, cadence'),
  ('AI Business Analyst','Turns observations into structured analysis','Analysis, requirements, acceptance criteria'),
  ('AI Governance Lead','Maps 4Ps risks, controls and evidence','Risk, control, evidence drafting'),
  ('AI Builder','Drafts build artefacts and automations','Build drafts, automation specs'),
  ('AI QA Reviewer','Checks acceptance criteria and golden tests','QA, golden tests, review gates'),
  ('AI Value Analyst','Quantifies KPI uplift and attribution','KPI, uplift, attribution drafts'),
  ('AI Report Writer','Drafts client and board reports','Report drafting')
) as v(role_name, role_description, responsibilities)
where not exists (select 1 from public.aaos_agent_roles a where a.role_name = v.role_name);
