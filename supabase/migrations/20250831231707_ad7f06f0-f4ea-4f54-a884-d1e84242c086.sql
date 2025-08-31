-- ============================================================================
-- AI-First Freelancer Matching: Complete Schema + Security + Seeding (Fixed)
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

-- Add trigger if table was created
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tools_master_updated_at') THEN
    CREATE TRIGGER tools_master_updated_at
      BEFORE UPDATE ON public.tools_master
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

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
  tool_slug TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add FK constraint if table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'academy_certifications_tool_slug_fkey') THEN
    ALTER TABLE public.academy_certifications 
    ADD CONSTRAINT academy_certifications_tool_slug_fkey 
    FOREIGN KEY (tool_slug) REFERENCES public.tools_master(slug);
  END IF;
END$$;

-- 1.4 Freelancer Certifications
CREATE TABLE IF NOT EXISTS public.freelancer_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cert_code TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('declared','verified','pending')),
  evidence_url TEXT,
  issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, cert_code)
);

-- Add FK constraint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'freelancer_certifications_cert_code_fkey') THEN
    ALTER TABLE public.freelancer_certifications 
    ADD CONSTRAINT freelancer_certifications_cert_code_fkey 
    FOREIGN KEY (cert_code) REFERENCES public.academy_certifications(code);
  END IF;
END$$;

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

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'case_studies_updated_at') THEN
    CREATE TRIGGER case_studies_updated_at
      BEFORE UPDATE ON public.case_studies
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

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

-- 1.7 Matching Runs (traceability) - only if briefs table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'briefs') THEN
    CREATE TABLE IF NOT EXISTS public.matching_runs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      brief_id UUID NOT NULL REFERENCES public.briefs(id),
      candidates_found INTEGER NOT NULL DEFAULT 0,
      min_score NUMERIC NOT NULL,
      max_invites INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      metadata JSONB DEFAULT '{}'::jsonb
    );
  END IF;
END$$;

-- ============================================================================
-- 2. RLS POLICIES - Secure by default, self-service for freelancers
-- ============================================================================

-- 2.1 Tools Master (public read, admin modify)
ALTER TABLE public.tools_master ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS tm_select ON public.tools_master;
DROP POLICY IF EXISTS tm_modify ON public.tools_master;

CREATE POLICY tm_select ON public.tools_master FOR SELECT USING (true);
CREATE POLICY tm_modify ON public.tools_master FOR ALL
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 2.2 Academy Certifications (public read, admin modify)
ALTER TABLE public.academy_certifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ac_select ON public.academy_certifications;
DROP POLICY IF EXISTS ac_modify ON public.academy_certifications;

CREATE POLICY ac_select ON public.academy_certifications FOR SELECT USING (true);
CREATE POLICY ac_modify ON public.academy_certifications FOR ALL
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 2.3 Freelancer Certifications (self + admin)
ALTER TABLE public.freelancer_certifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS fc_self ON public.freelancer_certifications;
DROP POLICY IF EXISTS fc_insert_self ON public.freelancer_certifications;
DROP POLICY IF EXISTS fc_update_self ON public.freelancer_certifications;

CREATE POLICY fc_self ON public.freelancer_certifications
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY fc_insert_self ON public.freelancer_certifications
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY fc_update_self ON public.freelancer_certifications
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- 2.4 Case Studies (self + admin)
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cs_self ON public.case_studies;
DROP POLICY IF EXISTS cs_insert_self ON public.case_studies;
DROP POLICY IF EXISTS cs_update_self ON public.case_studies;

CREATE POLICY cs_self ON public.case_studies
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY cs_insert_self ON public.case_studies
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY cs_update_self ON public.case_studies
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- 2.5 Tool Suggestions (self + admin)
ALTER TABLE public.admin_tool_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ats_insert_self ON public.admin_tool_suggestions;
DROP POLICY IF EXISTS ats_view_own ON public.admin_tool_suggestions;
DROP POLICY IF EXISTS ats_admin_manage ON public.admin_tool_suggestions;

CREATE POLICY ats_insert_self ON public.admin_tool_suggestions
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY ats_view_own ON public.admin_tool_suggestions
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY ats_admin_manage ON public.admin_tool_suggestions
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 2.6 Matching Runs (admin only) - only if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matching_runs') THEN
    ALTER TABLE public.matching_runs ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS mr_admin ON public.matching_runs;
    CREATE POLICY mr_admin ON public.matching_runs FOR ALL
      USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
  END IF;
END$$;

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