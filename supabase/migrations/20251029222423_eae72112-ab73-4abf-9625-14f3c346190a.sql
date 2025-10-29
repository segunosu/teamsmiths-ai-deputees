-- Enable RLS on scorecard_responses (safe if already enabled)
ALTER TABLE IF EXISTS public.scorecard_responses ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated users to create scorecard responses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'scorecard_responses' 
      AND policyname = 'Public can insert scorecard responses'
  ) THEN
    CREATE POLICY "Public can insert scorecard responses"
    ON public.scorecard_responses
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);
  END IF;
END$$;

-- Optional hardening: prevent updates/deletes by public (keep existing policies intact)
-- This does not create new policies but ensures RLS remains enabled; updates/deletes will be denied unless existing policies allow them.