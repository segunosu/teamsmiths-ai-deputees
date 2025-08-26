-- Add matching capabilities to briefs table
ALTER TABLE public.briefs ADD COLUMN IF NOT EXISTS matching_results JSONB DEFAULT '[]'::JSONB;
ALTER TABLE public.briefs ADD COLUMN IF NOT EXISTS matched_expert_id UUID REFERENCES public.profiles(user_id);
ALTER TABLE public.briefs ADD COLUMN IF NOT EXISTS matched_at TIMESTAMP WITH TIME ZONE;

-- Create matching_candidates view for admin
CREATE OR REPLACE VIEW public.admin_v_briefs AS
SELECT 
  b.id as brief_id,
  b.status,
  b.contact_email,
  b.contact_name,
  b.contact_phone,
  b.structured_brief,
  b.proposal_json,
  b.matching_results,
  b.matched_expert_id,
  b.matched_at,
  b.origin,
  b.origin_id,
  b.assured_mode,
  b.created_at,
  b.updated_at,
  -- Extract interpreted goal as title
  COALESCE(
    (b.structured_brief->'goal'->>'interpreted'),
    'Untitled Brief'
  ) as project_title,
  -- Extract budget range
  COALESCE(
    (b.structured_brief->>'budget_range'),
    'Budget not specified'
  ) as budget_range,
  -- Extract timeline
  COALESCE(
    (b.structured_brief->>'timeline'),
    'Timeline not specified'
  ) as timeline_preference,
  -- Extract urgency
  COALESCE(
    (b.structured_brief->>'urgency'),
    'standard'
  ) as urgency_level,
  -- Check if matching results exist and count candidates
  CASE 
    WHEN b.matching_results IS NOT NULL AND jsonb_array_length(b.matching_results) > 0 
    THEN jsonb_array_length(b.matching_results)
    ELSE 0
  END as candidate_count
FROM public.briefs b
WHERE b.status IN ('submitted', 'proposal_ready', 'qa_in_review', 'qa_passed');

-- Enable RLS on the view
ALTER VIEW public.admin_v_briefs SET (security_invoker = on);

-- Create policy for admin access
CREATE POLICY "Admins can view all briefs overview"
ON public.admin_v_briefs
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Update briefs policies to allow admin matching operations
CREATE POLICY "Admins can update briefs for matching"
ON public.briefs
FOR UPDATE
USING (public.is_admin(auth.uid()));