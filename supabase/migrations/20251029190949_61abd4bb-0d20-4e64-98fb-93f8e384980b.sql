
-- Fix security definer view by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.scorecard_leads_view;

CREATE VIEW public.scorecard_leads_view
WITH (security_invoker = true) AS
SELECT 
  id,
  lead_id,
  name,
  email,
  company,
  role,
  total_score,
  readiness_score,
  reach_score,
  prowess_score,
  protection_score,
  segment,
  source,
  utm_source,
  utm_medium,
  utm_campaign,
  crm_lead_status,
  last_contacted_at,
  booked_session,
  converted_to_project,
  created_at,
  updated_at
FROM public.scorecard_responses
ORDER BY created_at DESC;
