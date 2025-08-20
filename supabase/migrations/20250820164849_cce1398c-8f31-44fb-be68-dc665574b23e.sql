-- Create or replace a secure RPC to fetch projects for a user without PostgREST OR parsing issues
CREATE OR REPLACE FUNCTION public.get_projects_for_user(_uid uuid)
RETURNS SETOF public.projects
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
  SELECT p.*
  FROM public.projects p
  WHERE (
    -- Admins can see all projects
    public.is_admin(auth.uid())
  ) OR (
    -- Otherwise, only allow requesting your own projects
    _uid = auth.uid()
    AND (
      p.teamsmith_user_id = _uid
      OR EXISTS (
        SELECT 1 FROM public.project_participants pp
        WHERE pp.project_id = p.id AND pp.user_id = _uid
      )
    )
  )
  ORDER BY p.created_at DESC;
$$;
