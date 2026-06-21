# DATA_MODEL.md — AI Alpha OS

Backend: Lovable Cloud Supabase `iyqsbjawaampgcavsgcz`. All `aaos_*` tables have **admin-only RLS**
(`public.is_admin(auth.uid())`) and an `updated_at` trigger (`public.update_updated_at_column`).
Migrations are **additive only** and live in `supabase/migrations/`.

## Stage 0 — existing (preserve, extend; do NOT duplicate)
- `aaos_companies` — prospects/companies (status workflow, acceptance_decision, accepted_offer_route…)
- `aaos_company_scores` — AI Alpha Fit Score (7 dims /100) + leverage fields
- `aaos_company_signals` — public/observed signals
- `aaos_four_ps_scores` — 4Ps governance (preliminary at pre-sales)
- `aaos_agile_ai_scores` — Agile AI maturity (7 dims)
- `aaos_snapshots`, `aaos_outreach_drafts`, `aaos_proposal_routes`, `aaos_onboarding_tasks`
- `aaos_kpis` *(extended)*, `aaos_value_hypotheses`, `aaos_activity_log`

## Stage 1+ — new (migration `20260621104315_aaos_alpha_os_extension_schema.sql`)
| Table | Purpose | Key links |
|---|---|---|
| `aaos_clients` | Active client created from an accepted company | `company_id`, `created_from_company_id` → `aaos_companies`; `current_engagement_id` → `aaos_engagements` |
| `aaos_engagements` | Unit of client work | `client_id` → clients; `company_id` |
| `aaos_diagnostics` | AI Alpha Diagnostic per engagement | `client_id`, `engagement_id` |
| `aaos_diagnostic_inputs` | Inputs feeding a diagnostic | `diagnostic_id` |
| `aaos_ai_opportunities` | Scored AI value opportunities | `client_id`, `engagement_id`, `diagnostic_id` |
| `aaos_sprints` | Delivery sprints | `client_id`, `engagement_id` |
| `aaos_stories` | Scrum stories on the board | `sprint_id`, `opportunity_id`, `client_id`, `engagement_id` |
| `aaos_agent_roles` | Workflow AI roles (seeded; not autonomous) | — |
| `aaos_evidence_items` | 4Ps governance evidence | `client_id`, `engagement_id`; `four_p_dimension` |
| `aaos_governance_risks` | Risks linked to 4Ps + opportunities | `client_id`, `related_opportunity_id` |
| `aaos_controls` | Controls mitigating risks | `related_risk_id`, `evidence_item_id` |
| `aaos_framework_mappings` | EU AI Act / NIST / ISO 42001 / GDPR / SOC2 / UK | `related_control_id`, `related_evidence_item_id` |
| `aaos_value_ledger` | KPI uplift → financial value + attribution | `opportunity_id`, `kpi_id`, `evidence_item_id` |
| `aaos_monetisation_records` | Commercial models, triggers, invoice status | `value_ledger_id` |
| `aaos_portfolio_patterns` | Reusable, anonymised-by-default patterns | `source_client_id` |
| `aaos_benchmarks` | Sector/size benchmarks | — |
| `aaos_reports` | Generated Markdown reports | `client_id`, `engagement_id` |
| `aaos_narrative_notes` | Narrative Intelligence Layer freeform notes | generic `entity_type`/`entity_id`, `company_id`, `client_id`, `engagement_id` |
| `aaos_narrative_suggestions` | Structured suggestions extracted from a note (review-panel; never auto-applied) | `narrative_note_id` |

### `aaos_kpis` extension (additive columns)
`client_id`, `engagement_id`, `opportunity_id`, `data_source`, `actual_date`, `confidence_level`.

## Traceability contract (enforced by FKs + UI)
`company → client → engagement → {diagnostic, opportunity} → {sprint → story} / {kpi → value_ledger →
monetisation} / {risk → control → evidence → framework_mapping} → report → portfolio_pattern`.
Every new record must carry the ids needed to walk back to the originating company. Use
`on delete set null` for soft links and `cascade` for owned children (already encoded in the migration).

## Enum/status references
See `DOMAIN_RULES.md` for 4Ps, Agile AI, opportunity scoring, KPI attribution and monetisation rules.
Status check-constraints are encoded in the migration (single source of truth) and mirrored in
`src/agile-ai-alpha/constants.ts` for the UI.

## RLS / security
Admin-only on every table. Service role keys are used only inside edge functions. No public read.
Regenerate `src/integrations/supabase/types.ts` via the Supabase MCP after any schema change.
