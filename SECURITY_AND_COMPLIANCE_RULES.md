# SECURITY_AND_COMPLIANCE_RULES.md

## Claims — never state or imply
- guaranteed outcomes · legal advice · investment/financial advice
- ISO/IEC 42001 certification · EU AI Act compliance certification · GDPR compliance certification
- full compliance certification · external audit replacement · lawyer replacement

## Allowed wording
- preliminary assessment · readiness support · governance mapping · evidence preparation
- gap identification · risk flagging · KPI attribution support
- **human review required** · **external legal/compliance/certification review required where applicable**

Framework mappings (EU AI Act, NIST AI RMF, ISO/IEC 42001, ISO 27001-adjacent, GDPR, SOC 2, UK AI
principles) are **readiness mapping and evidence preparation only**, never certification.

## Human review mandatory before
- converting an accepted prospect into a paid client engagement
- sharing a diagnostic, 90-day plan, or any client-facing report
- marking a client-facing story Done
- closing a governance risk · sharing a framework mapping externally
- marking KPI attribution client-agreed · monetising value
- proposing gain-share, equity, or warrant routes
- any legal/regulatory/compliance wording used externally

The UI must visibly show the gate ("Requires Human Review") and must not allow the gated transition
until approved.

## Technical security
- No secrets in the repo. No API keys in client code. No **service role key** in frontend — service
  role is used only inside edge functions (`Deno.env`). Frontend uses the publishable anon key only.
- **RLS admin-only** on every `aaos_*` table (`public.is_admin(auth.uid())`). No public read.
- Migrations are **additive**; no drop/rename of existing tables without explicit owner approval.
- No live external integrations or autonomous agents with external write access in this phase.
- Portfolio patterns are **anonymised by default**; never expose confidential client detail unless
  explicitly marked safe.
- Minimise personal-data storage; record contact source + lawful basis on any outreach (Stage 0).
