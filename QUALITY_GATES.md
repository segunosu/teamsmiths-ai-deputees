# QUALITY_GATES.md

A change is not "done" until every applicable gate passes.

### Gate 1 — Existing functionality
The Client Search & Acceptance Engine (Stage 0) still loads and works: companies list, detail tabs,
scoring, snapshot/outreach/proposal generation, acceptance gate, onboarding. No regression.

### Gate 2 — Vertical spine
One accepted prospect can move end-to-end:
Accepted Prospect → Client → Engagement → Diagnostic → Opportunity → Sprint → KPI → Value Ledger →
Report (and onward to Monetisation / Portfolio Pattern / Command Centre).

### Gate 3 — Traceability
Every client links back to its source company; every engagement to a client; every
opportunity/sprint/story/KPI/value/report/risk/control/evidence back up the chain. No orphan records.

### Gate 4 — Human review
Required review gates are visible (`Requires Human Review`) and enforced: a client-facing story cannot
be Done unless approved; monetisation/commercial claims and client-facing reports require review.

### Gate 5 — Build quality
`npm run build` passes. `npx tsc --noEmit` is clean. (ESLint has pre-existing `no-explicit-any` noise
across the repo — match existing code; it is not a deploy gate.)

### Gate 6 — Security
No secrets in repo. No service role key in frontend. Migrations additive (no drop/rename without
approval). RLS admin-only on all `aaos_*`. No unsupported certification/legal/investment claims.

### Gate 7 — UX
A senior consultant can tell what to do next within 60 seconds on the Command Centre and each
workspace. Decision-led, not decorative. See `UX_PRINCIPLES.md`.

### Gate 8 — Leverage
Core workflows display automation category and consultant effort reduction (old vs new effort,
leverage factor) where practical.

## Review thresholds (from the harness)
Architecture ≥ 9/10 · Domain usefulness ≥ 9/10 · UX ≥ 8.5/10 · Data attribution ≥ 9/10 ·
Security/risk with no unresolved critical/high · build passes · Stage 0 intact · spine works end-to-end.
