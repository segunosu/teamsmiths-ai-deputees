# WORKFLOW_SPEC.md — AI Alpha OS workflows

Each workflow names the data it reads/writes, the human-review gate, and the leverage capture.

## Workflow 1 — Accepted Prospect → Client
Trigger: `aaos_companies.status` ∈ {Accepted, Onboarded}. Show **"Create Client Workspace"**
(or **"Open Client Workspace"** if one already exists for that company).
On create (idempotent — never duplicate a client for the same company):
1. Insert `aaos_clients` (`company_id`, `created_from_company_id`, name/sector/region copied as
   convenience fields; status `Active`).
2. Insert default `aaos_engagements` (type from `accepted_offer_route`, status `Draft`); set
   `aaos_clients.current_engagement_id`.
3. Insert shells: `aaos_diagnostics` (Draft), opportunity backlog (none yet), KPI baseline note.
4. `logActivity('client created', …, company_id, client_id)`.
Prior data (scores, signals, snapshots, outreach, proposal route, onboarding, value hypotheses,
activity) stays on the company and is read through `client.company_id`. **Gate:** conversion into a
paid client is a human decision.

## Workflow 2 — Diagnostic → 90-Day Plan
Client → `aaos_diagnostic_inputs` (interview/doc/signal/process/KPI/observation) → generate
`aaos_diagnostics` summary (findings, top opportunities, top risks, readiness, value potential,
recommended 90-day focus) → links to 4Ps (`aaos_four_ps_scores`) and Agile AI
(`aaos_agile_ai_scores`) → KPI baseline → **90-Day AI Alpha Plan** report. **Gate:** review before share.

## Workflow 3 — Opportunity → Sprint
Selected `aaos_ai_opportunities` (status `Selected for Sprint`) → `aaos_sprints` →
`generateSprintStories` creates `aaos_stories` (title, user story, acceptance criteria, definition of
done, owner type, points). High-risk stories also get golden_test + rollback note + `human_review_required`.
Board flow: Inbox → Ready → In Progress → Needs Review → Done (Blocked/Rejected/Deferred branches).
**Rule:** a story with `human_review_required` cannot be `Done` unless `review_status = Approved`.
Sprint close records review + retro notes and AI vs human points → sprint leverage factor.

## Workflow 4 — Governance
4Ps dimension → `aaos_governance_risks` (likelihood × impact = risk_score, RAG) →
`aaos_controls` (mitigation) → `aaos_evidence_items` (status Missing→Current→Approved) →
`aaos_framework_mappings` (EU AI Act / NIST / ISO 42001 / GDPR / SOC2 / UK). **Gate:** human review
before closing a risk or sharing a mapping. Readiness mapping only — never certification.

## Workflow 5 — Value Attribution
Opportunity → KPI baseline → target → actual → uplift → `aaos_value_ledger`
(financial_value_low/high, attribution_confidence, attribution_notes, client_agreed
Pending/Yes/No/Disputed) → optional monetisation trigger. **Gate:** human review before client-agreed
or monetisation. Always distinguish estimated / validated / client-agreed / disputed value.

## Workflow 6 — Monetisation
`aaos_value_ledger` → `aaos_monetisation_records` (commercial_model, trigger_status, invoice_status).
**Gate (mandatory):** human review before gain-share, equity/warrant, invoice-from-uplift, or any
client-facing commercial claim.

## Workflow 7 — Portfolio Learning
Completed engagement/sprint/opportunity → `aaos_portfolio_patterns` (anonymised by default) +
`aaos_benchmarks`. Never expose confidential client detail unless explicitly marked safe.

## Workflow 8 — Narrative Intelligence (cross-cutting)
Anywhere: write `aaos_narrative_notes` (freeform, typed). **"Analyse Observation"** →
`aaos_narrative_suggestions` (suggested_item_type, title, reasoning, confidence, related 4Ps/KPI) shown
in a review panel with Accept / Edit / Reject. On Accept, create the target record and stamp
`applied_entity_type/id` on the suggestion. Original note always preserved and back-linked.

## Generation services (template-first, AI-upgradeable)
`generateDiagnostic`, `generateOpportunityMap`, `generateSprintStories`, `generateGovernanceRisks`,
`generateControls`, `generateEvidenceChecklist`, `generateKpiAttributionReport`,
`generateMonetisationReview`, `generateBoardPack`, `generatePortfolioPattern`,
`analyseNarrativeObservation`. Each stores input-data-used, content, assumptions, confidence, review
status, generated_at.
