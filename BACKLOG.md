# BACKLOG.md — intentionally deferred

These are deliberately NOT built in the current phase. Do not implement without explicit owner sign-off.

## External integrations (need credentials + compliance sign-off)
- Companies House enrichment · Clay · Apollo · LinkedIn automation
- Email sending automation (outreach send) · CRM sync
- Live web scraping / website scanners

## Autonomy
- Autonomous agents with **external write access** to client systems
- Auto-applying narrative suggestions or AI score changes without human approval

## Platform / commercial
- Full multi-tenant client portal · investor portal
- Full payment/invoice integration · automated certification workflows
- Automated legal contract generation
- Private AI model hosting

## Nice-to-have
- PDF/DOCX export of reports/snapshots (Markdown is the MVP format; add if straightforward)
- CSV **import** of companies (export already exists)
- Real-time collaboration / comments
- Per-workflow analytics beyond the leverage factor

## Stage 0 carry-overs
- Connector layer for auto-populating companies + signals (Apollo key exists; needs compliance review)
- Reduce `no-explicit-any` lint debt across the repo (cosmetic; not gating)
