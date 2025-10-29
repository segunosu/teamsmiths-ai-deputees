-- Create scorecard_responses table
CREATE TABLE public.scorecard_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  role text,
  
  -- Question responses (0-100 scale per question)
  r1 integer NOT NULL CHECK (r1 >= 0 AND r1 <= 100),
  r2 integer NOT NULL CHECK (r2 >= 0 AND r2 <= 100),
  r3 integer NOT NULL CHECK (r3 >= 0 AND r3 <= 100),
  r4 integer NOT NULL CHECK (r4 >= 0 AND r4 <= 100),
  
  rp1 integer NOT NULL CHECK (rp1 >= 0 AND rp1 <= 100),
  rp2 integer NOT NULL CHECK (rp2 >= 0 AND rp2 <= 100),
  rp3 integer NOT NULL CHECK (rp3 >= 0 AND rp3 <= 100),
  rp4 integer NOT NULL CHECK (rp4 >= 0 AND rp4 <= 100),
  
  pp1 integer NOT NULL CHECK (pp1 >= 0 AND pp1 <= 100),
  pp2 integer NOT NULL CHECK (pp2 >= 0 AND pp2 <= 100),
  pp3 integer NOT NULL CHECK (pp3 >= 0 AND pp3 <= 100),
  pp4 integer NOT NULL CHECK (pp4 >= 0 AND pp4 <= 100),
  
  pr1 integer NOT NULL CHECK (pr1 >= 0 AND pr1 <= 100),
  pr2 integer NOT NULL CHECK (pr2 >= 0 AND pr2 <= 100),
  pr3 integer NOT NULL CHECK (pr3 >= 0 AND pr3 <= 100),
  pr4 integer NOT NULL CHECK (pr4 >= 0 AND pr4 <= 100),
  
  -- Computed scores
  readiness_score numeric NOT NULL,
  reach_score numeric NOT NULL,
  prowess_score numeric NOT NULL,
  protection_score numeric NOT NULL,
  total_score numeric NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
  
  -- Segmentation
  segment text NOT NULL CHECK (segment IN ('Explorer', 'Implementer', 'Accelerator')),
  
  -- Metadata
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.scorecard_responses ENABLE ROW LEVEL SECURITY;

-- Policies: Users can view their own responses, admins can view all
CREATE POLICY "Users can view their own scorecard responses"
  ON public.scorecard_responses
  FOR SELECT
  USING (auth.uid() = user_id OR email = auth.email() OR is_admin(auth.uid()));

CREATE POLICY "Anyone can insert scorecard responses"
  ON public.scorecard_responses
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage all scorecard responses"
  ON public.scorecard_responses
  FOR ALL
  USING (is_admin(auth.uid()));

-- Create index for email lookups
CREATE INDEX idx_scorecard_responses_email ON public.scorecard_responses(email);
CREATE INDEX idx_scorecard_responses_created_at ON public.scorecard_responses(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_scorecard_responses_updated_at
  BEFORE UPDATE ON public.scorecard_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();