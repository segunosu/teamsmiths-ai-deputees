-- Fix infinite recursion in briefs RLS policy by using org_members instead of user_orgs
DROP POLICY IF EXISTS "briefs_select_owner" ON public.briefs;

CREATE POLICY "briefs_select_owner" 
ON public.briefs 
FOR SELECT 
USING (
  (user_id = auth.uid()) 
  OR ((org_id IS NOT NULL) AND (EXISTS ( 
    SELECT 1 FROM org_members om 
    WHERE ((om.org_id = briefs.org_id) AND (om.user_id = auth.uid()))
  ))) 
  OR ((user_id IS NULL) AND (lower(contact_email) = lower(COALESCE(((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text), auth.email())))) 
  OR is_admin(auth.uid())
);

-- Also fix the update policy to match
DROP POLICY IF EXISTS "briefs_update_owner" ON public.briefs;

CREATE POLICY "briefs_update_owner" 
ON public.briefs 
FOR UPDATE 
USING (
  (user_id = auth.uid()) 
  OR ((org_id IS NOT NULL) AND (EXISTS ( 
    SELECT 1 FROM org_members om 
    WHERE ((om.org_id = briefs.org_id) AND (om.user_id = auth.uid()))
  ))) 
  OR is_admin(auth.uid())
);