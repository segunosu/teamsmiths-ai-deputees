-- Enable pgvector extension for RAG
CREATE EXTENSION IF NOT EXISTS vector;

-- USERS & ORGS
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT UNIQUE,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  billing_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.org_members (
  org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner','manager','member')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (org_id, user_id)
);

-- TEAMSMITHS (freelancers)
CREATE TABLE public.teamsmiths (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  bio TEXT,
  skills TEXT[],
  vetted BOOLEAN DEFAULT false,
  hourly_rate NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AGENCIES
CREATE TABLE public.agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.agency_members (
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner','admin','member')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (agency_id, user_id)
);

-- CATALOG: categories, subcategories, products (packs)
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

CREATE TABLE public.subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  deliverables TEXT,
  timeline TEXT,
  base_price NUMERIC NOT NULL,
  is_fixed_scope BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Frozen copy of product at purchase time (for customizations)
CREATE TABLE public.product_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PROJECTS (buyer is org; supplier is teamsmith or agency)
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.orgs(id) ON DELETE SET NULL,
  teamsmith_user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
  product_snapshot_id UUID REFERENCES public.product_snapshots(id),
  title TEXT NOT NULL,
  status TEXT CHECK (status IN ('draft','active','awaiting_client','in_review','completed','disputed','cancelled')) DEFAULT 'draft',
  total_price NUMERIC,
  currency TEXT DEFAULT 'GBP',
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.project_participants (
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('client','teamsmith','agency_admin','observer')),
  PRIMARY KEY (project_id, user_id)
);

-- MILESTONES (escrowed, approval gates)
CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  due_date DATE,
  status TEXT CHECK (status IN ('planned','in_progress','submitted','approved','paid','blocked')) DEFAULT 'planned',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- DELIVERABLES + VERSIONS + QA (mandatory)
CREATE TABLE public.deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL,
  title TEXT,
  status TEXT CHECK (status IN ('draft','in_qa','ready_for_client','approved','rejected')) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.deliverable_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id UUID REFERENCES public.deliverables(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.qa_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id UUID REFERENCES public.deliverables(id) ON DELETE CASCADE,
  reviewer_user_id UUID REFERENCES public.profiles(user_id),
  decision TEXT CHECK (decision IN ('pass','fail')) NOT NULL,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CHANGE ORDERS
CREATE TABLE public.change_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  description TEXT,
  amount_delta NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('proposed','accepted','rejected')) DEFAULT 'proposed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- MESSAGES
CREATE TABLE public.project_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(user_id),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- FILES
CREATE TABLE public.project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL,
  deliverable_id UUID REFERENCES public.deliverables(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TRANSCRIPTS (Fireflies)
CREATE TABLE public.transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  source TEXT,
  provider_id TEXT,
  json JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RAG (pgvector)
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT,
  source TEXT,
  storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  chunk TEXT NOT NULL,
  embedding vector(1536) NOT NULL
);

-- PAYMENTS (Stripe)
CREATE TABLE public.payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AGENCY PAYOUT SPLITS
CREATE TABLE public.agency_payout_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  member_user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  percentage NUMERIC CHECK (percentage >= 0 AND percentage <= 100)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teamsmiths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverable_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_payout_splits ENABLE ROW LEVEL SECURITY;

-- Create profile trigger for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Basic RLS policies (admins bypass all)
-- Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true
  ));

-- Products (public read)
CREATE POLICY "Products are publicly viewable" ON public.products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true
  ));

-- Categories (public read)
CREATE POLICY "Categories are publicly viewable" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true
  ));

-- Subcategories (public read)
CREATE POLICY "Subcategories are publicly viewable" ON public.subcategories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage subcategories" ON public.subcategories
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true
  ));

-- Projects (participants only)
CREATE POLICY "Project participants can view projects" ON public.projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_participants 
      WHERE project_id = projects.id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Insert seed categories
INSERT INTO public.categories (name, slug) VALUES 
  ('Sales Acceleration', 'sales-acceleration'),
  ('Continuous Improvement', 'continuous-improvement'),
  ('Compliance', 'compliance');

INSERT INTO public.subcategories (category_id, name, slug) VALUES 
  ((SELECT id FROM public.categories WHERE slug = 'sales-acceleration'), 'Lead Generation', 'lead-generation'),
  ((SELECT id FROM public.categories WHERE slug = 'sales-acceleration'), 'Outbound', 'outbound'),
  ((SELECT id FROM public.categories WHERE slug = 'continuous-improvement'), 'Service CI', 'service-ci'),
  ((SELECT id FROM public.categories WHERE slug = 'continuous-improvement'), 'Manufacturing CI', 'manufacturing-ci'),
  ((SELECT id FROM public.categories WHERE slug = 'compliance'), 'GDPR', 'gdpr'),
  ((SELECT id FROM public.categories WHERE slug = 'compliance'), 'HR', 'hr');

-- Insert seed products
INSERT INTO public.products (category_id, subcategory_id, title, description, deliverables, timeline, base_price, tags) VALUES 
  (
    (SELECT id FROM public.categories WHERE slug = 'sales-acceleration'),
    (SELECT id FROM public.subcategories WHERE slug = 'lead-generation'),
    'Lead Gen 500',
    '500 qualified prospects + CRM import + 3-step sequence + weekly report',
    '• 500 qualified prospects with contact details\n• CRM import and setup\n• 3-step email sequence\n• Weekly performance report',
    '7 days',
    49900, -- £499
    ARRAY['lead-generation', 'crm', 'outreach']
  ),
  (
    (SELECT id FROM public.categories WHERE slug = 'sales-acceleration'),
    (SELECT id FROM public.subcategories WHERE slug = 'outbound'),
    'Outbound Sprint',
    '4-week outbound campaign with cadence, reply SOP, and analytics',
    '• Multi-channel cadence setup\n• Reply handling SOP\n• Performance analytics dashboard\n• Weekly optimization calls',
    '4 weeks',
    149900, -- £1499
    ARRAY['outbound', 'cadence', 'analytics']
  ),
  (
    (SELECT id FROM public.categories WHERE slug = 'continuous-improvement'),
    (SELECT id FROM public.subcategories WHERE slug = 'service-ci'),
    'Service CI Sprint',
    'Baseline KPIs → top bottlenecks → 30-day plan → pilot',
    '• Current state KPI analysis\n• Bottleneck identification\n• 30-day improvement plan\n• Pilot implementation guide',
    '3 weeks',
    99900, -- £999
    ARRAY['continuous-improvement', 'kpi', 'process']
  ),
  (
    (SELECT id FROM public.categories WHERE slug = 'compliance'),
    (SELECT id FROM public.subcategories WHERE slug = 'gdpr'),
    'GDPR Fast-Track',
    'Privacy policy, cookie banner guidance, DPIA templates',
    '• Privacy policy (customized)\n• Cookie banner implementation\n• DPIA templates\n• Compliance checklist',
    '5 days',
    79900, -- £799
    ARRAY['gdpr', 'privacy', 'compliance']
  );