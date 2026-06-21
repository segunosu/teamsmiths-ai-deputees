# BUILD_CONTRACT.md — architecture lock

Locks the plan before Stage 1+ feature coding. No destructive schema change is required, so the build
may proceed against this contract. Update this file if the plan changes.

## 1. Current-state repo summary
Vite + React 18 + TS + Tailwind + shadcn + react-router v6 + react-query. Lovable-hosted, GitHub-synced
(`segunosu/teamsmiths-ai-deputees`), Lovable Cloud Supabase `iyqsbjawaampgcavsgcz`. `npm run build` and
`npx tsc --noEmit` pass. Module lives at `src/agile-ai-alpha/`; routes in `src/App.tsx` (AdminOnly).

## 2. Existing Client Search & Acceptance Engine (Stage 0)
`/agile-ai-alpha` dashboard, Companies list, Company detail (11 tabs), Value Ledger, Settings. Scoring
(fit/4Ps/agile) in `lib/scoring.ts`. Generation via `aaos-generate` edge function. 12 Stage-0 tables,
admin-only RLS, 5 seeded demo companies. Footer link "Agile AI Alpha" below "Amplify".

## 3. Existing tables/types
See DATA_MODEL.md. Types generated to `src/integrations/supabase/types.ts`. Constants/enums mirrored in
`src/agile-ai-alpha/constants.ts`.

## 4. Tables to preserve (do not duplicate/alter destructively)
`aaos_companies`, `aaos_company_scores`, `aaos_company_signals`, `aaos_four_ps_scores`,
`aaos_agile_ai_scores`, `aaos_snapshots`, `aaos_outreach_drafts`, `aaos_proposal_routes`,
`aaos_onboarding_tasks`, `aaos_value_hypotheses`, `aaos_activity_log`.

## 5. Tables to extend
`aaos_kpis` (+ client_id, engagement_id, opportunity_id, data_source, actual_date, confidence_level) —
DONE in migration `20260621104315`.

## 6. New tables added (DONE, migration `20260621104315`)
`aaos_clients, aaos_engagements, aaos_diagnostics, aaos_diagnostic_inputs, aaos_ai_opportunities,
aaos_sprints, aaos_stories, aaos_agent_roles, aaos_evidence_items, aaos_governance_risks,
aaos_controls, aaos_framework_mappings, aaos_value_ledger, aaos_monetisation_records,
aaos_portfolio_patterns, aaos_benchmarks, aaos_reports, aaos_narrative_notes,
aaos_narrative_suggestions`. All admin-only RLS, updated_at triggers, indexed, agent roles seeded.

## 7. Route / page plan (under `/agile-ai-alpha`)
- `command-centre` (new primary cockpit; existing dashboard remains)
- `clients`, `clients/:id` (Client Workspace, tabbed)
- `engagements/:id` (Engagement Workspace)
- `clients/:id/diagnostic`, `.../opportunities`, `.../sprints` (Sprint Board), `.../governance`,
  `.../evidence`, `.../value-ledger`, `.../monetisation`, `.../reports`
- `portfolio` (Portfolio Learning), `monetisation` (portfolio-wide)
- Keep existing Companies/Company detail; add **Create/Open Client Workspace** on accepted companies.

## 8. Component plan
Extend `AlphaLayout` nav. New: `NarrativeNotes` panel + `NarrativeReviewPanel`, `SprintBoard` columns,
`ClientWorkspaceTabs`, `OpportunityScorePanel`, `RiskHeatMap`, generic `GenerateButton`. Reuse
`RagBadge`, `HumanReviewBadge`, `CompanyDialog` patterns, react-query + `logActivity`.

## 9. Workflow integration plan
See WORKFLOW_SPEC.md (8 workflows). Conversion is idempotent; generators are template-first in `lib/`.

## 10. Data traceability plan
Every new record carries `client_id` (+ `engagement_id` where relevant) and the chain back to
`company_id`. FKs encoded; UI shows back-links.

## 11. Human review gate plan
Conversion, diagnostic/plan/report sharing, client-facing story Done, risk closure, framework mapping
share, KPI client-agreed, all monetisation. Enforced in UI + visible badges.

## 12. Testing plan
ACCEPTANCE_TESTS.md (#5–#20). Each sprint: `npm run build` + `npx tsc --noEmit` + manual route/CRUD +
regression of Stage 0. Specialist reviewers (`.claude/agents/*`) before declaring done.

## 13. Risks & mitigations
- Scope creep → cost-scope-controller + spine-first. 
- Type drift after migrations → regenerate types every time.
- Lovable AI not enabled → GPT-5 fallback already in place; flagged in LOVABLE_RULES.md.
- Generated types file is large → write via Node from the MCP output (don't hand-edit).

## 14. Lovable-specific actions required
- Enable Lovable AI to provision `LOVABLE_API_KEY` (else GPT-5 fallback). No other Lovable action
  needed; schema + functions are code/MCP-managed and sync via `main`.

## 15. Vertical-spine acceptance test (the lock)
For the seeded "Pennine Precision Engineering" (Accepted): Create Client Workspace → engagement →
diagnostic → 3 opportunities → select 1 → sprint → 5 stories (1 review-gated) → KPI baseline+actual →
value ledger uplift → monetisation review → board report → portfolio pattern → all visible on the
Command Centre with leverage factor. When this passes end-to-end, the spine is done.

## Build order (sprints)
S1 Conversion + Client/Engagement workspaces · S2 Diagnostic · S3 Opportunities · S4 Sprint board ·
S5 Governance/Evidence · S6 KPI/Value Ledger · S7 Monetisation · S8 Portfolio · S9 Reports ·
S10 Command Centre + hardening. Narrative layer added incrementally across S1–S10 at each entity.
