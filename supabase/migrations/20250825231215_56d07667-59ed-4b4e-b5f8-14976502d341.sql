-- Fix infinite recursion in org_members RLS policy
-- The current policy references org_members within itself, causing infinite recursion

-- Create a security definer function to check if user is member of org
CREATE OR REPLACE FUNCTION public.is_org_member(_org_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members om
    WHERE om.org_id = _org_id AND om.user_id = _user_id
  );
$$;

-- Drop and recreate the org_members policy to avoid recursion
DROP POLICY IF EXISTS "View org_members (self, same org, admin)" ON public.org_members;

CREATE POLICY "View org_members (self, same org, admin)" 
ON public.org_members 
FOR SELECT 
USING (
  is_admin(auth.uid()) 
  OR (user_id = auth.uid()) 
  OR is_org_member(org_id, auth.uid())
);