-- A) Lock down expert data
-- Revoke public access to v_experts and allow only service_role; set security_invoker
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_schema = 'public' AND table_name = 'v_experts'
  ) THEN
    EXECUTE 'REVOKE SELECT ON TABLE public.v_experts FROM anon, authenticated';
    EXECUTE 'ALTER VIEW public.v_experts SET (security_invoker = true)';
    EXECUTE 'GRANT SELECT ON TABLE public.v_experts TO service_role';
  END IF;
END $$;

-- Admin-only RPC for controlled expert access (no emails by default)
CREATE OR REPLACE FUNCTION public.admin_list_experts(
  p_q text DEFAULT NULL,
  p_limit int DEFAULT 100,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  expert_id uuid,
  full_name text,
  skills text[],
  tools text[],
  industries text[],
  locales text[],
  price_band_min int,
  price_band_max int,
  availability_weekly_hours int
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'not_authorized'; END IF;
  RETURN QUERY
  SELECT e.expert_id::uuid, e.full_name, e.skills, e.tools, e.industries, e.locales,
         e.price_band_min, e.price_band_max, e.availability_weekly_hours
  FROM public.v_experts e
  WHERE (p_q IS NULL OR e.full_name ILIKE '%'||p_q||'%')
  ORDER BY e.full_name NULLS LAST
  LIMIT p_limit OFFSET p_offset;
END$$;
GRANT EXECUTE ON FUNCTION public.admin_list_experts(text,int,int) TO authenticated;

-- B) Make “shadow experts” safe and consistent
-- Ensure at least one of user_id or shadow_user_id is present; add unique partial indexes
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fp_user_or_shadow_not_null' AND conrelid = 'public.freelancer_profiles'::regclass
  ) THEN
    ALTER TABLE public.freelancer_profiles
      ADD CONSTRAINT fp_user_or_shadow_not_null
      CHECK (user_id IS NOT NULL OR shadow_user_id IS NOT NULL);
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS ux_fp_user 
  ON public.freelancer_profiles(user_id) 
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_fp_shadow 
  ON public.freelancer_profiles(shadow_user_id) 
  WHERE shadow_user_id IS NOT NULL;

-- C) Stabilise RLS and stop recursion: ensure helper is SECURITY DEFINER + STABLE
CREATE OR REPLACE FUNCTION public.is_org_member(_org_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_orgs uo 
    WHERE uo.org_id=_org_id AND uo.user_id=_user_id
  );
$$;

-- G) Close scanner warnings: revoke anon on sensitive tables and admin views
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='profiles') THEN
    EXECUTE 'REVOKE ALL ON TABLE public.profiles FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='freelancer_profiles') THEN
    EXECUTE 'REVOKE ALL ON TABLE public.freelancer_profiles FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='expert_invites') THEN
    EXECUTE 'REVOKE ALL ON TABLE public.expert_invites FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='briefs') THEN
    EXECUTE 'REVOKE ALL ON TABLE public.briefs FROM anon';
  END IF;
END $$;

DO $$ DECLARE v text; BEGIN
  FOR v IN 
    SELECT table_name 
    FROM information_schema.views 
    WHERE table_schema='public' AND table_name LIKE 'admin_v_%'
  LOOP
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon', v);
  END LOOP;
END $$;