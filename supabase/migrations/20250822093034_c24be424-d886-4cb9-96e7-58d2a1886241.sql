-- Fix series mapping for all existing products
-- Map products to their appropriate series based on categories and subcategories

-- Sales Acceleration products to Sales Acceleration Core series
UPDATE products 
SET series_id = (SELECT id FROM series WHERE slug = 'sales-core'),
    tier = 'lite'
WHERE category_id = (SELECT id FROM categories WHERE slug = 'sales-acceleration')
  AND series_id IS NULL;

-- Compliance products to Compliance Accelerator series  
UPDATE products 
SET series_id = (SELECT id FROM series WHERE slug = 'compliance-accelerator'),
    tier = 'lite'
WHERE category_id = (SELECT id FROM categories WHERE slug = 'compliance')
  AND series_id IS NULL;

-- CI products - map to appropriate series based on subcategory
-- Team Productivity products
UPDATE products 
SET series_id = (
  INSERT INTO series (name, slug, description, category_id, subcategory_id) 
  VALUES (
    'Team Productivity Suite',
    'team-productivity-suite', 
    'Boost your team''s efficiency and collaboration with proven productivity frameworks and tools.',
    (SELECT id FROM categories WHERE slug = 'continuous-improvement'),
    (SELECT id FROM subcategories WHERE slug = 'team-productivity')
  ) 
  RETURNING id
),
tier = 'lite'
WHERE subcategory_id = (SELECT id FROM subcategories WHERE slug = 'team-productivity')
  AND series_id IS NULL;

-- Process Optimization products
UPDATE products 
SET series_id = (
  INSERT INTO series (name, slug, description, category_id, subcategory_id) 
  VALUES (
    'Process Excellence Suite',
    'process-excellence-suite',
    'Streamline operations and optimize workflows with data-driven process improvements.',
    (SELECT id FROM categories WHERE slug = 'continuous-improvement'),
    (SELECT id FROM subcategories WHERE slug = 'process-optimization')
  ) 
  RETURNING id
),
tier = 'lite'
WHERE subcategory_id = (SELECT id FROM subcategories WHERE slug = 'process-optimization')
  AND series_id IS NULL;

-- App Dev Enabler products
UPDATE products 
SET series_id = (
  INSERT INTO series (name, slug, description, category_id, subcategory_id) 
  VALUES (
    'Development Accelerator Suite',
    'dev-accelerator-suite',
    'Accelerate your development lifecycle with modern DevOps practices and agile methodologies.',
    (SELECT id FROM categories WHERE slug = 'continuous-improvement'),
    (SELECT id FROM subcategories WHERE slug = 'app-dev-enablers')
  ) 
  RETURNING id
),
tier = 'lite'
WHERE subcategory_id = (SELECT id FROM subcategories WHERE slug = 'app-dev-enablers')
  AND series_id IS NULL;

-- Service CI products - map to CI Uplift series
UPDATE products 
SET series_id = (SELECT id FROM series WHERE slug = 'ci-uplift'),
    tier = CASE 
      WHEN base_price <= 100000 THEN 'lite'
      WHEN base_price <= 300000 THEN 'team'  
      ELSE 'org'
    END
WHERE subcategory_id = (SELECT id FROM subcategories WHERE slug = 'service-ci')
  AND series_id IS NULL;

-- Update series descriptions for better UX
UPDATE series 
SET description = 'Fast-track your sales growth with proven lead generation and outbound strategies.'
WHERE slug = 'sales-core';

UPDATE series 
SET description = 'Ensure regulatory compliance with streamlined GDPR and data protection frameworks.'
WHERE slug = 'compliance-accelerator';

UPDATE series 
SET description = 'Transform your organization with comprehensive continuous improvement initiatives.'
WHERE slug = 'ci-uplift';

-- Set timeline_days and most_popular flags for better display
UPDATE products SET timeline_days = 
  CASE 
    WHEN tier = 'lite' THEN 7
    WHEN tier = 'team' THEN 14
    WHEN tier = 'org' THEN 21
    ELSE 7
  END
WHERE timeline_days IS NULL;

-- Mark middle tiers as most popular for multi-tier series
UPDATE products SET most_popular = true
WHERE tier = 'team' 
  AND series_id IN (
    SELECT series_id FROM products 
    WHERE series_id IS NOT NULL 
    GROUP BY series_id 
    HAVING COUNT(*) > 1
  );