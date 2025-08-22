-- Move Agile Sprint Setup and Sprint Velocity Optimizer to Process Optimization category
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE slug = 'process-optimization')
WHERE title IN ('Agile Sprint Setup', 'Sprint Velocity Optimizer');