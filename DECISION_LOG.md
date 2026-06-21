# DECISION_LOG.md

Append-only record of architectural and product decisions. Newest at top.

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
