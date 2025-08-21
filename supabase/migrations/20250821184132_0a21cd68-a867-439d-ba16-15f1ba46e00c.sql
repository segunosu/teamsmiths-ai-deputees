-- 1) Series table (new)
CREATE TABLE IF NOT EXISTS public.series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory_id uuid REFERENCES public.subcategories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 2) Products: series linkage + tier meta
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS series_id uuid REFERENCES public.series(id) ON DELETE SET NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tier text CHECK (tier IN ('lite','team','org'));
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS timeline_days int;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS most_popular boolean DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS outcomes jsonb;

-- 3) Public read RLS for series
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname='Series publicly viewable' AND tablename='series'
  ) THEN
    CREATE POLICY "Series publicly viewable" ON public.series
      FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- 4) Admin can manage series
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname='Admins can manage series' AND tablename='series'
  ) THEN
    CREATE POLICY "Admins can manage series" ON public.series
      FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
  END IF;
END $$;

-- Seed Series
INSERT INTO public.series (category_id, subcategory_id, name, slug, description) VALUES
(
  (SELECT id FROM public.categories WHERE slug='continuous-improvement'),
  (SELECT id FROM public.subcategories WHERE slug='ai-readiness-automation'),
  'AI Readiness & Automation',
  'ai-readiness',
  'Get AI-ready fast: audit, pilots, and governance to scale automation safely.'
),
(
  (SELECT id FROM public.categories WHERE slug='continuous-improvement'),
  (SELECT id FROM public.subcategories WHERE slug='team-productivity'),
  'CI Uplift Series',
  'ci-uplift',
  'Boost individual, team, and org performance with data-driven nudges and lightweight coaching.'
),
(
  (SELECT id FROM public.categories WHERE slug='compliance'),
  NULL,
  'Compliance Accelerator',
  'compliance-accelerator',
  'Fast-track GDPR/HR essentials with QA and milestone-based delivery.'
),
(
  (SELECT id FROM public.categories WHERE slug='sales-acceleration'),
  NULL,
  'Sales Acceleration Core',
  'sales-core',
  'Lead generation, outbound sprints, and RevOps setup—choose your tier and go.'
)
ON CONFLICT (slug) DO NOTHING;

-- Map existing AI products to series
UPDATE public.products SET 
  series_id = (SELECT id FROM public.series WHERE slug='ai-readiness'),
  tier = 'lite',
  timeline_days = 14
WHERE title = 'AI Starter Audit';

UPDATE public.products SET 
  series_id = (SELECT id FROM public.series WHERE slug='ai-readiness'),
  tier = 'team',
  most_popular = true,
  timeline_days = 28
WHERE title = 'AI Pilot Sprint';

UPDATE public.products SET 
  series_id = (SELECT id FROM public.series WHERE slug='ai-readiness'),
  tier = 'org',
  timeline_days = 42
WHERE title = 'AI Strategy & Scale';