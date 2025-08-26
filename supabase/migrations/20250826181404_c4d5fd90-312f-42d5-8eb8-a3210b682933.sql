-- Create profiles for test freelancers with proper UUIDs
INSERT INTO public.profiles (user_id, full_name, email, is_admin)
VALUES
  ('a1b2c3d4-e5f6-7890-ab12-cd34ef567890'::uuid, 'Sarah Mitchell', 'sarah.mitchell@example.com', false),
  ('b2c3d4e5-f6g7-8901-bc23-de45fg678901'::uuid, 'James Chen', 'james.chen@example.com', false),
  ('c3d4e5f6-g7h8-9012-cd34-ef56gh789012'::uuid, 'Alex Rodriguez', 'alex.rodriguez@example.com', false)
ON CONFLICT (user_id) DO NOTHING;

-- Now create freelancer profiles with proper UUIDs
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
  'a1b2c3d4-e5f6-7890-ab12-cd34ef567890'::uuid,
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
  'b2c3d4e5-f6g7-8901-bc23-de45fg678901'::uuid,
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
  'c3d4e5f6-g7h8-9012-cd34-ef56gh789012'::uuid,
  ARRAY['Growth Strategy', 'Marketing Automation', 'CRM Implementation', 'Analytics'],
  ARRAY['HubSpot AI', 'Google Analytics', 'Stripe', 'Zapier', 'Notion AI'],
  ARRAY['SaaS', 'E-commerce', 'Startup'],
  ARRAY['HubSpot Certified', 'Google Analytics Certified', 'Growth Marketing Certificate'],
  ARRAY['en-GB'],
  40000, -- £400/day
  80000, -- £800/day
  30,
  '{"csat_score": 4.7, "on_time_rate": 0.91, "pass_at_qa_rate": 0.89, "revision_rate": 0.12, "dispute_rate": 0}'::jsonb
)
ON CONFLICT (user_id) DO NOTHING;