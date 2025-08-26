-- Update RLS policies to use user_orgs instead of org_members and clean up
-- Fix recursive RLS by using proper table references

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

-- Select: owner OR org member OR admin (removed guest-by-email for dashboard)
-- Using user_orgs as specified by user (not org_members)
CREATE POLICY briefs_select_owner
ON public.briefs FOR SELECT
USING (
  user_id = auth.uid()
  OR (
    org_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.user_orgs uo
      WHERE uo.org_id = briefs.org_id AND uo.user_id = auth.uid()
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
      SELECT 1 FROM public.user_orgs uo
      WHERE uo.org_id = briefs.org_id AND uo.user_id = auth.uid()
    )
  )
  OR is_admin(auth.uid())
);