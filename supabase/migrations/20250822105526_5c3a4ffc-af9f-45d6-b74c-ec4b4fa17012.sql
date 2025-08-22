-- Update categories for catalog cleanup
-- First, add the new categories we need
INSERT INTO categories (name, slug, is_active) VALUES 
('Performance Improvement', 'performance-improvement', true),
('Process Optimization', 'process-optimization', true)
ON CONFLICT (slug) DO UPDATE SET is_active = true;

-- Update existing categories to be active/inactive as needed
UPDATE categories SET is_active = true WHERE slug IN ('sales-acceleration', 'compliance');
UPDATE categories SET is_active = false WHERE slug IN ('software-development', 'team-productivity');

-- Update products that were in "Continuous Improvement" to be split between the two new categories
-- Performance-related products go to Performance Improvement
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'performance-improvement')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'continuous-improvement')
AND (title ILIKE '%performance%' OR title ILIKE '%productivity%' OR title ILIKE '%coaching%' OR title ILIKE '%uplift%' OR title ILIKE '%agile%' OR title ILIKE '%team%');

-- Process-related products go to Process Optimization  
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'process-optimization')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'continuous-improvement')
AND (title ILIKE '%quality%' OR title ILIKE '%devops%' OR title ILIKE '%automation%' OR title ILIKE '%process%' OR title ILIKE '%qa%');

-- Remaining CI products default to Performance Improvement
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'performance-improvement')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'continuous-improvement');

-- Deactivate the old Continuous Improvement category
UPDATE categories SET is_active = false WHERE slug = 'continuous-improvement';