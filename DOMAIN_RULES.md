# DOMAIN_RULES.md — AI Alpha OS scoring & domain logic

## 4Ps Governance (existing engine; reuse `aaos_four_ps_scores`)
Four Ps, five sub-dimensions each, scored 1–5 (1 Absent, 2 Aware, 3 Defined, 4 Operating, 5 Embedded).
- **P1 Primed:** leadership literacy, workforce literacy, data readiness, infrastructure readiness, use-case clarity
- **P2 Principled:** stated principles, decision rights, ethics review process, transparency standards, human-in-the-loop rules
- **P3 Practised:** use-case lifecycle, model lifecycle, operating cadence, team capability, vendor/partner discipline
- **P4 Protected:** risk inventory, regulatory alignment, model cards, audit trail, incident response

Each P max 25. Per-P band: **Red < 13, Amber 13–19, Green ≥ 20**. Overall max 100:
**Red < 52, Amber 52–76, Green ≥ 77**. Pre-sales scoring is **preliminary**; client-engagement scoring
is **evidence-based**. Scores of 4–5 should carry evidence notes.

## Agile AI Maturity (existing; reuse `aaos_agile_ai_scores`)
Dimensions (1–5): backlog quality, definition of done, delivery flow, human–AI teaming, review
discipline, automation readiness, KPI discipline. Total 7–35. Band: **Red ≤ 15, Amber 16–25,
Green ≥ 26**.

## AI Alpha Fit Score (Stage 0; reuse `aaos_company_scores`)
7 weighted dims /100: AI value potential 25, pain visibility 15, data/workflow readiness 15, buyer
accessibility 15, ability to pay 15, governance risk fit 10, strategic relevance 5.
Bands: 80–100 Priority, 70–79 Good, 60–69 Nurture, < 60 Reject/Low.

## AI Opportunity Prioritisation (`aaos_ai_opportunities`)
Transparent formula, shown in UI:
```
priority_score = (value_potential_score + urgency_score + confidence_score + strategic_fit_score)
               - (effort_score + risk_score)
```
Each component scored on a small integer scale (e.g. 1–5). Display the calculation, not just the total.
Also consider time-to-impact and measurability when ranking.

## KPI Attribution (`aaos_kpis`, `aaos_value_ledger`)
Always distinguish and label: **estimated** value, **validated** value, **client-agreed** value,
**disputed** value. Never exaggerate attribution. Always show assumptions and confidence
(Low/Medium/High). `calculated_uplift = actual − baseline` (sign depends on KPI direction); financial
value expressed as a low–high range.

## Monetisation (`aaos_monetisation_records`)
Commercial models: Fixed Fee, Subscription, Fixed Fee Plus Upside, Gain-Share, Warrant or Equity
Candidate, No Commercial Trigger. Default pricing placeholders (from Stage 0): Diagnostic £3,950;
90-Day Sprint £15k–£30k + optional upside; Operating Partner £2.5k–£10k/mo; gain-share 5–15% of agreed
verified uplift; warrant/equity → human review. **Human review mandatory** before any gain-share,
equity/warrant, invoice-from-uplift, or client-facing commercial claim.

## Consultant leverage (everywhere)
Classify each activity: **Fully Automatable / AI-Assisted / Human Only.** Capture old manual effort
(h), new AI-assisted effort (h), leverage factor (old/new), human review requirement, risk level, next
automation improvement. Targets: MVP ≥ 10×; long-term 20–50×. Command Centre shows current-month,
per-engagement, and per-workflow leverage.

## Risk scoring (`aaos_governance_risks`)
`risk_score = likelihood × impact` (each 1–5, so 1–25). RAG suggestion: Green ≤ 6, Amber 7–14,
Red ≥ 15. Each risk links to a 4Ps dimension and optionally an opportunity.
