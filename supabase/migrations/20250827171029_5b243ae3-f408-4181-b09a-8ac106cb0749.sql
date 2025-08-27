-- ============= Matching Settings & Expert Discovery Hardening =============

-- 1) Admin-only RPC wrappers for matching settings
CREATE OR REPLACE FUNCTION public.admin_get_matching_settings()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  result jsonb := '{}'::jsonb;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN 
    RAISE EXCEPTION 'not_authorized'; 
  END IF;
  
  -- Get matching settings with defaults
  SELECT COALESCE(
    jsonb_object_agg(setting_key, setting_value),
    '{"min_score_default": 0.65, "max_invites_default": 5, "auto_match_enabled": false, "tool_synonyms": {}, "industry_synonyms": {}}'::jsonb
  ) INTO result
  FROM public.admin_settings
  WHERE setting_key IN (
    'min_score_default',
    'max_invites_default', 
    'auto_match_enabled',
    'tool_synonyms',
    'industry_synonyms'
  );
  
  -- Ensure defaults exist
  IF NOT (result ? 'min_score_default') THEN
    result := result || '{"min_score_default": 0.65}'::jsonb;
  END IF;
  IF NOT (result ? 'max_invites_default') THEN
    result := result || '{"max_invites_default": 5}'::jsonb;
  END IF;
  IF NOT (result ? 'auto_match_enabled') THEN
    result := result || '{"auto_match_enabled": false}'::jsonb;
  END IF;
  IF NOT (result ? 'tool_synonyms') THEN
    result := result || '{"tool_synonyms": {}}'::jsonb;
  END IF;
  IF NOT (result ? 'industry_synonyms') THEN
    result := result || '{"industry_synonyms": {}}'::jsonb;
  END IF;
  
  RETURN result;
END$$;

CREATE OR REPLACE FUNCTION public.admin_update_matching_settings(p_settings jsonb)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  key text;
  value jsonb;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN 
    RAISE EXCEPTION 'not_authorized'; 
  END IF;
  
  -- Update each setting individually
  FOR key, value IN SELECT * FROM jsonb_each(p_settings) LOOP
    IF key IN ('min_score_default', 'max_invites_default', 'auto_match_enabled', 'tool_synonyms', 'industry_synonyms') THEN
      INSERT INTO public.admin_settings (setting_key, setting_value, updated_at, updated_by)
      VALUES (key, value, now(), auth.uid())
      ON CONFLICT (setting_key)
      DO UPDATE SET 
        setting_value = excluded.setting_value,
        updated_at = now(),
        updated_by = auth.uid();
    END IF;
  END LOOP;
END$$;

-- Grant execution to authenticated users (admin check is inside function)
GRANT EXECUTE ON FUNCTION public.admin_get_matching_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_matching_settings(jsonb) TO authenticated;

-- 2) Resilient experts view (service-role only)
CREATE OR REPLACE VIEW public.v_experts AS
SELECT
  coalesce(fp.user_id, fp.shadow_user_id) as expert_id,
  coalesce(p.full_name, 'Unknown Expert') as full_name,
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
  ON p.user_id = coalesce(fp.user_id, fp.shadow_user_id);

-- Lock down the view: only service role can access
REVOKE ALL ON public.v_experts FROM anon, authenticated;
ALTER VIEW public.v_experts SET (security_invoker = true);
GRANT SELECT ON public.v_experts TO service_role;

-- 3) Performance indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_briefs_origin ON public.briefs(origin);
CREATE INDEX IF NOT EXISTS idx_briefs_status ON public.briefs(status);  
CREATE INDEX IF NOT EXISTS idx_briefs_created_at ON public.briefs(created_at);
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_user_id ON public.freelancer_profiles(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_shadow_user_id ON public.freelancer_profiles(shadow_user_id) WHERE shadow_user_id IS NOT NULL;

-- 4) Shadow expert integrity (if not already exists)
-- Add shadow_user_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'freelancer_profiles' 
    AND column_name = 'shadow_user_id'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.freelancer_profiles ADD COLUMN shadow_user_id uuid;
  END IF;
END$$;

-- Ensure at least one ID exists
ALTER TABLE public.freelancer_profiles
  DROP CONSTRAINT IF EXISTS fp_user_or_shadow_not_null;

ALTER TABLE public.freelancer_profiles
  ADD CONSTRAINT fp_user_or_shadow_not_null
  CHECK (user_id IS NOT NULL OR shadow_user_id IS NOT NULL);

-- Unique indexes for both id types
DROP INDEX IF EXISTS ux_fp_user;
DROP INDEX IF EXISTS ux_fp_shadow;

CREATE UNIQUE INDEX ux_fp_user 
  ON public.freelancer_profiles(user_id) 
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX ux_fp_shadow
  ON public.freelancer_profiles(shadow_user_id) 
  WHERE shadow_user_id IS NOT NULL;