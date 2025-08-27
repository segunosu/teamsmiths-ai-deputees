-- Admin-only RPCs to replace direct access to admin views

-- Meetings
CREATE OR REPLACE FUNCTION public.admin_list_meetings(
  p_provider text DEFAULT NULL,
  p_q text DEFAULT NULL,
  p_since timestamptz DEFAULT NULL,
  p_limit integer DEFAULT 500,
  p_offset integer DEFAULT 0,
  p_order text DEFAULT 'starts_at.desc'
)
RETURNS SETOF public.admin_v_meetings
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
  FROM public.admin_v_meetings m
  WHERE (p_provider IS NULL OR m.provider = p_provider)
    AND (p_q IS NULL OR m.title ILIKE '%'||p_q||'%')
    AND (p_since IS NULL OR m.starts_at >= p_since)
  ORDER BY
    CASE WHEN p_order = 'starts_at.desc' THEN m.starts_at END DESC,
    CASE WHEN p_order = 'starts_at.asc' THEN m.starts_at END ASC,
    CASE WHEN p_order = 'created_at.desc' THEN m.created_at END DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_list_meetings(text, text, timestamptz, integer, integer, text) TO authenticated;

-- Milestones
CREATE OR REPLACE FUNCTION public.admin_list_milestones(
  p_status text DEFAULT NULL,
  p_payment_status text DEFAULT NULL,
  p_q text DEFAULT NULL,
  p_limit integer DEFAULT 500,
  p_offset integer DEFAULT 0,
  p_order text DEFAULT 'created_at.desc'
)
RETURNS SETOF public.admin_v_milestones
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
  FROM public.admin_v_milestones mm
  WHERE (p_status IS NULL OR mm.status = p_status)
    AND (p_payment_status IS NULL OR mm.payment_status = p_payment_status)
    AND (p_q IS NULL OR mm.title ILIKE '%'||p_q||'%')
  ORDER BY
    CASE WHEN p_order = 'created_at.desc' THEN mm.created_at END DESC,
    CASE WHEN p_order = 'created_at.asc' THEN mm.created_at END ASC
  LIMIT p_limit OFFSET p_offset;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_list_milestones(text, text, text, integer, integer, text) TO authenticated;

-- Deliverables
CREATE OR REPLACE FUNCTION public.admin_list_deliverables(
  p_status text DEFAULT NULL,
  p_q text DEFAULT NULL,
  p_limit integer DEFAULT 500,
  p_offset integer DEFAULT 0,
  p_order text DEFAULT 'created_at.desc'
)
RETURNS SETOF public.admin_v_deliverables
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
  FROM public.admin_v_deliverables d
  WHERE (p_status IS NULL OR d.status = p_status)
    AND (p_q IS NULL OR d.title ILIKE '%'||p_q||'%')
  ORDER BY
    CASE WHEN p_order = 'created_at.desc' THEN d.created_at END DESC,
    CASE WHEN p_order = 'created_at.asc' THEN d.created_at END ASC
  LIMIT p_limit OFFSET p_offset;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_list_deliverables(text, text, integer, integer, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_project_deliverables(
  p_status text DEFAULT NULL,
  p_q text DEFAULT NULL,
  p_limit integer DEFAULT 500,
  p_offset integer DEFAULT 0,
  p_order text DEFAULT 'created_at.desc'
)
RETURNS SETOF public.admin_v_project_deliverables
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
  FROM public.admin_v_project_deliverables pd
  WHERE (p_status IS NULL OR pd.status = p_status)
    AND (p_q IS NULL OR pd.title ILIKE '%'||p_q||'%')
  ORDER BY
    CASE WHEN p_order = 'created_at.desc' THEN pd.created_at END DESC,
    CASE WHEN p_order = 'created_at.asc' THEN pd.created_at END ASC
  LIMIT p_limit OFFSET p_offset;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_list_project_deliverables(text, text, integer, integer, text) TO authenticated;