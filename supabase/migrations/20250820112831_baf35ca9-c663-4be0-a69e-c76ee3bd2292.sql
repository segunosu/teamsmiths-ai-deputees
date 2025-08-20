-- Remove duplicate products created at 2025-08-20 11:19:41
DELETE FROM products WHERE created_at = '2025-08-20 11:19:41.211425+00' AND title IN (
  'Agile Sprint Setup',
  'Code Quality Boost', 
  'Customer Experience Sprint',
  'DevOps Pipeline Starter',
  'Marketing Sprint Framework',
  'Operational Excellence Sprint',
  'Sales Team Scrum Setup',
  'Service Workflow Optimizer',
  'Sprint Velocity Optimizer',
  'Team Productivity Accelerator'
);