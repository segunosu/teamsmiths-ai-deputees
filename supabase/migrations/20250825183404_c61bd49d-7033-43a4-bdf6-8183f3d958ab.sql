-- Create users table for canonical user data
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create orgs table
CREATE TABLE IF NOT EXISTS public.orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  billing_email TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_orgs junction table
CREATE TABLE IF NOT EXISTS public.user_orgs (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (user_id, org_id)
);

-- Create canonical briefs table
CREATE TABLE public.briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin TEXT CHECK (origin IN ('capability', 'catalog', 'bespoke')) NOT NULL,
  origin_id UUID,
  status TEXT CHECK (status IN ('draft', 'submitted', 'proposal_ready', 'qa_in_review', 'qa_passed', 'accepted', 'archived')) DEFAULT 'draft',
  contact_name TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  structured_brief JSONB DEFAULT '{}',
  proposal_json JSONB,
  assured_mode BOOLEAN DEFAULT false,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  org_id UUID REFERENCES public.orgs(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create brief_events table
CREATE TABLE public.brief_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID REFERENCES public.briefs(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brief_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own data"
ON public.users FOR SELECT
USING (auth.uid()::text = id::text OR is_admin(auth.uid()));

CREATE POLICY "Users can update their own data"
ON public.users FOR UPDATE
USING (auth.uid()::text = id::text OR is_admin(auth.uid()));

-- RLS Policies for orgs
CREATE POLICY "View orgs (members or admin)"
ON public.orgs FOR SELECT
USING (
  is_admin(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM public.user_orgs uo 
    WHERE uo.org_id = orgs.id AND uo.user_id::text = auth.uid()::text
  )
);

-- RLS Policies for user_orgs
CREATE POLICY "View user_orgs (self or admin)"
ON public.user_orgs FOR SELECT
USING (
  is_admin(auth.uid()) OR 
  user_id::text = auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM public.user_orgs uo2 
    WHERE uo2.org_id = user_orgs.org_id AND uo2.user_id::text = auth.uid()::text
  )
);

-- RLS Policies for briefs
CREATE POLICY "Insert briefs (system)"
ON public.briefs FOR INSERT
WITH CHECK (true);

CREATE POLICY "View briefs (owner, org member, or admin)"
ON public.briefs FOR SELECT
USING (
  is_admin(auth.uid()) OR
  user_id::text = auth.uid()::text OR
  (org_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.user_orgs uo 
    WHERE uo.org_id = briefs.org_id AND uo.user_id::text = auth.uid()::text
  )) OR
  (user_id IS NULL AND contact_email = auth.email())
);

CREATE POLICY "Update briefs (owner, org member, or admin)"
ON public.briefs FOR UPDATE
USING (
  is_admin(auth.uid()) OR
  user_id::text = auth.uid()::text OR
  (org_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.user_orgs uo 
    WHERE uo.org_id = briefs.org_id AND uo.user_id::text = auth.uid()::text
  ))
);

-- RLS Policies for brief_events
CREATE POLICY "Insert brief_events (system)"
ON public.brief_events FOR INSERT
WITH CHECK (true);

CREATE POLICY "View brief_events (brief owner or admin)"
ON public.brief_events FOR SELECT
USING (
  is_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.briefs b 
    WHERE b.id = brief_events.brief_id AND (
      b.user_id::text = auth.uid()::text OR
      (b.org_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.user_orgs uo 
        WHERE uo.org_id = b.org_id AND uo.user_id::text = auth.uid()::text
      )) OR
      (b.user_id IS NULL AND b.contact_email = auth.email())
    )
  )
);

-- Create indexes for performance
CREATE INDEX idx_briefs_contact_email ON public.briefs (contact_email);
CREATE INDEX idx_briefs_user_id ON public.briefs (user_id);
CREATE INDEX idx_briefs_org_id ON public.briefs (org_id);
CREATE INDEX idx_briefs_status ON public.briefs (status);
CREATE INDEX idx_briefs_created_at ON public.briefs (created_at);
CREATE INDEX idx_brief_events_brief_id ON public.brief_events (brief_id);

-- Create GIN index for JSON search on structured_brief
CREATE INDEX IF NOT EXISTS idx_briefs_structured_brief_gin ON public.briefs USING GIN (structured_brief);

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_orgs_updated_at
  BEFORE UPDATE ON public.orgs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_briefs_updated_at
  BEFORE UPDATE ON public.briefs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to auto-link briefs when user logs in
CREATE OR REPLACE FUNCTION public.link_briefs_to_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Link any unattached briefs with matching email to this user
  UPDATE public.briefs 
  SET user_id = NEW.id
  WHERE contact_email = NEW.email 
    AND user_id IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-link briefs when user is created
CREATE TRIGGER link_briefs_on_user_creation
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.link_briefs_to_user();