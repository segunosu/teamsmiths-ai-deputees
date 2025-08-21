-- Add new subcategory for AI Readiness & Automation under Continuous Improvement
INSERT INTO public.subcategories (name, slug, category_id) VALUES 
(
  'AI Readiness & Automation', 
  'ai-readiness-automation', 
  '01d9e50d-a113-44d0-ae6d-2f0c59113ec7'
);

-- Add the 3 new AI Readiness & Automation Outcome Packs
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
) VALUES 
(
  'AI Starter Audit',
  'Rapid AI audit for SMEs. Identify where AI can cut admin, boost workflows, and deliver quick ROI.',
  'AI Readiness Score, 3 Quick Wins automation pilot, 30-day roadmap.',
  '1-2 weeks',
  95000, -- £950 in pence
  '01d9e50d-a113-44d0-ae6d-2f0c59113ec7',
  (SELECT id FROM public.subcategories WHERE slug = 'ai-readiness-automation'),
  ARRAY['ai-readiness', 'automation', 'sme', 'audit'],
  true,
  true
),
(
  'AI Pilot Sprint',
  'Hands-on sprint to run AI pilots in live workflows, set up light governance, and coach teams.',
  '2–3 pilots, governance lite, team training, ROI tracker.',
  '3-4 weeks',
  245000, -- £2,450 in pence
  '01d9e50d-a113-44d0-ae6d-2f0c59113ec7',
  (SELECT id FROM public.subcategories WHERE slug = 'ai-readiness-automation'),
  ARRAY['ai-pilots', 'governance', 'team-training', 'sprint'],
  true,
  true
),
(
  'AI Strategy & Scale',
  'Board-level AI strategy and scaled automation for SMEs. Build confidence, governance, and scale impact.',
  'Strategy + roadmap, governance model, 3–5 automations, executive workshop.',
  '6-8 weeks',
  495000, -- £4,950 in pence
  '01d9e50d-a113-44d0-ae6d-2f0c59113ec7',
  (SELECT id FROM public.subcategories WHERE slug = 'ai-readiness-automation'),
  ARRAY['ai-strategy', 'executive', 'automation-scale', 'governance'],
  true,
  true
);