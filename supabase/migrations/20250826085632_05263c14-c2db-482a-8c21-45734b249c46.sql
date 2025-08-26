-- 1) Helper: check if a user is member of an org
CREATE OR REPLACE FUNCTION public.is_org_member(_org_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_orgs uo
    WHERE uo.org_id = _org_id AND uo.user_id = _user_id
  );
$$;

-- Ensure the function is owned by the table owner (often 'postgres')
ALTER FUNCTION public.is_org_member(uuid, uuid) OWNER TO postgres;

GRANT EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) TO authenticated, anon, service_role;

-- 2) Replace user_orgs policies with non-recursive versions
-- Clean slate
DROP POLICY IF EXISTS user_orgs_select ON public.user_orgs;
DROP POLICY IF EXISTS user_orgs_insert ON public.user_orgs;
DROP POLICY IF EXISTS user_orgs_update ON public.user_orgs;
DROP POLICY IF EXISTS user_orgs_delete ON public.user_orgs;

-- Minimal, non-recursive policies
CREATE POLICY user_orgs_select
ON public.user_orgs FOR SELECT
USING (
  user_id = auth.uid() OR
  is_admin(auth.uid())
);

CREATE POLICY user_orgs_insert
ON public.user_orgs FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY user_orgs_update
ON public.user_orgs FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY user_orgs_delete
ON public.user_orgs FOR DELETE
USING (is_admin(auth.uid()));

-- 3) Re-write briefs RLS to use the helper and avoid recursion
ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;

-- Clean slate for briefs
DROP POLICY IF EXISTS briefs_insert_any   ON public.briefs;
DROP POLICY IF EXISTS briefs_select_owner ON public.briefs;
DROP POLICY IF EXISTS briefs_update_owner ON public.briefs;

-- Insert: allowed (Edge Function uses service role; client OK if you want)
CREATE POLICY briefs_insert_any
ON public.briefs FOR INSERT
WITH CHECK (true);

-- Select: owner OR org member OR admin
CREATE POLICY briefs_select_owner
ON public.briefs FOR SELECT
USING (
  user_id = auth.uid()
  OR (org_id IS NOT NULL AND public.is_org_member(org_id, auth.uid()))
  OR is_admin(auth.uid())
);

-- Update: owner OR org member OR admin
CREATE POLICY briefs_update_owner
ON public.briefs FOR UPDATE
USING (
  user_id = auth.uid()
  OR (org_id IS NOT NULL AND public.is_org_member(org_id, auth.uid()))
  OR is_admin(auth.uid())
);