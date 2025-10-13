-- Add category field to business_case_studies for linking to Solutions page sections
ALTER TABLE public.business_case_studies 
ADD COLUMN category text;

-- Update existing records with their business function categories
UPDATE public.business_case_studies SET category = 'sales' WHERE slug IN ('proposal-speedup', 'quote-booster', 'follow-up-engine');
UPDATE public.business_case_studies SET category = 'finance' WHERE slug = 'cashflow-nudges';
UPDATE public.business_case_studies SET category = 'operations' WHERE slug = 'meeting-to-minutes';
UPDATE public.business_case_studies SET category = 'hr' WHERE slug = 'new-hire-onboarding';