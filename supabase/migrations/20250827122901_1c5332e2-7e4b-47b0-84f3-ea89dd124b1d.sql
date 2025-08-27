-- Fix the security definer view issue by recreating the view properly
DROP VIEW IF EXISTS public.v_experts;

-- Create the view without security definer (which is the default and safe)
CREATE VIEW public.v_experts AS
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

-- Grant explicit access to the view
GRANT SELECT ON public.v_experts TO authenticated, anon, service_role;