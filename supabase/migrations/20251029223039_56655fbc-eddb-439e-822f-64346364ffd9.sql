-- Ensure anon and authenticated can insert/select into scorecard_responses
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT, SELECT ON TABLE public.scorecard_responses TO anon, authenticated;