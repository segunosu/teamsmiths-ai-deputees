-- Fix briefs RLS policies to prevent recursion and ensure proper access
-- Following the user's exact specification

-- Enable RLS (if not yet enabled)
ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS briefs_insert_any ON public.briefs;
DROP POLICY IF EXISTS briefs_select_owner ON public.briefs;  
DROP POLICY IF EXISTS briefs_update_owner ON public.briefs;

-- Insert allowed (Edge Function uses service role; client insert OK for guests)
CREATE POLICY briefs_insert_any
ON public.briefs FOR INSERT
WITH CHECK (true);

-- Select: owner OR org member OR guest by email OR admin
-- Note: Using org_members instead of user_orgs as that's what exists in the schema
CREATE POLICY briefs_select_owner
ON public.briefs FOR SELECT
USING (
  user_id = auth.uid()
  OR (
    org_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = briefs.org_id AND om.user_id = auth.uid()
    )
  )
  OR (
    user_id IS NULL AND
    lower(contact_email) = lower(
      COALESCE(current_setting('request.jwt.claims', true)::json->>'email', auth.email())
    )
  )
  OR is_admin(auth.uid())
);

-- Update: owner OR org member OR admin
CREATE POLICY briefs_update_owner
ON public.briefs FOR UPDATE
USING (
  user_id = auth.uid()
  OR (
    org_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = briefs.org_id AND om.user_id = auth.uid()
    )
  )
  OR is_admin(auth.uid())
);