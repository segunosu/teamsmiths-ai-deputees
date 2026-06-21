# ACCEPTANCE_TESTS.md — manual acceptance tests

Run logged in as an admin (`profiles.is_admin = true`, e.g. `segun.osu@teamsmiths.com`) at
`/agile-ai-alpha`. ✅ = passing now (Stage 0); ⬜ = pending Stage 1+ build.

## Stage 0 — existing engine (must never regress)
1. ✅ `/agile-ai-alpha` Command/Dashboard loads.
2. ✅ Companies list shows seeded prospects; filters/search/CSV export work.
3. ✅ Company detail tabs (Overview, Signals, AI Alpha Score, 4Ps, Agile, Snapshot, Outreach,
   Proposal, Onboarding, Value Ledger, Activity) load and save.
4. ✅ Accepted company shows an acceptance decision; snapshot/outreach/proposal generate.

## Stage 1+ — vertical spine (to verify as built)
5. ⬜ An Accepted/Onboarded company shows **"Create Client Workspace"**.
6. ⬜ Clicking it creates a client + default engagement + diagnostic/opportunity/KPI shells.
7. ⬜ Re-clicking shows **"Open Client Workspace"** — no duplicate client created.
8. ⬜ Client links back to the original company (visible + navigable).
9. ⬜ A diagnostic can be created and collect inputs; summary draft generates; review state works.
10. ⬜ An AI opportunity can be created and scored (priority formula shown).
11. ⬜ An opportunity can be selected for sprint and generate sprint stories.
12. ⬜ A story requiring human review **cannot** be marked Done until approved.
13. ⬜ A KPI baseline can be created; an actual KPI entered.
14. ⬜ Value uplift can be calculated; attribution confidence + client-agreed state recorded.
15. ⬜ Monetisation review can be triggered (gain-share requires human review).
16. ⬜ A governance risk can link to a 4Ps dimension; a control links to the risk; evidence links to
    the control; a framework mapping links to evidence.
17. ⬜ A report can be generated (Markdown) and requires human review before sharing.
18. ⬜ A portfolio pattern can be captured (anonymised by default).
19. ⬜ A narrative note can be written anywhere; **Analyse Observation** proposes suggestions into a
    review panel (Accept/Edit/Reject); nothing auto-applies; original note preserved.
20. ⬜ Command Centre shows: accepted prospects awaiting conversion, active clients/engagements, top
    opportunities, sprints at risk, stories needing review, top risks, missing evidence, KPI movement,
    value created, monetisation triggers, reports to review, patterns captured, leverage factor.

## Build
21. ✅ `npm run build` passes. ✅ `npx tsc --noEmit` clean.
