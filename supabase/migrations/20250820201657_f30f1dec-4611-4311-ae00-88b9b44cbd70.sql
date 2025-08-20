-- Admin Reporting & Operations System
-- Create comprehensive views, indexes, and RPC functions for admin reporting

-- =====================================================
-- 1. DATABASE VIEWS (read-only, admin accessible only)
-- =====================================================

-- FREELANCERS VIEW
CREATE OR REPLACE VIEW admin_v_freelancers AS
SELECT
  p.user_id,
  p.full_name,
  p.email,
  fp.skills,
  fp.price_band_min,
  fp.price_band_max,
  fp.availability_weekly_hours,
  COALESCE(prj_stats.active_projects, 0) AS active_projects,
  COALESCE(prj_stats.completed_projects, 0) AS completed_projects,
  COALESCE(prj_stats.csat_avg, 0)::numeric(4,2) AS csat_avg,
  p.created_at
FROM public.profiles p
LEFT JOIN public.freelancer_profiles fp ON fp.user_id = p.user_id
LEFT JOIN LATERAL (
  SELECT
    SUM(CASE WHEN pr.status IN ('active','awaiting_client','in_review') THEN 1 ELSE 0 END) AS active_projects,
    SUM(CASE WHEN pr.status = 'completed' THEN 1 ELSE 0 END) AS completed_projects,
    AVG(NULLIF((pr.title),'')::numeric) AS csat_avg -- placeholder for CSAT data
  FROM public.projects pr
  JOIN public.project_participants pp ON pp.project_id = pr.id AND pp.user_id = p.user_id
) prj_stats ON true;

-- AGENCIES VIEW
CREATE OR REPLACE VIEW admin_v_agencies AS
SELECT
  a.id AS agency_id,
  a.name,
  a.website,
  a.created_at,
  COUNT(DISTINCT am.user_id) AS members,
  SUM(CASE WHEN pr.status IN ('active','awaiting_client','in_review') THEN 1 ELSE 0 END) AS active_projects,
  SUM(CASE WHEN pr.status = 'completed' THEN 1 ELSE 0 END) AS completed_projects
FROM public.agencies a
LEFT JOIN public.agency_members am ON am.agency_id = a.id
LEFT JOIN public.projects pr ON pr.agency_id = a.id
GROUP BY a.id, a.name, a.website, a.created_at;

-- CLIENT ORGS VIEW
CREATE OR REPLACE VIEW admin_v_client_orgs AS
SELECT
  o.id AS org_id,
  o.name,
  o.billing_email,
  o.created_at,
  COUNT(DISTINCT pr.id) AS total_projects,
  SUM(CASE WHEN pr.status IN ('active','awaiting_client','in_review') THEN 1 ELSE 0 END) AS active_projects,
  SUM(CASE WHEN pr.status = 'completed' THEN 1 ELSE 0 END) AS completed_projects,
  COALESCE(SUM(pr.total_price),0) AS gross_value_gbp
FROM public.orgs o
LEFT JOIN public.projects pr ON pr.org_id = o.id
GROUP BY o.id, o.name, o.billing_email, o.created_at;

-- REQUESTS VIEW
CREATE OR REPLACE VIEW admin_v_requests AS
SELECT
  cr.id AS request_id,
  cr.created_at,
  cr.status,
  cr.contact_email AS email,
  cr.project_title,
  cr.budget_range,
  cr.timeline_preference,
  cr.urgency_level,
  cr.user_id,
  cr.product_id
FROM public.customization_requests cr;

-- QUOTES VIEW
CREATE OR REPLACE VIEW admin_v_quotes AS
SELECT
  q.id AS quote_id,
  q.created_at,
  q.status,
  q.total_amount,
  q.currency,
  q.expires_at AS valid_until,
  q.created_by,
  q.user_id,
  q.customization_request_id AS request_id,
  cr.project_title,
  cr.budget_range
FROM public.custom_quotes q
LEFT JOIN public.customization_requests cr ON cr.id = q.customization_request_id;

-- PROJECTS VIEW
CREATE OR REPLACE VIEW admin_v_projects AS
SELECT
  p.id AS project_id,
  p.title,
  p.status,
  p.created_at,
  p.currency,
  p.total_price,
  p.org_id,
  p.teamsmith_user_id,
  p.agency_id,
  (SELECT COUNT(*) FROM public.milestones m WHERE m.project_id = p.id) AS milestones_count,
  (SELECT COUNT(*) FROM public.deliverables d WHERE d.project_id = p.id) AS deliverables_count,
  (SELECT COUNT(*) FROM public.qa_reviews qr JOIN public.deliverables d ON d.id = qr.deliverable_id WHERE d.project_id = p.id) AS qa_reviews_count
