# DECISION_LOG.md

Append-only record of architectural and product decisions. Newest at top.

## 2026-07-10 — "Add prospect" on the Prospects view (workflow audit fix)
**Decision:** The Prospects page (Pipeline overview) had no create affordance — companies could only be
added from the Companies register, breaking the "add a prospect" mental model. Added an "Add prospect"
button on AlphaDashboard reusing the existing CompanyDialog (no new entity, no schema change; a
prospect IS an aaos_companies row with status "New").
**Context:** Full workflow audit confirmed UI paths exist for: fit scoring + 4Ps (company tabs),
outreach drafts, acceptance decision (Overview tab), convert-to-client banner (Accepted/Onboarded),
diagnostics + opportunities + sprints + governance risks/evidence/artefacts + KPIs/value/monetisation/
reports/patterns (client sections, each with GenerateButton + manual add). Gates: tsc clean, build clean.

## 2026-07-09 — Journey-first IA refactor (navigation & naming only)
**Decision:** Collapse the AI Alpha OS navigation from 8 top-level items + 13 client tabs to 6 + 5,
grouped by delivery journey. Purely presentational: no schema changes, no section-component changes,
Stage 0 untouched, all old `?tab=` deep links still resolve.
- Top nav: Today (Command Centre) · Pipeline (Prospects + Companies via pills) · Clients ·
  Playbooks (Artefact studio + Portfolio patterns via pills) · Value · Settings.
- Client workspace: Overview · Diagnose · Deliver · Governance · Value, with inner pills
  (e.g. Governance = Risks & controls / Evidence / Artefacts — "Gov. Artefacts" label removed).
- Added `JourneyRail.tsx`: journey stepper (Prospect → Diagnose → Deliver → Govern → Prove value)
  and a Next-best-action card, derived from head-count queries only (spine-safe, no writes).
- Marketing header/footer hidden on /agile-ai-alpha routes (`MarketingChrome` gate in App.tsx).
**Why:** "Governance" appeared 3–4× on one screen with different meanings; nav mirrored database
tables, not the consultant's job. Gates run: `npx tsc --noEmit` clean, `npm run build` clean.


## 2026-06-21 — AI Alpha OS extension harness + data model
- Lovable Cloud Supabase (`iyqsbjawaampgcavsgcz`) is the backend; Claude Code is primary builder;
  Lovable only for platform-specific tasks; GitHub `main` auto-deploys.
- Existing Client Search & Acceptance Engine (Stage 0) is preserved; the extension is **additive**.
- New entities are prefixed `aaos_` and extend (not duplicate) existing tables. `aaos_kpis` extended
  with client/engagement/opportunity links rather than creating a parallel KPI table.
- Build the **vertical spine** before broad polish.
- **Template-first generation** is acceptable before deeper AI integration; the `aaos-generate` edge
  function (Lovable AI primary, OpenAI GPT-5 fallback) is the AI path.
- **Human review gates are mandatory** for conversion, client-facing reports, governance closure, KPI
  attribution agreement, and all monetisation/commercial claims.
- **No false claims** (certification/legal/investment/guaranteed outcomes). Readiness language only.
- No live external integrations or autonomous external-write agents in this phase.
- **Narrative Intelligence Layer** added (`aaos_narrative_notes` + `aaos_narrative_suggestions`):
  suggestions go to a review panel; nothing is auto-applied; the source note is always preserved.
- Tables prefixed `aaos_` (consistent with `amplify_`/`engine_` modules in the same DB); admin-only RLS
  via `public.is_admin(auth.uid())`; `updated_at` trigger reused.

## 2026-06-21 — Stage 0 AI provider
- `aaos-generate` switched to Lovable AI Gateway (snapshot `google/gemini-2.5-pro`, outreach/proposal
  `google/gemini-2.5-flash`) with OpenAI GPT-5 fallback. `gpt-4o-mini` dropped (legacy).

## 2026-06-21 — Stage 0 build
- AI Alpha OS Client Search & Acceptance Engine built as an integrated module at `/agile-ai-alpha`,
  admin-gated, footer link below "Amplify". Tag `stage-0-client-search-acceptance-engine`.
