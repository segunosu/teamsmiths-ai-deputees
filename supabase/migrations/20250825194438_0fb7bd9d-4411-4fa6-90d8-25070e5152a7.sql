-- Fix auth/user linkage and RLS policies for briefs system

-- 1. Fix the foreign key to point to auth.users instead of public.users
ALTER TABLE public.briefs
  DROP CONSTRAINT IF EXISTS briefs_user_id_fkey;
ALTER TABLE public.briefs
  ADD CONSTRAINT briefs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Create linker function to attach briefs to users by email
CREATE OR REPLACE FUNCTION public.link_briefs_to_user_by_email(_email text, _user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Link any unattached briefs with matching email to this user
  UPDATE public.briefs 
  SET user_id = _user_id
  WHERE user_id IS NULL 
    AND LOWER(contact_email) = LOWER(_email);
END;
$$;

-- 3. Update RLS policies for briefs with proper auth handling
DROP POLICY IF EXISTS "Insert briefs (system)" ON public.briefs;
DROP POLICY IF EXISTS "View briefs (owner, org member, or admin)" ON public.briefs;
DROP POLICY IF EXISTS "Update briefs (owner, org member, or admin)" ON public.briefs;

-- Insert: allowed from Edge Function (service role) and from client when creating a brief
CREATE POLICY "briefs_insert_any" 
ON public.briefs FOR INSERT
WITH CHECK (true);

-- Select: allow owner, org members, guests by email, or admins
CREATE POLICY "briefs_select_owner"
ON public.briefs FOR SELECT
USING (
  user_id = auth.uid() OR
  (org_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.user_orgs uo
    WHERE uo.org_id = briefs.org_id AND uo.user_id = auth.uid()
  )) OR
  (user_id IS NULL AND LOWER(contact_email) = LOWER(COALESCE(
    current_setting('request.jwt.claims', true)::json->>'email',
    auth.email()
  ))) OR
  is_admin(auth.uid())
);

-- Update: owner, org member, or admin
CREATE POLICY "briefs_update_owner"
ON public.briefs FOR UPDATE
USING (
  user_id = auth.uid() OR
  (org_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.user_orgs uo
    WHERE uo.org_id = briefs.org_id AND uo.user_id = auth.uid()
  )) OR
  is_admin(auth.uid())
);

-- 4. Update RLS policies for user_orgs to allow proper joining
DROP POLICY IF EXISTS "View user_orgs (self, same org, admin)" ON public.user_orgs;
CREATE POLICY "user_orgs_select_policy"
ON public.user_orgs FOR SELECT
USING (
  user_id = auth.uid() OR
  is_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.user_orgs uo2
    WHERE uo2.org_id = user_orgs.org_id AND uo2.user_id = auth.uid()
  )
);

-- 5. Create trigger on auth.users to auto-link briefs when user signs up
-- Since we can't create triggers on auth.users, we'll handle this in the Edge Function instead

-- 6. Grant necessary permissions for the linker function
GRANT EXECUTE ON FUNCTION public.link_briefs_to_user_by_email(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.link_briefs_to_user_by_email(text, uuid) TO service_role;