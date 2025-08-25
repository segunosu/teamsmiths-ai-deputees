-- Enable RLS on users and orgs tables that were missing it
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_orgs ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
CREATE POLICY "Users can view their own data"
ON public.users FOR SELECT
USING (auth.uid() = id OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
CREATE POLICY "Users can update their own data"
ON public.users FOR UPDATE
USING (auth.uid() = id OR is_admin(auth.uid()));

-- Create policies for user_orgs table
DROP POLICY IF EXISTS "View user_orgs (self or admin)" ON public.user_orgs;
CREATE POLICY "View user_orgs (self or admin)"
ON public.user_orgs FOR SELECT
USING (
  is_admin(auth.uid()) OR 
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_orgs uo2 
    WHERE uo2.org_id = user_orgs.org_id AND uo2.user_id = auth.uid()
  )
);

-- Fix the search path for existing function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;