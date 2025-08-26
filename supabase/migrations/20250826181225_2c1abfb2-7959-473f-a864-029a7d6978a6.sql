-- Insert seed freelancer profiles for testing
INSERT INTO public.freelancer_profiles (
  user_id,
  skills,
  tools,
  industries,
  certifications,
  locales,
  price_band_min,
  price_band_max,
  availability_weekly_hours,
  outcome_history
) VALUES
-- Test Expert 1: AI/Growth Specialist
(
  gen_random_uuid(),
  ARRAY['Deputee Uplift™', 'AI Strategy', 'Growth Marketing', 'Analytics', 'Python', 'React'],
  ARRAY['Notion AI', 'HubSpot AI', 'Google Analytics', 'Stripe', 'Figma'],
  ARRAY['SaaS', 'Construction', 'Fintech'],
  ARRAY['Google Cloud AI', 'AWS Machine Learning', 'HubSpot Certified'],
  ARRAY['en-GB', 'en-EU'],
  50000, -- £500/day
  90000, -- £900/day
  35,
  '{"csat_score": 4.8, "on_time_rate": 0.95, "pass_at_qa_rate": 0.92, "revision_rate": 0.1, "dispute_rate": 0}'::jsonb
),
-- Test Expert 2: AI Consultant
(
  gen_random_uuid(),
  ARRAY['AI Consulting', 'Deputee Uplift™', 'Process Automation', 'Project Management'],
  ARRAY['HubSpot AI', 'Notion AI', 'Salesforce AI', 'Slack'],
  ARRAY['Construction', 'Healthcare', 'Education'],
  ARRAY['Project Management Professional', 'Agile Certified', 'AI Ethics Certificate'],
  ARRAY['en-GB', 'en-US'],
  60000, -- £600/day
  120000, -- £1200/day
  40,
  '{"csat_score": 4.6, "on_time_rate": 0.88, "pass_at_qa_rate": 0.94, "revision_rate": 0.15, "dispute_rate": 0}'::jsonb
),
-- Test Expert 3: Growth Strategist
(
  gen_random_uuid(),
  ARRAY['Growth Strategy', 'Marketing Automation', 'CRM Implementation', 'Analytics'],
  ARRAY['HubSpot AI', 'Google Analytics', 'Stripe', 'Zapier', 'Notion AI'],
  ARRAY['SaaS', 'E-commerce', 'Startup'],
  ARRAY['HubSpot Certified', 'Google Analytics Certified', 'Growth Marketing Certificate'],
  ARRAY['en-GB'],
  40000, -- £400/day
  80000, -- £800/day
  30,
  '{"csat_score": 4.7, "on_time_rate": 0.91, "pass_at_qa_rate": 0.89, "revision_rate": 0.12, "dispute_rate": 0}'::jsonb
);

-- Create corresponding profiles for the freelancers
INSERT INTO public.profiles (user_id, full_name, email)
SELECT 
  fp.user_id,
  CASE 
    WHEN fp.skills @> ARRAY['Deputee Uplift™'] AND fp.skills @> ARRAY['AI Strategy'] 
      THEN 'Sarah Mitchell'
    WHEN fp.skills @> ARRAY['AI Consulting'] AND fp.price_band_max = 120000
      THEN 'James Chen'
    ELSE 'Alex Rodriguez'
  END as full_name,
  CASE 
    WHEN fp.skills @> ARRAY['Deputee Uplift™'] AND fp.skills @> ARRAY['AI Strategy'] 
      THEN 'sarah.mitchell@example.com'
    WHEN fp.skills @> ARRAY['AI Consulting'] AND fp.price_band_max = 120000
      THEN 'james.chen@example.com'
    ELSE 'alex.rodriguez@example.com'
  END as email
FROM public.freelancer_profiles fp
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = fp.user_id
);