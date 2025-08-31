-- A) Database Schema - AI-First Freelancer Profile & Matching Upgrade

-- A1. Tools catalog (curated, updatable)
CREATE TABLE IF NOT EXISTS public.tools_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,                            -- e.g., N8N, ElevenLabs, MCP
  slug TEXT UNIQUE GENERATED ALWAYS AS (lower(regexp_replace(name,'[^a-zA-Z0-9]+','-','g'))) STORED,
  category TEXT NOT NULL,                               -- 'Agent Building','Gen Media','Integrations','Automation','Data','Voice','RAG'
  is_certifiable BOOLEAN DEFAULT FALSE,                 -- we may certify this tool later
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER tools_master_updated_at
  BEFORE UPDATE ON public.tools_master
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- A2. Freelancer profile extensions (AI-first)
ALTER TABLE public.freelancer_profiles
  ADD COLUMN IF NOT EXISTS practical_skills TEXT[],           -- e.g., ['Agent Orchestration','RAG','Voice Agents']
  ADD COLUMN IF NOT EXISTS outcome_preferences TEXT[],         -- e.g., ['Sales uplift','Ops automation','Lead-gen']
  ADD COLUMN IF NOT EXISTS outcome_band_min INTEGER,           -- preferred outcome band (replace hourly focus)
  ADD COLUMN IF NOT EXISTS outcome_band_max INTEGER;

-- A3. Certifications (declared vs verified)
CREATE TABLE IF NOT EXISTS public.academy_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,              -- e.g., 'TS-N8N-BUILDER-L1'
  title TEXT NOT NULL,                    -- 'Teamsmiths N8N Builder L1'
  tool_slug TEXT REFERENCES public.tools_master(slug),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.freelancer_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,                  -- freelancer user id
  cert_code TEXT NOT NULL REFERENCES public.academy_certifications(code),
  status TEXT NOT NULL CHECK (status IN ('declared','verified','pending')),
  evidence_url TEXT,                      -- optional link (portfolio/drive)
  issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, cert_code)
);

-- A4. Case studies (internal & external)
CREATE TABLE IF NOT EXISTS public.case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,                          -- expert
  source TEXT NOT NULL CHECK (source IN ('teamsmiths','external')),
  title TEXT NOT NULL,
  summary TEXT,
  metrics JSONB DEFAULT '{}'::jsonb,              -- { "revenue_uplift_pct": 18, "hours_saved_per_week": 40 }
  tools TEXT[],
  industries TEXT[],
  evidence_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,              -- true for Teamsmiths-delivered or verified external
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER case_studies_updated_at
  BEFORE UPDATE ON public.case_studies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- A5. RLS essentials (new tables)

-- tools_master (readable, admin-writable)
ALTER TABLE public.tools_master ENABLE ROW LEVEL SECURITY;
CREATE POLICY tm_select ON public.tools_master FOR SELECT USING (true);
CREATE POLICY tm_modify ON public.tools_master FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- academy_certifications
ALTER TABLE public.academy_certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY ac_select ON public.academy_certifications FOR SELECT USING (true);
CREATE POLICY ac_modify ON public.academy_certifications FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- freelancer_certifications
ALTER TABLE public.freelancer_certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY fc_self ON public.freelancer_certifications
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY fc_insert_self ON public.freelancer_certifications
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY fc_update_self ON public.freelancer_certifications
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
                WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- case_studies
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
CREATE POLICY cs_self ON public.case_studies
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY cs_insert_self ON public.case_studies
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY cs_update_self ON public.case_studies
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
                WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Seed tools_master (idempotent)
INSERT INTO public.tools_master(name, category, is_certifiable) VALUES
('N8N','Agent Building',TRUE),
('OpenAI API','Integrations',TRUE),
('MCP (Model Context Protocol)','Agent Building',TRUE),
('ElevenLabs','Gen Media',TRUE),
('Zapier','Automation',FALSE),
('Airtable','Data',FALSE),
('Whisper','Voice',TRUE),
('LangChain','Agent Building',FALSE),
('Make','Automation',FALSE),
('Anthropic API','Integrations',TRUE),
('Supabase','Data',FALSE),
('Pinecone','RAG',TRUE),
('Retool','Automation',FALSE),
('Bubble','Automation',FALSE)
ON CONFLICT (name) DO NOTHING;