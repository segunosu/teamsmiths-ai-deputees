-- Update case study CTAs to use "Learn More" and link to Solutions page sections
UPDATE public.business_case_studies 
SET cta_primary = 'Learn More',
    cta_primary_url = '/solutions#sales'
WHERE category = 'sales';

UPDATE public.business_case_studies 
SET cta_primary = 'Learn More',
    cta_primary_url = '/solutions#finance'
WHERE category = 'finance';

UPDATE public.business_case_studies 
SET cta_primary = 'Learn More',
    cta_primary_url = '/solutions#operations'
WHERE category = 'operations';

UPDATE public.business_case_studies 
SET cta_primary = 'Learn More',
    cta_primary_url = '/solutions#hr'
WHERE category = 'hr';

UPDATE public.business_case_studies 
SET cta_primary = 'Learn More',
    cta_primary_url = '/solutions#marketing'
WHERE category = 'marketing';

UPDATE public.business_case_studies 
SET cta_primary = 'Learn More',
    cta_primary_url = '/solutions#customer-service'
WHERE category = 'customer_service';