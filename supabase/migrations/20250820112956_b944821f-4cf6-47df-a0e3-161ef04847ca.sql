-- Clean up deliverables formatting by removing literal \n and bullet points
UPDATE products 
SET deliverables = TRIM(REPLACE(REPLACE(deliverables, '\n• ', E'\n'), '• ', ''))
WHERE deliverables LIKE '%\\n%' OR deliverables LIKE '%•%';