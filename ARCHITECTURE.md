# ARCHITECTURE.md — AI Alpha OS

## Current app (post-inspection)
- **Framework:** Vite 5 + React 18 + TypeScript. **Package manager:** npm (bun lockfiles also present).
- **UI:** Tailwind + shadcn/ui (`src/components/ui/*`), lucide-react icons, `sonner` toasts,
  recharts, react-hook-form + zod.
- **Routing:** `react-router-dom` v6, all routes declared in `src/App.tsx` above a catch-all `*`.
- **Auth:** Supabase auth via `src/contexts/AuthContext.tsx` (`useAuth()`); admin gate
  `src/components/admin/AdminOnly.tsx` checks `profiles.is_admin`.
- **Backend:** Lovable Cloud Supabase, project `iyqsbjawaampgcavsgcz`. Client at
  `src/integrations/supabase/client.ts`; generated types at `src/integrations/supabase/types.ts`.
- **Edge functions:** `supabase/functions/*` (Deno). Registered in `supabase/config.toml`.
- **Build:** `npm run build` (vite, esbuild transform — no type gate). Type check: `npx tsc --noEmit`
  (currently clean). Lint: `eslint .` (pre-existing `no-explicit-any` noise; not a deploy gate).

## AI Alpha OS module layout (`src/agile-ai-alpha/`)
```
constants.ts            enums, scoring config, default lists
types.ts                Row type aliases (Tables<'aaos_*'>)
lib/scoring.ts          fit / 4Ps / agile calculators + RAG bands
lib/generation.ts       invokes the aaos-generate edge function
lib/activity.ts         logActivity() -> aaos_activity_log
components/             AlphaLayout (subnav), RagBadge, CompanyDialog, tabs/*
pages/                  AlphaDashboard, AlphaCompanies, AlphaCompanyDetail, AlphaValueLedger, AlphaSettings
```
New Stage-1+ work extends this tree: add `pages/` for Command Centre, Clients, Engagements,
Diagnostics, Opportunities, Sprint Board, Governance, Evidence, Reports, Portfolio, Monetisation; add
`components/` (e.g. `NarrativeNotes`, board columns); add `lib/` generators per `WORKFLOW_SPEC.md`.

## Conventions
- Tables prefixed `aaos_`; columns `snake_case`; React files `PascalCase`; hooks/util `camelCase`.
- Data access: `supabase.from('aaos_*')` with `@tanstack/react-query`; query keys
  `["aaos_<thing>", id]`. Write paths call `logActivity(...)` and invalidate relevant queries.
- Dropdowns: native `<select className="h-10 rounded-md border bg-background px-3 text-sm">` or shadcn
  Select. RAG via `RagBadge`/`RagDot`. Human review via `HumanReviewBadge`.
- Generation services live in `lib/*` and call the `aaos-generate` edge function (server-side keys).
  Every generated artefact stores: input data used, content, assumptions, confidence, review status,
  generated_at.

## The vertical spine (build this end-to-end before broad polish)
```
Accepted Prospect (aaos_companies)
  → Client (aaos_clients)
  → Engagement (aaos_engagements)
  → Diagnostic (aaos_diagnostics + aaos_diagnostic_inputs)
  → AI Opportunity (aaos_ai_opportunities)
  → Sprint (aaos_sprints) → Story (aaos_stories)
  → KPI (aaos_kpis) → Value Ledger (aaos_value_ledger)
  → Monetisation Review (aaos_monetisation_records)
  → Report (aaos_reports)
  → Portfolio Pattern (aaos_portfolio_patterns)
  → Command Centre (reads across all of the above)
```
If this spine does not work for one demo client, the platform is not ready.

## Data flow
Prospect data created in Stage 0 is **never copied**; the client links to the company by id and reads
prior scores/signals/snapshots/etc. through that relationship. All downstream records carry
`client_id` + `engagement_id` for traceability and the Command Centre/Value Ledger aggregate by them.

## Generation / AI
`aaos-generate` edge function: Lovable AI Gateway (Gemini 2.5 pro/flash) primary, OpenAI GPT-5 fallback.
Future generators (`generateDiagnostic`, `generateOpportunityMap`, `generateSprintStories`,
`generateGovernanceRisks`, `generateControls`, `generateEvidenceChecklist`,
`generateKpiAttributionReport`, `generateMonetisationReview`, `generateBoardPack`,
`generatePortfolioPattern`) should be template-first and AI-upgradeable behind the same `lib/` interface.
