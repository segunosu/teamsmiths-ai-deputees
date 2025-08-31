-- ============================================================================
-- AI-First Freelancer Matching: Complete Schema + Security + Seeding
-- ============================================================================

-- 1.1 Tools Master Table
CREATE TABLE IF NOT EXISTS public.tools_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE GENERATED ALWAYS AS (lower(regexp_replace(name,'[^a-zA-Z0-9]+','-','g'))) STORED,
  category TEXT NOT NULL,
  is_certifiable BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER tools_master_updated_at
  BEFORE UPDATE ON public.tools_master
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 1.2 Extend freelancer_profiles with AI-first fields
ALTER TABLE public.freelancer_profiles
  ADD COLUMN IF NOT EXISTS practical_skills TEXT[],
  ADD COLUMN IF NOT EXISTS outcome_preferences TEXT[],
  ADD COLUMN IF NOT EXISTS outcome_band_min INTEGER,
  ADD COLUMN IF NOT EXISTS outcome_band_max INTEGER;

-- 1.3 Academy Certifications
CREATE TABLE IF NOT EXISTS public.academy_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  tool_slug TEXT REFERENCES public.tools_master(slug),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1.4 Freelancer Certifications
CREATE TABLE IF NOT EXISTS public.freelancer_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cert_code TEXT NOT NULL REFERENCES public.academy_certifications(code),
  status TEXT NOT NULL CHECK (status IN ('declared','verified','pending')),
  evidence_url TEXT,
  issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, cert_code)
);

-- 1.5 Case Studies
CREATE TABLE IF NOT EXISTS public.case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('teamsmiths','external')),
  title TEXT NOT NULL,
  summary TEXT,
  metrics JSONB DEFAULT '{}'::jsonb,
  tools TEXT[],
  industries TEXT[],
  evidence_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER case_studies_updated_at
  BEFORE UPDATE ON public.case_studies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 1.6 Admin Tool Suggestions
CREATE TABLE IF NOT EXISTS public.admin_tool_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name TEXT NOT NULL,
  user_id UUID NOT NULL,
  rationale TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1.7 Matching Runs (traceability)
CREATE TABLE IF NOT EXISTS public.matching_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES public.briefs(id),
  candidates_found INTEGER NOT NULL DEFAULT 0,
  min_score NUMERIC NOT NULL,
  max_invites INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- 2. RLS POLICIES - Secure by default, self-service for freelancers
-- ============================================================================

-- 2.1 Tools Master (public read, admin modify)
ALTER TABLE public.tools_master ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS tm_select ON public.tools_master FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS tm_modify ON public.tools_master FOR ALL
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 2.2 Academy Certifications (public read, admin modify)
ALTER TABLE public.academy_certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS ac_select ON public.academy_certifications FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS ac_modify ON public.academy_certifications FOR ALL
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 2.3 Freelancer Certifications (self + admin)
ALTER TABLE public.freelancer_certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS fc_self ON public.freelancer_certifications
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY IF NOT EXISTS fc_insert_self ON public.freelancer_certifications
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY IF NOT EXISTS fc_update_self ON public.freelancer_certifications
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- 2.4 Case Studies (self + admin)
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS cs_self ON public.case_studies
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY IF NOT EXISTS cs_insert_self ON public.case_studies
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY IF NOT EXISTS cs_update_self ON public.case_studies
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- 2.5 Tool Suggestions (self + admin)
ALTER TABLE public.admin_tool_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS ats_insert_self ON public.admin_tool_suggestions
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS ats_view_own ON public.admin_tool_suggestions
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY IF NOT EXISTS ats_admin_manage ON public.admin_tool_suggestions
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 2.6 Matching Runs (admin only)
ALTER TABLE public.matching_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS mr_admin ON public.matching_runs FOR ALL
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ============================================================================
-- 3. SECURE EXPERT VIEW - Service role only, no email leakage
-- ============================================================================

-- Drop existing v_experts to avoid conflicts
DROP VIEW IF EXISTS public.v_experts;

-- Recreate without emails to prevent accidental leakage
CREATE VIEW public.v_experts AS
SELECT
  COALESCE(fp.user_id, fp.shadow_user_id) AS expert_id,
  COALESCE(p.full_name, 'Unknown Expert') AS full_name,
  fp.skills, fp.tools, fp.industries, fp.locales,
  fp.practical_skills, fp.outcome_preferences,
  fp.price_band_min, fp.price_band_max,
  fp.outcome_band_min, fp.outcome_band_max,
  fp.availability_weekly_hours,
  fp.outcome_history
FROM public.freelancer_profiles fp
LEFT JOIN public.profiles p ON p.user_id = COALESCE(fp.user_id, fp.shadow_user_id);

-- Security: service role only
REVOKE ALL ON TABLE public.v_experts FROM anon, authenticated;
GRANT SELECT ON public.v_experts TO service_role;

-- ============================================================================
-- 4. ADMIN RPCS - Secure access without direct table exposure
-- ============================================================================

