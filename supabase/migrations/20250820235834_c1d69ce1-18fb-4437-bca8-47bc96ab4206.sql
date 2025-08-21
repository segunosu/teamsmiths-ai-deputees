-- Update the three new outcome packs to match existing product style

-- Individual Uplift - remove "Pack" and shorten description
UPDATE public.products 
SET title = 'Individual Uplift',
    description = 'Transform your meetings, chats, and emails into AI-powered insights and coaching nudges for rapid personal improvement',
    deliverables = 'AI analysis of communications
Personal coaching prompts
Progress tracking dashboard
Optional human coaching'
WHERE title = 'Individual Uplift Pack';

-- Team Uplift - remove "Pack" and shorten description  
UPDATE public.products
SET title = 'Team Uplift',
    description = 'Turn team communication into a performance engine with collaboration insights and coaching for up to 15 members',
    deliverables = 'Team communication analysis
Role-specific coaching nudges
Automated action summaries
Team progress tracking
Optional human facilitation'
WHERE title = 'Team Uplift Pack';

-- Organisation Uplift - remove "Pack" and shorten description
UPDATE public.products
SET title = 'Organisation Uplift', 
    description = 'Scale insights across multiple teams with role-based coaching and organisation-wide performance dashboards',
    deliverables = 'Multi-team integration
Organisation dashboard
Automated reporting
Bespoke frameworks
Leadership coaching'
WHERE title = 'Organisation Uplift Pack';