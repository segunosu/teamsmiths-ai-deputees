
-- Add CRM tracking fields to scorecard_responses if not exists
ALTER TABLE public.scorecard_responses
ADD COLUMN IF NOT EXISTS crm_synced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS crm_lead_status TEXT DEFAULT 'new',
ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS booked_session BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS converted_to_project BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create index for faster CRM queries
CREATE INDEX IF NOT EXISTS idx_scorecard_crm_status ON public.scorecard_responses(crm_lead_status);
CREATE INDEX IF NOT EXISTS idx_scorecard_segment ON public.scorecard_responses(segment);
CREATE INDEX IF NOT EXISTS idx_scorecard_email ON public.scorecard_responses(email);

-- Create view for CRM dashboard
CREATE OR REPLACE VIEW public.scorecard_leads_view AS
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

-- Grant access to view
GRANT SELECT ON public.scorecard_leads_view TO authenticated;
GRANT SELECT ON public.scorecard_leads_view TO anon;
