-- Business case studies table for Powerful Results section
CREATE TABLE IF NOT EXISTS public.business_case_studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  client_profile text,
  short_summary text,
  challenge text,
  solution text,
  timeline_days numeric,
  deliverables jsonb,
  results jsonb,
  measurement text,
  quote text,
  assumptions jsonb,
  roi_example text,
  cta_primary text,
  cta_primary_url text,
  cta_secondary text,
  cta_secondary_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_case_studies ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "business_case_studies_public_select" ON public.business_case_studies
  FOR SELECT USING (true);

-- Admin manage
CREATE POLICY "business_case_studies_admin_all" ON public.business_case_studies
  FOR ALL USING (is_admin(auth.uid()));

-- Seed data
INSERT INTO public.business_case_studies (slug, title, client_profile, short_summary, challenge, solution, timeline_days, deliverables, results, measurement, quote, assumptions, roi_example, cta_primary, cta_primary_url, cta_secondary, cta_secondary_url)
VALUES 
(
  'proposal-speedup',
  'Proposal Speed-Up — Agency growth with faster proposals',
  'Sarah, owner of a 12-person digital agency focusing on B2B SaaS marketing.',
  '+28% proposals/week; proposals ready 37% faster.',
  'Manual proposal creation, repeat rework and inconsistent collateral caused slow turnaround. Typical time-to-proposal: 48 hours. Low proposal velocity limited pipeline momentum.',
  'Deployed the Proposal Speed-Up pack (10-day engagement). AI Deputy ran an intake chat with Sarah to capture offering tiers, pricing bands and past proposal examples and generated a reusable template library and pre-filled proposal drafts per buyer persona. Matched a vetted freelancer to finalise tone & set up an automated CRM → proposal pipeline (templates, inline personalization tokens, and an approval milestone).',
  10,
  '["5 proposal templates (SME, Mid, Enterprise, One-pager, Executive summary)", "Template library integrated into CRM (CSV import + Docx/HTML export)", "Automation script for personalization + email sequence", "Training doc + 30-min handover call"]'::jsonb,
  '[{"value":"+28%","label":"proposals/week"},{"value":"-37%","label":"time-to-proposal"}]'::jsonb,
  'CRM issue logs, proposal send timestamps before/after, and weekly proposal counts (4-week comparison).',
  E'"We started sending more proposals with far less effort — pipeline speed doubled." — Sarah, Agency Owner.',
  '["Baseline proposals/week = 25", "conversion = 12%", "avg deal = £3,000", "Extra proposals/week = 7"]'::jsonb,
  'Extra proposals/week = 7 → ~0.84 extra wins/week → ~£2,520/week revenue uplift → annualised ~£131k (assuming steady state).',
  'Use this pack',
  '/catalog#proposal-speedup',
  'Discuss customization',
  '/customize?pack=proposal-speedup'
),
(
  'quote-booster',
  'Quote Booster — Construction services accelerate quoting',
  'Marcus, owner of a mid-sized construction services firm handling retrofit projects.',
  '32% faster quotes; win rate +11% after targeted quoting.',
  'Complex cost breakdowns and manual quote authoring meant long quote cycles; customers sourced alternate bids during delay. Typical time-to-quote 10 business days; win rate ~22%.',
  'Implemented the Quote Booster flow (3-week sprint). AI Deputy parsed standard job templates, historical quote success data, and margin constraints to auto-produce modular quotes by scope and optional add-ons. Matched a pricing specialist freelancer to review and refine margins and uplift messaging. Integrated quotes with e-sign and follow-up automation to reduce friction.',
  21,
  '["Modular quote templates", "Pricing rules engine", "E-sign integration", "Follow-up nurture sequences"]'::jsonb,
  '[{"value":"-32%","label":"time-to-quote"},{"value":"+11%","label":"win rate"}]'::jsonb,
  'Quote creation timestamps (CRM), win/loss tracking over 90 days.',
  E'"We''re losing fewer jobs because we can respond quickly with clear options." — Marcus, Construction Owner.',
  '["Monthly quotes = 30", "baseline wins = 6.6 (~22%)", "+11% = +3.3 wins"]'::jsonb,
  'If monthly quotes = 30, baseline wins = 6.6 (~22%), +11% = +3.3 wins → multiply by avg job value to estimate revenue.',
  'Use this pack',
  '/catalog#quote-booster',
  'Discuss customization',
  '/customize?pack=quote-booster'
),
(
  'cashflow-nudges',
  'Cashflow Nudges — Consulting firm reduces DSO',
  'Anna, Director at a 40-person consulting firm with recurring retainer and milestone billing.',
  'DSO down 17%; 22% fewer aged invoices after nudges.',
  'Slow payments increased cash-pressure; many invoices aged past 30 days. Baseline DSO ~45 days.',
  'Deployed Cashflow Nudges (2.5 week sprint) — invoice reminders, automated tailored chase sequences, and AI-generated follow-up messaging that reduces friction and keeps tone client-specific. Setup escalation rules: friendly email → personalised reminder → account manager phone touchpoints for critical accounts.',
  17.5,
  '["Automation sequences", "Email templates", "RAG scoring for late risk", "Weekly monitoring dashboard"]'::jsonb,
  '[{"value":"-17%","label":"DSO"},{"value":"-22%","label":"aged invoices"}]'::jsonb,
  'AR ledger reports (pre/post), DSO rolling 90-day window.',
  E'"We freed working capital and reduced stress — collections are far more predictable." — Anna, Consulting Director.',
  '["Baseline DSO = 45 days", "Target DSO = ~37.4 days"]'::jsonb,
  'Reduced DSO from 45 days to ~37.4 days, freeing working capital.',
  'Use this pack',
  '/catalog#cashflow-nudges',
  'Discuss customization',
  '/customize?pack=cashflow-nudges'
),
(
  'meeting-to-minutes',
  'Meeting-to-Minutes — Operations team automation',
  'Tom, Operations Lead at a logistics SME handling regional operations and daily standups.',
  'Saves 15 hours/week; team efficiency +45% with meeting automation.',
  'Long meetings with poor action follow-up; staff duplicated work and action items slipped.',
  'Implemented Meeting-to-Minutes (1.5 week pack). Use of call transcription (or pasted recordings) + AI Deputy that generates concise minutes, decision log, and prioritized action items automatically; tasks imported to project board. Human QA reviewer verifies critical action items and assigns owners.',
  10.5,
  '["Meeting minutes automation", "Action item import templates", "Weekly metrics dashboard"]'::jsonb,
  '[{"value":"15 hrs","label":"saved/week"},{"value":"+45%","label":"team efficiency"}]'::jsonb,
  'Time tracking logs and task completion rate pre/post 6 weeks.',
  E'"We spend far less time in admin and more time doing the work that matters." — Tom, Operations Lead.',
  '["Baseline admin time = 33 hrs/week", "Target = 18 hrs/week"]'::jsonb,
  '15 hours saved per week across operations team, allowing focus on high-value work.',
  'Use this pack',
  '/catalog#meeting-to-minutes',
  'Discuss customization',
  '/customize?pack=meeting-to-minutes'
),
(
  'new-hire-onboarding',
  'New Hire Onboarding Kit — Retail chain success',
  'Lisa, Head of HR at a retail chain with frequent seasonal hires.',
  'New hires reach productivity 50% faster; retention +35%.',
  'Long ramp for new staff; inconsistent training increased churn and onboarding costs.',
  'Rolled out New Hire Onboarding Kit (3.5 week pack). AI Deputy created role-specific micro-learning modules from existing SOPs, generated a 30-day micro-training calendar, and auto-created test/assessment checkpoints. Light-touch human coaching sessions for managers to calibrate expectations.',
  24.5,
  '["Micro-learning library", "Onboarding checklist", "Progress dashboard", "1-hour manager coaching package"]'::jsonb,
  '[{"value":"-50%","label":"time to productivity"},{"value":"+35%","label":"retention"}]'::jsonb,
  'Time-to-productivity metrics from performance checklists and retention rate within 90 days.',
  E'"We onboard staff faster and keep them longer — seasonal hire chaos reduced." — Lisa, Retail Owner.',
  '["Previous ramp = 8 weeks", "New ramp = 4 weeks", "90-day retention increased"]'::jsonb,
  'Reduced time to full productivity from 8 weeks to 4 weeks; 35% improvement in 90-day retention.',
  'Use this pack',
  '/catalog#new-hire-onboarding',
  'Discuss customization',
  '/customize?pack=new-hire-onboarding'
),
(
  'follow-up-engine',
  'Follow-Up Engine — Startup response boost',
  'David, founder of a SaaS startup with a small sales team and stretched resources.',
  'Client response +29%; saves 12 hours/week in follow-up admin.',
  'Leads and customers were slipping cold between initial contact and follow-up sequences; team spent hours manually chasing.',
  'Deployed Follow-Up Engine (8-day pack). AI Deputy sequences personalized follow-ups based on past engagement signals and drafts concise, variant-tested messages. Integration with outbound channels (email + CRM). Human QA ensures tone-appropriateness for high-value prospects.',
  8,
  '["Follow-up templates", "Behaviour-triggered sequences", "Analytics dashboard"]'::jsonb,
  '[{"value":"+29%","label":"response rate"},{"value":"12 hrs","label":"saved weekly"}]'::jsonb,
  'Reply rates and time logs for outbound follow-up tasks pre/post.',
  E'"We get replies faster and our SDRs finally focus on demos not admin." — David, Startup Founder.',
  '["Baseline response rate", "Target response rate +29%", "Team size = 3 SDRs"]'::jsonb,
  '29% increase in client response rate with 12 hours saved weekly across sales team.',
  'Use this pack',
  '/catalog#follow-up-engine',
  'Discuss customization',
  '/customize?pack=follow-up-engine'
);