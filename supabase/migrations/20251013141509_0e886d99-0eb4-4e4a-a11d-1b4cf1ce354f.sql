-- Update case study CTAs to link to specific matching business wins
UPDATE public.business_case_studies 
SET cta_primary_url = '/solutions#proposal_speed_up'
WHERE slug = 'proposal-speedup';

UPDATE public.business_case_studies 
SET cta_primary_url = '/solutions#quote_booster'
WHERE slug = 'quote-booster';

UPDATE public.business_case_studies 
SET cta_primary_url = '/solutions#cashflow_nudges'
WHERE slug = 'cashflow-nudges';

UPDATE public.business_case_studies 
SET cta_primary_url = '/solutions#meeting_to_minutes'
WHERE slug = 'meeting-to-minutes';

UPDATE public.business_case_studies 
SET cta_primary_url = '/solutions#onboarding_kit'
WHERE slug = 'new-hire-onboarding';

UPDATE public.business_case_studies 
SET cta_primary_url = '/solutions#follow_up_engine'
WHERE slug = 'follow-up-engine';