FROM public.projects p;

-- MILESTONES VIEW
CREATE OR REPLACE VIEW admin_v_milestones AS
SELECT
  m.id AS milestone_id,
  m.project_id,
  m.title,
  m.amount,
  m.status,
  m.due_date,
  m.created_at,
  pi.status AS payment_status,
  pi.stripe_payment_intent_id
FROM public.milestones m
LEFT JOIN public.payment_intents pi ON pi.milestone_id = m.id;

-- CUSTOM PROJECT MILESTONES VIEW
CREATE OR REPLACE VIEW admin_v_custom_milestones AS
SELECT
  cpm.id AS milestone_id,
  cpm.project_id,
  cpm.title,
  cpm.amount,
  cpm.status,
  cpm.due_date,
  cpm.created_at,
  cpm.paid_at,
  cpm.stripe_payment_intent_id
FROM public.custom_project_milestones cpm;

-- DELIVERABLES VIEW
CREATE OR REPLACE VIEW admin_v_deliverables AS
SELECT
  d.id AS deliverable_id,
  d.project_id,
  d.milestone_id,
  d.title,
  d.status,
  d.created_at,
  (SELECT COUNT(*) FROM public.deliverable_versions dv WHERE dv.deliverable_id = d.id) AS versions,
  (SELECT MAX(created_at) FROM public.deliverable_versions dv2 WHERE dv2.deliverable_id = d.id) AS last_updated,
  (SELECT qr.decision FROM public.qa_reviews qr WHERE qr.deliverable_id = d.id ORDER BY created_at DESC LIMIT 1) AS last_qa_decision
FROM public.deliverables d;

-- PROJECT DELIVERABLES VIEW
CREATE OR REPLACE VIEW admin_v_project_deliverables AS
SELECT
  pd.id AS deliverable_id,
  pd.project_id,
  pd.milestone_id,
  pd.title,
  pd.status,
  pd.created_at,
  pd.submitted_at,
  pd.approved_at,
  pd.approved_by,
  pd.rejection_reason
FROM public.project_deliverables pd;

-- MEETINGS VIEW
CREATE OR REPLACE VIEW admin_v_meetings AS
SELECT
  m.id AS meeting_id,
  m.project_id,
  m.provider,
  m.title,
  m.starts_at,
  m.ends_at,
  m.join_url,
  m.recording_consent,
  m.created_at,
  m.organizer_user_id
FROM public.meetings m;

