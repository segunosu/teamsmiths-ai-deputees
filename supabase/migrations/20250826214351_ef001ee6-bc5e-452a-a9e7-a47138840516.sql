-- Add shadow_user_id column for test experts
ALTER TABLE public.freelancer_profiles
ADD COLUMN IF NOT EXISTS shadow_user_id UUID DEFAULT gen_random_uuid();

-- Create shadow test experts for matching
INSERT INTO public.freelancer_profiles (
  user_id, shadow_user_id, skills, tools, industries,
  price_band_min, price_band_max, availability_weekly_hours,
  locales, certifications, outcome_history
) VALUES 
-- Expert 1: Full-stack developer
(
  gen_random_uuid(), gen_random_uuid(),
  ARRAY['React', 'TypeScript', 'Node.js', 'Python', 'API Integration'],
  ARRAY['HubSpot', 'Stripe', 'Notion', 'Zapier', 'OpenAI'],
  ARRAY['SaaS', 'Fintech', 'E-commerce'],
  5000, 8000, 35,
  ARRAY['en-GB', 'en-US'],
  ARRAY['AWS Certified', 'React Certified'],
  '{"csat_score": 4.8, "on_time_rate": 0.95, "revision_rate": 0.15, "pass_at_qa_rate": 0.92, "dispute_rate": 0.02}'::jsonb
),
-- Expert 2: Marketing automation specialist
(
  gen_random_uuid(), gen_random_uuid(),
  ARRAY['Marketing Automation', 'CRM', 'Content Strategy', 'Analytics', 'SEO'],
  ARRAY['HubSpot', 'Salesforce', 'Google Analytics', 'Mailchimp', 'Zapier'],
  ARRAY['SaaS', 'Consulting', 'Agency'],
  4000, 6500, 30,
  ARRAY['en-GB'],
  ARRAY['HubSpot Certified', 'Google Analytics Certified'],
  '{"csat_score": 4.6, "on_time_rate": 0.88, "revision_rate": 0.20, "pass_at_qa_rate": 0.85, "dispute_rate": 0.05}'::jsonb
),
-- Expert 3: Process optimization consultant
(
  gen_random_uuid(), gen_random_uuid(),
  ARRAY['Process Design', 'Automation', 'Project Management', 'Data Analysis', 'Training'],
  ARRAY['Notion', 'Airtable', 'Zapier', 'Monday.com', 'Slack'],
  ARRAY['Consulting', 'Healthcare', 'Enterprise'],
  6000, 10000, 25,
  ARRAY['en-GB', 'en-US'],
  ARRAY['PMP Certified', 'Six Sigma Black Belt', 'Notion Certified'],
  '{"csat_score": 4.9, "on_time_rate": 0.98, "revision_rate": 0.10, "pass_at_qa_rate": 0.96, "dispute_rate": 0.01}'::jsonb
);