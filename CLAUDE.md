# CLAUDE.md — AI Alpha OS build rules

This repo is the live **teamsmiths.ai** app (Lovable-hosted, GitHub-synced). It contains the
production marketing/platform site **and** the **AI Alpha OS** module (footer link "Agile AI Alpha",
routes under `/agile-ai-alpha`). Read this before changing anything in `src/agile-ai-alpha/` or
`supabase/`.

## Who builds what
- **Claude Code is the primary builder.** Do all application logic, UI, scoring engines, generation
  services, workflow logic, schema migrations, and repo changes in code.
- **Lovable** hosts the app and manages Lovable Cloud Supabase. Involve Lovable **only** for
  Lovable-specific actions (hosting, deployment, env vars, platform settings, sync). See `LOVABLE_RULES.md`.
- **GitHub** is the source of truth. **Lovable Cloud Supabase** (project `iyqsbjawaampgcavsgcz`) is the
  managed backend. Pushing to `main` auto-deploys.

## Golden rules
1. **Do not rebuild Stage 0.** The Client Search & Acceptance Engine (`aaos_companies` + scoring +
   snapshot/outreach/proposal/onboarding) already works. Extend it; never duplicate or break it.
2. **Extend, don't duplicate.** Reuse `aaos_companies`, `aaos_kpis`, `aaos_value_hypotheses`,
   `aaos_activity_log`, the 4Ps/Agile scoring, and `aaos-generate`. New entities are prefixed `aaos_`.
3. **Preserve traceability.** Every client links to its source company; every engagement to a client;
   every opportunity/sprint/story/KPI/value/report back up the chain. Never create orphan records.
4. **Maximise consultant leverage.** Classify each workflow as Fully Automatable / AI-Assisted /
   Human Only, and capture old vs new effort + leverage factor where practical.
5. **Human review gates are mandatory** before: converting an accepted prospect into a paid client,
   sharing a diagnostic/plan/report, marking a client-facing story Done, closing a governance risk,
   sharing a framework mapping, agreeing KPI attribution, monetising value, or proposing
   gain-share/equity/warrant. The UI must visibly show "Requires Human Review".
6. **No false claims.** Never claim guaranteed outcomes, legal/investment advice, ISO/EU AI Act/GDPR
   certification, or auditor/lawyer replacement. Use "readiness support", "preliminary assessment",
   "governance mapping", "evidence preparation", "risk flagging", "human review required". See
   `SECURITY_AND_COMPLIANCE_RULES.md`.

## Hard safety rules
- Never drop or rename existing tables without explicit owner approval. Migrations are **additive**.
- Never hard-code secrets. Never put a Supabase **service role key** in frontend code (service role is
  used only inside edge functions via `Deno.env`).
- All `aaos_*` tables are admin-only via RLS `public.is_admin(auth.uid())`. New tables must follow this.
- No live external integrations (Companies House, Apollo, Clay, LinkedIn, email send, autonomous agents
  with external write access) in this phase unless already configured. See `BACKLOG.md`.

## Working method
- Build in small, testable increments. Build the **vertical spine first** (see `ARCHITECTURE.md`).
- Before completion run: `npm run build` and `npx tsc --noEmit` (lint has pre-existing `no-explicit-any`
  noise — match existing code; it is not a deploy gate). See `QUALITY_GATES.md`.
- After each sprint, report: files changed, schema changes, features done, regression check, build
  results, known limitations, Lovable actions required, next sprint. Log decisions in `DECISION_LOG.md`.

## Key facts
- Stack: Vite + React 18 + TypeScript + Tailwind + shadcn/ui + react-router-dom + @tanstack/react-query
  + recharts + zod. Toasts via `sonner`.
- Supabase client: `@/integrations/supabase/client`. Types: `@/integrations/supabase/types`
  (regenerate after every migration via the Supabase MCP; it is the canonical generated file).
- Admin gate component: `@/components/admin/AdminOnly` (checks `profiles.is_admin`).
- AI generation edge function: `aaos-generate` — Lovable AI Gateway primary (Gemini 2.5), OpenAI GPT-5
  fallback. `LOVABLE_API_KEY` must be enabled in Lovable to use Lovable AI (else GPT-5 fallback runs).