-- =====================================================
-- 2. PERFORMANCE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_org ON public.projects(org_id);
CREATE INDEX IF NOT EXISTS idx_projects_agency ON public.projects(agency_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at);
CREATE INDEX IF NOT EXISTS idx_milestones_project ON public.milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON public.milestones(status);
CREATE INDEX IF NOT EXISTS idx_deliverables_project ON public.deliverables(project_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_status ON public.deliverables(status);
CREATE INDEX IF NOT EXISTS idx_custom_quotes_status ON public.custom_quotes(status);
CREATE INDEX IF NOT EXISTS idx_customization_requests_status ON public.customization_requests(status);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- =====================================================
-- 3. RPC FUNCTIONS FOR PAGINATED LISTS
-- =====================================================

-- Admin List Projects
CREATE OR REPLACE FUNCTION public.admin_list_projects(
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_limit   int   DEFAULT 25,
  p_offset  int   DEFAULT 0,
  p_order   text  DEFAULT 'created_at.desc'
)
RETURNS TABLE (
  total bigint,
  project_id uuid,
  title text,
  status text,
  created_at timestamptz,
  currency text,
  total_price numeric,
  org_id uuid,
  teamsmith_user_id uuid,
  agency_id uuid,
  milestones_count bigint,
  deliverables_count bigint,
  qa_reviews_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status text := p_filters->>'status';
  v_org uuid := NULLIF(p_filters->>'org_id','')::uuid;
  v_agency uuid := NULLIF(p_filters->>'agency_id','')::uuid;
  v_q text := p_filters->>'q';
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  RETURN QUERY
  WITH base AS (
    SELECT * FROM admin_v_projects p
    WHERE (v_status IS NULL OR p.status = v_status)
      AND (v_org IS NULL OR p.org_id = v_org)
      AND (v_agency IS NULL OR p.agency_id = v_agency)
      AND (v_q IS NULL OR p.title ILIKE '%'||v_q||'%')
  )
  SELECT
    (SELECT COUNT(*) FROM base) AS total,
    b.project_id, b.title, b.status, b.created_at, b.currency, b.total_price, 
    b.org_id, b.teamsmith_user_id, b.agency_id, b.milestones_count, b.deliverables_count, b.qa_reviews_count
  FROM base b
  ORDER BY
    CASE WHEN p_order = 'created_at.desc' THEN b.created_at END DESC,
    CASE WHEN p_order = 'created_at.asc' THEN b.created_at END ASC,
    CASE WHEN p_order = 'title.asc' THEN b.title END ASC,
    CASE WHEN p_order = 'title.desc' THEN b.title END DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Admin List Freelancers
CREATE OR REPLACE FUNCTION public.admin_list_freelancers(
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_limit   int   DEFAULT 25,
  p_offset  int   DEFAULT 0,
  p_order   text  DEFAULT 'created_at.desc'
)
RETURNS TABLE (
  total bigint,
  user_id uuid,
  full_name text,
  email text,
  skills text[],
  price_band_min int,
  price_band_max int,
  availability_weekly_hours int,
  active_projects bigint,
  completed_projects bigint,
  csat_avg numeric,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_q text := p_filters->>'q';
  v_min_price int := NULLIF(p_filters->>'min_price','')::int;
  v_max_price int := NULLIF(p_filters->>'max_price','')::int;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  RETURN QUERY
  WITH base AS (
    SELECT * FROM admin_v_freelancers f
    WHERE (v_q IS NULL OR f.full_name ILIKE '%'||v_q||'%' OR f.email ILIKE '%'||v_q||'%')
      AND (v_min_price IS NULL OR f.price_band_min >= v_min_price)
      AND (v_max_price IS NULL OR f.price_band_max <= v_max_price)
  )
  SELECT
    (SELECT COUNT(*) FROM base) AS total,
    b.*
  FROM base b
  ORDER BY
    CASE WHEN p_order = 'created_at.desc' THEN b.created_at END DESC,
    CASE WHEN p_order = 'created_at.asc' THEN b.created_at END ASC,
    CASE WHEN p_order = 'full_name.asc' THEN b.full_name END ASC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Admin List Quotes
CREATE OR REPLACE FUNCTION public.admin_list_quotes(
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_limit   int   DEFAULT 25,
  p_offset  int   DEFAULT 0,
  p_order   text  DEFAULT 'created_at.desc'
)
RETURNS TABLE (
  total bigint,
  quote_id uuid,
  created_at timestamptz,
  status text,
  total_amount int,
  currency text,
  valid_until timestamptz,
  created_by uuid,
  user_id uuid,
  request_id uuid,
  project_title text,
  budget_range text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status text := p_filters->>'status';
  v_q text := p_filters->>'q';
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  RETURN QUERY
  WITH base AS (
    SELECT * FROM admin_v_quotes q
    WHERE (v_status IS NULL OR q.status = v_status)
      AND (v_q IS NULL OR q.project_title ILIKE '%'||v_q||'%')
  )
  SELECT
    (SELECT COUNT(*) FROM base) AS total,
    b.*
  FROM base b
  ORDER BY
    CASE WHEN p_order = 'created_at.desc' THEN b.created_at END DESC,
    CASE WHEN p_order = 'created_at.asc' THEN b.created_at END ASC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- =====================================================
-- 4. AUDIT LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(user_id),
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_audit ON public.audit_log 
FOR ALL USING (public.is_admin(auth.uid())) 
WITH CHECK (public.is_admin(auth.uid()));

-- =====================================================
-- 5. SCHEDULED REPORTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.admin_scheduled_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid REFERENCES public.profiles(user_id),
  report_type text CHECK (report_type IN ('projects','requests','quotes','milestones','payments','freelancers','deliverables')) NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  cadence text CHECK (cadence IN ('daily','weekly','monthly')) NOT NULL,
  last_run_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

ALTER TABLE public.admin_scheduled_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_reports ON public.admin_scheduled_reports
FOR ALL USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_admin_scheduled_reports_updated_at
    BEFORE UPDATE ON public.admin_scheduled_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();