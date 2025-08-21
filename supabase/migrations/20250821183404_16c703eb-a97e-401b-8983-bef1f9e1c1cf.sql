-- 1) Soft-deactivate support on categories/subcategories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.subcategories ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- 2) Ensure CI exists and create needed CI subcategories
-- Team Productivity under CI
INSERT INTO public.subcategories (category_id, name, slug)
SELECT (SELECT id FROM public.categories WHERE slug = 'continuous-improvement'), 'Team Productivity', 'team-productivity'
WHERE NOT EXISTS (SELECT 1 FROM public.subcategories WHERE slug = 'team-productivity');

-- Process Optimization under CI
INSERT INTO public.subcategories (category_id, name, slug)
SELECT (SELECT id FROM public.categories WHERE slug = 'continuous-improvement'), 'Process Optimization', 'process-optimization'
WHERE NOT EXISTS (SELECT 1 FROM public.subcategories WHERE slug = 'process-optimization');

-- App Dev (Enabler) under CI
INSERT INTO public.subcategories (category_id, name, slug)
SELECT (SELECT id FROM public.categories WHERE slug = 'continuous-improvement'), 'App Dev (Enabler)', 'app-dev-enablers'
WHERE NOT EXISTS (SELECT 1 FROM public.subcategories WHERE slug = 'app-dev-enablers');

-- 3) Reassign products from "orphan" top-level categories into CI subcategories
-- Move anything in the Team Productivity top-level category into CI → Team Productivity
UPDATE public.products p
SET category_id = (SELECT id FROM public.categories WHERE slug = 'continuous-improvement'),
    subcategory_id = (SELECT id FROM public.subcategories WHERE slug = 'team-productivity')
WHERE p.category_id = (SELECT id FROM public.categories WHERE slug = 'team-productivity');

-- Move anything in the Process Optimization top-level category into CI → Process Optimization
UPDATE public.products p
SET category_id = (SELECT id FROM public.categories WHERE slug = 'continuous-improvement'),
    subcategory_id = (SELECT id FROM public.subcategories WHERE slug = 'process-optimization')
WHERE p.category_id = (SELECT id FROM public.categories WHERE slug = 'process-optimization');

-- Move anything in the Software Development top-level category into CI → App Dev (Enabler)
UPDATE public.products p
SET category_id = (SELECT id FROM public.categories WHERE slug = 'continuous-improvement'),
    subcategory_id = (SELECT id FROM public.subcategories WHERE slug = 'app-dev-enablers')
WHERE p.category_id = (SELECT id FROM public.categories WHERE slug = 'software-development');

-- 4) Soft-deactivate the extra top-level categories so they no longer appear as chips
UPDATE public.categories
SET is_active = false
WHERE slug IN ('software-development','team-productivity','process-optimization');