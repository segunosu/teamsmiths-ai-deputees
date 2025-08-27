-- Create admin-only RPC for briefs to replace direct view access
CREATE OR REPLACE FUNCTION public.admin_list_briefs(
  p_statuses text[] DEFAULT ARRAY['submitted','proposal_ready','qa_in_review']::text[],
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0,
  p_order text DEFAULT 'created_at.desc'
)
RETURNS SETOF public.admin_v_briefs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  RETURN QUERY
  SELECT *
  FROM public.admin_v_briefs
  WHERE (p_statuses IS NULL OR status = ANY(p_statuses))
  ORDER BY
    CASE WHEN p_order = 'created_at.desc' THEN created_at END DESC,
    CASE WHEN p_order = 'created_at.asc' THEN created_at END ASC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Restrict direct access to the view remains (already revoked in prior migration)
-- Allow authenticated clients to execute the function; the function itself enforces admin check
GRANT EXECUTE ON FUNCTION public.admin_list_briefs(text[], integer, integer, text) TO authenticated;