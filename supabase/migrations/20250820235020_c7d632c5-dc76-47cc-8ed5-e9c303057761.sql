-- Add three new outcome packs under Continuous Improvement category

-- Individual Uplift Pack
INSERT INTO public.products (
  title, 
  description, 
  deliverables, 
  timeline, 
  base_price, 
  category_id, 
  subcategory_id,
  tags, 
  is_active, 
  is_fixed_scope
) VALUES (
  'Individual Uplift Pack',
  'Transforms EXISTING DATA - including but not limited to meeting transcripts, chats, and emails - into a personalised stream of AI-powered insights, actions (that is, actions that can be taken in other applications such as expected CRM entries and JIRA entries after a meeting) and lite coaching nudges. Helps the individual, team and organization to improve productivity, performance, decision-making, and growth without extra hours.

Ideal for: Individual team members, leaders, or specialists who want rapid personal improvement.',
  'AI-driven analysis of meetings, chats, and emails
Lite coaching prompts (reflection, prioritisation, follow-ups)
Dashboard to track personal progress
Optional light-touch human coaching for accountability',
  '2-4 weeks',
  89500,
  '01d9e50d-a113-44d0-ae6d-2f0c59113ec7',
  'd99ecb9c-801b-4ccf-bb83-c6027e0c341e',
  ARRAY['continuous-improvement', 'ai-insights', 'coaching', 'individual'],
  true,
  true
);

-- Team Uplift Pack
INSERT INTO public.products (
  title, 
  description, 
  deliverables, 
  timeline, 
  base_price, 
  category_id, 
  subcategory_id,
  tags, 
  is_active, 
  is_fixed_scope
) VALUES (
  'Team Uplift Pack',
  'Turns everyday team communication (meetings, Slack, emails) into a performance engine. Deputee identifies collaboration gaps, meeting inefficiencies, and opportunities, while lite coaching nudges + optional human facilitation help teams exceed expectations.

Ideal for: Teams (up to 15 members) wanting to double productivity and exceed organisational expectations.',
  'Team-wide meeting + communication analysis
Role-specific lite coaching nudges
Automated summaries + recommended actions
Progress tracking across the whole team
Optional light-touch human facilitation',
  '4-6 weeks',
  295000,
  '01d9e50d-a113-44d0-ae6d-2f0c59113ec7',
  'd99ecb9c-801b-4ccf-bb83-c6027e0c341e',
  ARRAY['continuous-improvement', 'team-performance', 'coaching', 'collaboration'],
  true,
  true
);

-- Organisation Uplift Pack
INSERT INTO public.products (
  title, 
  description, 
  deliverables, 
  timeline, 
  base_price, 
  category_id, 
  subcategory_id,
  tags, 
  is_active, 
  is_fixed_scope
) VALUES (
  'Organisation Uplift Pack',
  'Scales Deputee''s insights across multiple teams, providing role-based coaching, culture-level nudges, and organisation-wide dashboards. Helps enterprises exceed stakeholder expectations without traditional high-cost programmes.

Ideal for: Enterprises and SMEs seeking affordable, organisation-wide performance uplift.',
  'Multi-team integration with role-specific nudges
Organisation-wide dashboard of uplift metrics
Automated reporting on productivity, performance, and well-being
Bespoke frameworks + playbooks aligned with strategy
Light-touch leadership coaching to drive adoption',
  '8-12 weeks',
  975000,
  '01d9e50d-a113-44d0-ae6d-2f0c59113ec7',
  'd99ecb9c-801b-4ccf-bb83-c6027e0c341e',
  ARRAY['continuous-improvement', 'enterprise', 'coaching', 'organisation-wide'],
  true,
  true
);