-- Create a simple function to get autopilot history without complex type inference
CREATE OR REPLACE FUNCTION public.get_autopilot_history()
RETURNS TABLE(
  id uuid,
  created_at timestamptz,
  algorithm_version text,
  parameters jsonb,
  candidate_count integer,
  execution_time_ms integer,
  metadata jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mr.id,
    mr.created_at,
    mr.algorithm_version,
    mr.parameters,
    mr.candidate_count,
    mr.execution_time_ms,
    mr.metadata
  FROM public.matching_runs mr
  WHERE mr.algorithm_version = 'autopilot-v1'
  ORDER BY mr.created_at DESC
  LIMIT 20;
END;
$$;