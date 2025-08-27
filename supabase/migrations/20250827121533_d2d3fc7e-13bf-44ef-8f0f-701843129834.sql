-- Add shadow_user_id column to freelancer_profiles first
ALTER TABLE public.freelancer_profiles ADD COLUMN IF NOT EXISTS shadow_user_id UUID;

-- A1. Create resilient experts view used by all matching code
CREATE OR REPLACE VIEW public.v_experts AS
SELECT
  COALESCE(fp.user_id, fp.shadow_user_id) as expert_id,
  COALESCE(p.full_name, 'Unknown Expert') as full_name,
  p.email,
  fp.skills,
  fp.tools,
  fp.industries,
  fp.locales,
  fp.price_band_min,
  fp.price_band_max,
  fp.availability_weekly_hours,
  fp.outcome_history
FROM public.freelancer_profiles fp
LEFT JOIN public.profiles p
  ON p.user_id = COALESCE(fp.user_id, fp.shadow_user_id);

-- Grant access to the view
GRANT SELECT ON public.v_experts TO authenticated, anon, service_role;

-- A4. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_briefs_origin ON public.briefs (origin);
CREATE INDEX IF NOT EXISTS idx_briefs_status ON public.briefs (status);
CREATE INDEX IF NOT EXISTS idx_briefs_created_at ON public.briefs (created_at);

-- Create matching_runs table for traceability
CREATE TABLE IF NOT EXISTS public.matching_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES public.briefs(id),
  candidates_found INTEGER NOT NULL DEFAULT 0,
  min_score NUMERIC NOT NULL,
  max_invites INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on matching_runs
ALTER TABLE public.matching_runs ENABLE ROW LEVEL SECURITY;

-- Admin-only access to matching_runs
CREATE POLICY "Admins can manage matching_runs"
ON public.matching_runs
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));