-- Create users table for canonical user data (if not exists)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create orgs table (if not exists)
CREATE TABLE IF NOT EXISTS public.orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  billing_email TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_orgs junction table (if not exists)
CREATE TABLE IF NOT EXISTS public.user_orgs (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (user_id, org_id)
);

-- Create canonical briefs table (if not exists)
CREATE TABLE IF NOT EXISTS public.briefs (
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

-- Create brief_events table (if not exists)
CREATE TABLE IF NOT EXISTS public.brief_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID REFERENCES public.briefs(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brief_events ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for briefs to avoid conflicts
DROP POLICY IF EXISTS "Insert briefs (system)" ON public.briefs;
DROP POLICY IF EXISTS "View briefs (owner, org member, or admin)" ON public.briefs;
DROP POLICY IF EXISTS "Update briefs (owner, org member, or admin)" ON public.briefs;

CREATE POLICY "Insert briefs (system)"
ON public.briefs FOR INSERT
WITH CHECK (true);

CREATE POLICY "View briefs (owner, org member, or admin)"
ON public.briefs FOR SELECT
USING (
  is_admin(auth.uid()) OR
  user_id = auth.uid() OR
  (org_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.user_orgs uo 
    WHERE uo.org_id = briefs.org_id AND uo.user_id = auth.uid()
  )) OR
  (user_id IS NULL AND contact_email = auth.email())
);

CREATE POLICY "Update briefs (owner, org member, or admin)"
ON public.briefs FOR UPDATE
USING (
  is_admin(auth.uid()) OR
  user_id = auth.uid() OR
  (org_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.user_orgs uo 
    WHERE uo.org_id = briefs.org_id AND uo.user_id = auth.uid()
  ))
);

-- Drop and recreate policies for brief_events
DROP POLICY IF EXISTS "Insert brief_events (system)" ON public.brief_events;
DROP POLICY IF EXISTS "View brief_events (brief owner or admin)" ON public.brief_events;

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
      b.user_id = auth.uid() OR
      (b.org_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.user_orgs uo 
        WHERE uo.org_id = b.org_id AND uo.user_id = auth.uid()
      )) OR
      (b.user_id IS NULL AND b.contact_email = auth.email())
    )
  )
);

-- Create indexes for performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_briefs_contact_email ON public.briefs (contact_email);
CREATE INDEX IF NOT EXISTS idx_briefs_user_id ON public.briefs (user_id);
CREATE INDEX IF NOT EXISTS idx_briefs_org_id ON public.briefs (org_id);
CREATE INDEX IF NOT EXISTS idx_briefs_status ON public.briefs (status);
CREATE INDEX IF NOT EXISTS idx_briefs_created_at ON public.briefs (created_at);
CREATE INDEX IF NOT EXISTS idx_brief_events_brief_id ON public.brief_events (brief_id);
CREATE INDEX IF NOT EXISTS idx_briefs_structured_brief_gin ON public.briefs USING GIN (structured_brief);

-- Create function to auto-link briefs when user logs in
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

-- Drop and recreate trigger for auto-linking
DROP TRIGGER IF EXISTS link_briefs_on_user_creation ON public.users;
CREATE TRIGGER link_briefs_on_user_creation
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.link_briefs_to_user();