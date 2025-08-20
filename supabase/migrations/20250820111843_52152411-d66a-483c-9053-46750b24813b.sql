-- Add new categories for software development and general services
INSERT INTO categories (name, slug) VALUES 
('Software Development', 'software-development'),
('Process Optimization', 'process-optimization'),
('Team Productivity', 'team-productivity')
ON CONFLICT (slug) DO NOTHING;

-- Add subcategories
INSERT INTO subcategories (name, slug, category_id) VALUES 
('Agile Transformation', 'agile-transformation', (SELECT id FROM categories WHERE slug = 'software-development')),
('DevOps Implementation', 'devops-implementation', (SELECT id FROM categories WHERE slug = 'software-development')),
('Sprint Optimization', 'sprint-optimization', (SELECT id FROM categories WHERE slug = 'software-development')),
('Code Quality', 'code-quality', (SELECT id FROM categories WHERE slug = 'software-development')),
('Workflow Optimization', 'workflow-optimization', (SELECT id FROM categories WHERE slug = 'process-optimization')),
('Performance Analytics', 'performance-analytics', (SELECT id FROM categories WHERE slug = 'process-optimization')),
('Team Collaboration', 'team-collaboration', (SELECT id FROM categories WHERE slug = 'team-productivity')),
('Productivity Systems', 'productivity-systems', (SELECT id FROM categories WHERE slug = 'team-productivity'))
ON CONFLICT (slug) DO NOTHING;

-- Add new products for Software Development companies
INSERT INTO products (title, description, deliverables, timeline, base_price, tags, category_id, subcategory_id, is_active, is_fixed_scope) VALUES 
(
  'Agile Sprint Setup',
  'Transform your team from chaos to structured sprints with proper ceremonies and metrics',
  '• Sprint planning templates\n• Daily standup framework\n• Retrospective templates\n• Velocity tracking dashboard\n• Definition of Done checklist',
  '2 weeks',
  89900,
  ARRAY['agile', 'scrum', 'sprint-planning', 'ceremonies'],
  (SELECT id FROM categories WHERE slug = 'software-development'),
  (SELECT id FROM subcategories WHERE slug = 'agile-transformation')
),
(
  'DevOps Pipeline Starter',
  'CI/CD pipeline setup with automated testing and deployment for faster, safer releases',
  '• CI/CD pipeline configuration\n• Automated testing setup\n• Deployment automation\n• Monitoring dashboard\n• Best practices guide',
  '3 weeks',
  149900,
  ARRAY['devops', 'ci-cd', 'automation', 'deployment'],
  (SELECT id FROM categories WHERE slug = 'software-development'),
  (SELECT id FROM subcategories WHERE slug = 'devops-implementation')
),
(
  'Code Quality Boost',
  'Implement code review processes, quality gates, and technical debt reduction plan',
  '• Code review guidelines\n• Quality gate setup\n• Technical debt assessment\n• Refactoring roadmap\n• Team training materials',
  '2 weeks',
  99900,
  ARRAY['code-quality', 'technical-debt', 'code-review'],
  (SELECT id FROM categories WHERE slug = 'software-development'),
  (SELECT id FROM subcategories WHERE slug = 'code-quality')
),
(
  'Sprint Velocity Optimizer',
  'Optimize sprint performance with advanced metrics, bottleneck analysis, and team coaching',
  '• Velocity tracking setup\n• Bottleneck analysis\n• Sprint retrospective optimization\n• Team performance coaching\n• Continuous improvement plan',
  '4 weeks',
  179900,
  ARRAY['sprint-optimization', 'velocity', 'metrics', 'coaching'],
  (SELECT id FROM categories WHERE slug = 'software-development'),
  (SELECT id FROM subcategories WHERE slug = 'sprint-optimization')
);

-- Add new products for Sales/Marketing companies with scrum approach
INSERT INTO products (title, description, deliverables, timeline, base_price, tags, category_id, subcategory_id, is_active, is_fixed_scope) VALUES 
(
  'Marketing Sprint Framework',
  'Apply agile methodology to marketing campaigns with sprint planning and continuous optimization',
  '• Marketing sprint templates\n• Campaign backlog management\n• Performance tracking dashboard\n• Weekly sprint reviews\n• Continuous improvement process',
  '3 weeks',
  119900,
  ARRAY['marketing-agile', 'campaign-management', 'sprints'],
  (SELECT id FROM categories WHERE slug = 'sales-acceleration'),
  (SELECT id FROM subcategories WHERE slug = 'cadence-management')
),
(
  'Sales Team Scrum Setup',
  'Implement scrum methodology for sales teams with daily standups, sprint goals, and performance tracking',
  '• Sales sprint planning\n• Daily standup framework\n• Sales velocity tracking\n• Territory retrospectives\n• Goal alignment system',
  '2 weeks',
  109900,
  ARRAY['sales-scrum', 'team-productivity', 'performance'],
  (SELECT id FROM categories WHERE slug = 'sales-acceleration'),
  (SELECT id FROM subcategories WHERE slug = 'cadence-management')
);

-- Add new products for general service companies
INSERT INTO products (title, description, deliverables, timeline, base_price, tags, category_id, subcategory_id, is_active, is_fixed_scope) VALUES 
(
  'Service Workflow Optimizer',
  'Streamline service delivery processes with bottleneck analysis and workflow automation',
  '• Current workflow analysis\n• Bottleneck identification\n• Process automation plan\n• Standard operating procedures\n• Performance metrics setup',
  '3 weeks',
  129900,
  ARRAY['workflow', 'process-improvement', 'automation'],
  (SELECT id FROM categories WHERE slug = 'process-optimization'),
  (SELECT id FROM subcategories WHERE slug = 'workflow-optimization')
),
(
  'Customer Experience Sprint',
  'Rapid customer experience improvement with journey mapping and touchpoint optimization',
  '• Customer journey mapping\n• Touchpoint analysis\n• Experience optimization plan\n• Feedback collection system\n• Improvement roadmap',
  '2 weeks',
  99900,
  ARRAY['customer-experience', 'journey-mapping', 'optimization'],
  (SELECT id FROM categories WHERE slug = 'process-optimization'),
  (SELECT id FROM subcategories WHERE slug = 'performance-analytics')
),
(
  'Team Productivity Accelerator',
  'Boost team performance with productivity systems, collaboration tools, and performance tracking',
  '• Productivity system setup\n• Collaboration framework\n• Performance dashboards\n• Meeting optimization\n• Focus time protocols',
  '3 weeks',
  139900,
  ARRAY['productivity', 'collaboration', 'performance'],
  (SELECT id FROM categories WHERE slug = 'team-productivity'),
  (SELECT id FROM subcategories WHERE slug = 'team-collaboration')
),
(
  'Operational Excellence Sprint',
  'Comprehensive operational improvement with KPI tracking, process optimization, and team alignment',
  '• Operational KPI setup\n• Process mapping & optimization\n• Team alignment framework\n• Performance tracking system\n• Continuous improvement plan',
  '4 weeks',
  189900,
  ARRAY['operations', 'kpi', 'excellence', 'alignment'],
  (SELECT id FROM categories WHERE slug = 'process-optimization'),
  (SELECT id FROM subcategories WHERE slug = 'performance-analytics')
);