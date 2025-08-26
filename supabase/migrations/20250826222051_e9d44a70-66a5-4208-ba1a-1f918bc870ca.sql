-- Add shadow_user_id column for test experts
ALTER TABLE public.freelancer_profiles
ADD COLUMN IF NOT EXISTS shadow_user_id UUID DEFAULT gen_random_uuid();

-- Allow NULL user_id for shadow experts
ALTER TABLE public.freelancer_profiles 
ALTER COLUMN user_id DROP NOT NULL;

-- Create shadow test experts for matching (using NULL user_id)
INSERT INTO public.freelancer_profiles (
  user_id, shadow_user_id, skills, tools, industries,
  price_band_min, price_band_max, availability_weekly_hours,
  locales, certifications, outcome_history
) VALUES 
-- Expert 1: Full-stack developer
(
  NULL, gen_random_uuid(),
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
  NULL, gen_random_uuid(),
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
  NULL, gen_random_uuid(),
  ARRAY['Process Design', 'Automation', 'Project Management', 'Data Analysis', 'Training'],
  ARRAY['Notion', 'Airtable', 'Zapier', 'Monday.com', 'Slack'],
  ARRAY['Consulting', 'Healthcare', 'Enterprise'],
  6000, 10000, 25,
  ARRAY['en-GB', 'en-US'],
  ARRAY['PMP Certified', 'Six Sigma Black Belt', 'Notion Certified'],
  '{"csat_score": 4.9, "on_time_rate": 0.98, "revision_rate": 0.10, "pass_at_qa_rate": 0.96, "dispute_rate": 0.01}'::jsonb
);

-- Also create some fake profiles for these shadow experts
INSERT INTO public.profiles (user_id, full_name, email) 
SELECT 
  shadow_user_id, 
  CASE 
    WHEN skills @> ARRAY['React'] THEN 'Sarah Chen'
    WHEN skills @> ARRAY['Marketing Automation'] THEN 'Marcus Thompson'  
    WHEN skills @> ARRAY['Process Design'] THEN 'Elena Rodriguez'
  END,
  CASE 
    WHEN skills @> ARRAY['React'] THEN 'sarah.chen@shadow.expert'
    WHEN skills @> ARRAY['Marketing Automation'] THEN 'marcus.thompson@shadow.expert'
    WHEN skills @> ARRAY['Process Design'] THEN 'elena.rodriguez@shadow.expert'
  END
FROM public.freelancer_profiles 
WHERE user_id IS NULL AND shadow_user_id IS NOT NULL;