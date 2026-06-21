# UX_PRINCIPLES.md

The UI is operator-first, decision-led, clean, fast, and boardroom-credible. Not decorative, not
dashboard theatre. Built for one senior consultant using it daily.

Every major screen must answer, at a glance:
- What matters? · What changed? · What is blocked? · What needs review? · What is the next best
  action? · Where is the value? · Where is the risk? · What can be monetised?

## Patterns to use
- Cards, tables, tabs, status badges. **Red/Amber/Green** for risk and maturity (`RagBadge`/`RagDot`).
- Visible **"Requires Human Review"** labels (`HumanReviewBadge`) wherever a gate applies.
- Action buttons named for the decision: **Create Client Workspace**, **Open Client Workspace**,
  **Generate**, **Analyse Observation**, **Approve**, **Reject**, **Move to Sprint**, **Capture Pattern**.
- Consistent module sub-nav (`AlphaLayout`); breadcrumb back-links preserving traceability.
- Narrative input available at key points (a notes panel), with an Analyse → review-panel flow.

## Anti-patterns
- No clutter, no vanity charts, no deep form mazes. Don't force tick-boxes where a sentence is better —
  support freeform narrative and let the platform structure it (with human approval).
- Don't bury the next action. The Command Centre and each workspace surface it explicitly.

## The 60-second test
Drop a senior consultant onto the Command Centre cold: within 60 seconds they should know which client
needs attention, what to convert, what's blocked, what needs review, and where the value/risk is.
