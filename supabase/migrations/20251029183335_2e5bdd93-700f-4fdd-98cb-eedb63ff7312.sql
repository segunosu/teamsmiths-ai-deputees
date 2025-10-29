-- Fix RLS policy to allow anonymous scorecard submissions
DROP POLICY IF EXISTS "Users can insert their own scorecard responses" ON public.scorecard_responses;

-- Allow anyone to insert scorecard responses (lead generation form)
CREATE POLICY "Anyone can submit scorecard responses"
  ON public.scorecard_responses
  FOR INSERT
  WITH CHECK (true);