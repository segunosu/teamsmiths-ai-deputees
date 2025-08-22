BEGIN;
-- Ensure base series exist
INSERT INTO series (name, slug, description, category_id, is_active)
SELECT 'Sales Acceleration Core', 'sales-core', 'Fast-track your sales growth with proven lead generation and outbound strategies.', c.id, true
FROM categories c
WHERE c.slug = 'sales-acceleration'
  AND NOT EXISTS (SELECT 1 FROM series s WHERE s.slug = 'sales-core');

INSERT INTO series (name, slug, description, category_id, is_active)
SELECT 'Compliance Accelerator', 'compliance-accelerator', 'Ensure regulatory compliance with streamlined GDPR and data protection frameworks.', c.id, true
FROM categories c
WHERE c.slug = 'compliance'
  AND NOT EXISTS (SELECT 1 FROM series s WHERE s.slug = 'compliance-accelerator');

INSERT INTO series (name, slug, description, category_id, is_active)
SELECT 'CI Uplift Series', 'ci-uplift', 'Transform your organization with comprehensive continuous improvement initiatives.', c.id, true
FROM categories c
WHERE c.slug = 'continuous-improvement'
  AND NOT EXISTS (SELECT 1 FROM series s WHERE s.slug = 'ci-uplift');

-- Create CI subcategory series if missing (use subcategory slugs as series slugs)
INSERT INTO series (name, slug, description, category_id, subcategory_id, is_active)
SELECT sc.name, sc.slug, 
       CASE sc.slug 
         WHEN 'team-productivity' THEN 'Boost your team''s efficiency and collaboration with proven productivity frameworks and tools.'
         WHEN 'process-optimization' THEN 'Streamline operations and optimize workflows with data-driven process improvements.'
         WHEN 'app-dev-enablers' THEN 'Accelerate your development lifecycle with modern DevOps and agile practices.'
         ELSE sc.name
       END,
       sc.category_id, sc.id, true
FROM subcategories sc
JOIN categories c ON c.id = sc.category_id
WHERE c.slug = 'continuous-improvement'
  AND sc.slug IN ('team-productivity','process-optimization','app-dev-enablers')
  AND NOT EXISTS (SELECT 1 FROM series s WHERE s.slug = sc.slug);

-- Map products to their series
-- Sales → sales-core
UPDATE products p
SET series_id = (SELECT id FROM series WHERE slug = 'sales-core'),
    tier = COALESCE(p.tier, 'lite')
WHERE p.is_active = true
  AND p.category_id = (SELECT id FROM categories WHERE slug = 'sales-acceleration')
  AND p.series_id IS NULL;

-- Compliance → compliance-accelerator
UPDATE products p
SET series_id = (SELECT id FROM series WHERE slug = 'compliance-accelerator'),
    tier = COALESCE(p.tier, 'lite')
WHERE p.is_active = true
  AND p.category_id = (SELECT id FROM categories WHERE slug = 'compliance')
  AND p.series_id IS NULL;

-- Service CI → ci-uplift (ladder tiers by price)
UPDATE products p
SET series_id = (SELECT id FROM series WHERE slug = 'ci-uplift'),
    tier = COALESCE(p.tier,
      CASE 
        WHEN p.base_price <= 100000 THEN 'lite'
        WHEN p.base_price <= 300000 THEN 'team'
        ELSE 'org'
      END)
WHERE p.is_active = true
  AND p.subcategory_id = (SELECT id FROM subcategories WHERE slug = 'service-ci')
  AND p.series_id IS NULL;

-- CI subcategories → matching series (lite if single)
UPDATE products p
SET series_id = (SELECT id FROM series WHERE slug = 'team-productivity'),
    tier = COALESCE(p.tier, 'lite')
WHERE p.is_active = true
  AND p.subcategory_id = (SELECT id FROM subcategories WHERE slug = 'team-productivity')
  AND p.series_id IS NULL;

UPDATE products p
SET series_id = (SELECT id FROM series WHERE slug = 'process-optimization'),
    tier = COALESCE(p.tier, 'lite')
WHERE p.is_active = true
  AND p.subcategory_id = (SELECT id FROM subcategories WHERE slug = 'process-optimization')
  AND p.series_id IS NULL;

UPDATE products p
SET series_id = (SELECT id FROM series WHERE slug = 'app-dev-enablers'),
    tier = COALESCE(p.tier, 'lite')
WHERE p.is_active = true
  AND p.subcategory_id = (SELECT id FROM subcategories WHERE slug = 'app-dev-enablers')
  AND p.series_id IS NULL;

-- Set default timelines where missing
UPDATE products p
SET timeline_days = 
  CASE 
    WHEN COALESCE(p.tier, 'lite') = 'lite' THEN 7
    WHEN p.tier = 'team' THEN 14
    WHEN p.tier = 'org' THEN 21
    ELSE 7
  END
WHERE p.timeline_days IS NULL
  AND p.is_active = true;

-- Mark middle tier as most popular for multi-tier series
UPDATE products p
SET most_popular = true
WHERE p.tier = 'team'
  AND p.series_id IN (
    SELECT series_id FROM products WHERE is_active = true AND series_id IS NOT NULL GROUP BY series_id HAVING COUNT(*) > 1
  );

-- Deactivate empty series (no active products)
UPDATE series s
SET is_active = false
WHERE s.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM products p WHERE p.series_id = s.id AND p.is_active = true
  );
COMMIT;