-- 4.1 Admin RPC for experts (without emails)
CREATE OR REPLACE FUNCTION public.admin_list_experts(
  p_q text DEFAULT NULL,
  p_limit int DEFAULT 100,
  p_offset int DEFAULT 0
) RETURNS TABLE (
  expert_id uuid,
  full_name text,
  skills text[], tools text[], industries text[], locales text[],
  practical_skills text[], outcome_preferences text[],
  price_band_min int, price_band_max int,
  outcome_band_min int, outcome_band_max int,
  availability_weekly_hours int
) LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'not_authorized'; END IF;
  RETURN QUERY
  SELECT e.expert_id::uuid, e.full_name, e.skills, e.tools, e.industries, e.locales,
         e.practical_skills, e.outcome_preferences, 
         e.price_band_min, e.price_band_max, e.outcome_band_min, e.outcome_band_max,
         e.availability_weekly_hours
  FROM public.v_experts e
  WHERE (p_q IS NULL OR e.full_name ILIKE '%'||p_q||'%')
  ORDER BY e.full_name NULLS LAST
  LIMIT p_limit OFFSET p_offset;
END $$;

GRANT EXECUTE ON FUNCTION public.admin_list_experts(text,int,int) TO authenticated;

-- 4.2 Enhanced admin matching settings RPCs
CREATE OR REPLACE FUNCTION public.admin_get_matching_settings()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  result jsonb := '{}'::jsonb;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN 
    RAISE EXCEPTION 'not_authorized'; 
  END IF;
  
  -- Get matching settings with defaults
  SELECT COALESCE(
    jsonb_object_agg(setting_key, setting_value),
    '{"min_score_default": 0.65, "max_invites_default": 5, "boost_verified_certs": true, "normalize_region_rates": true, "hide_hourly_rates": true, "tool_synonyms": {}, "industry_synonyms": {}}'::jsonb
  ) INTO result
  FROM public.admin_settings
  WHERE setting_key IN (
    'min_score_default',
    'max_invites_default', 
    'boost_verified_certs',
    'normalize_region_rates',
    'hide_hourly_rates',
    'tool_synonyms',
    'industry_synonyms'
  );
  
  -- Ensure all defaults exist
  IF NOT (result ? 'min_score_default') THEN
    result := result || '{"min_score_default": 0.65}'::jsonb;
  END IF;
  IF NOT (result ? 'max_invites_default') THEN
    result := result || '{"max_invites_default": 5}'::jsonb;
  END IF;
  IF NOT (result ? 'boost_verified_certs') THEN
    result := result || '{"boost_verified_certs": true}'::jsonb;
  END IF;
  IF NOT (result ? 'normalize_region_rates') THEN
    result := result || '{"normalize_region_rates": true}'::jsonb;
  END IF;
  IF NOT (result ? 'hide_hourly_rates') THEN
    result := result || '{"hide_hourly_rates": true}'::jsonb;
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
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  key text;
  value jsonb;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN 
    RAISE EXCEPTION 'not_authorized'; 
  END IF;
  
  -- Update each setting individually
  FOR key, value IN SELECT * FROM jsonb_each(p_settings) LOOP
    IF key IN ('min_score_default', 'max_invites_default', 'boost_verified_certs', 'normalize_region_rates', 'hide_hourly_rates', 'tool_synonyms', 'industry_synonyms') THEN
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

-- ============================================================================
-- 5. SEED DATA - Curated choices for AI-first matching
-- ============================================================================

-- 5.1 Seed Tools (certifiable AI-first tools)
INSERT INTO public.tools_master (name, category, is_certifiable) VALUES
('N8N', 'Agent Building', true),
('MCP', 'Agent Building', true),
('OpenAI API', 'Integrations', true),
('Anthropic API', 'Integrations', true),
('ElevenLabs', 'Gen Media', true),
('Whisper', 'Voice', true),
('Pinecone', 'RAG', true),
('LangChain', 'Agent Building', false),
('Supabase', 'Data', false),
('Airtable', 'Data', false),
('Zapier', 'Automation', false),
('Make', 'Automation', false),
('Retool', 'Automation', false),
('Bubble', 'Automation', false)
ON CONFLICT (name) DO NOTHING;

-- 5.2 Seed Academy Certifications
INSERT INTO public.academy_certifications (code, title, tool_slug) VALUES
('N8N-BASIC', 'N8N Automation Specialist', 'n8n'),
('MCP-BASIC', 'Model Context Protocol Expert', 'mcp'),
('OPENAI-API', 'OpenAI Integration Expert', 'openai-api'),
('ANTHROPIC-API', 'Anthropic Claude Specialist', 'anthropic-api'),
('ELEVENLABS-VOICE', 'ElevenLabs Voice Generation Expert', 'elevenlabs'),
('WHISPER-STT', 'Whisper Speech-to-Text Specialist', 'whisper'),
('PINECONE-RAG', 'Pinecone Vector DB Expert', 'pinecone')
ON CONFLICT (code) DO NOTHING;

-- 5.3 Insert default admin settings
INSERT INTO public.admin_settings (setting_key, setting_value) VALUES
('min_score_default', '0.65'),
('max_invites_default', '5'),
('boost_verified_certs', 'true'),
('normalize_region_rates', 'true'), 
('hide_hourly_rates', 'true'),
('tool_synonyms', '{"OpenAI": ["GPT", "ChatGPT"], "N8N": ["n8n.io"], "Anthropic": ["Claude"], "Pinecone": ["Vector DB"]}'),
('industry_synonyms', '{"SaaS": ["Software", "Tech"], "E-commerce": ["eCommerce", "Online Retail"], "Fintech": ["Financial Services"]}')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = excluded.setting_value;