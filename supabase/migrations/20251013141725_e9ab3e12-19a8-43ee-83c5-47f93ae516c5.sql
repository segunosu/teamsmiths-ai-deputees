-- Update AI Deputy to AI Deputee™ in all case studies
UPDATE public.business_case_studies 
SET solution = REPLACE(solution, 'AI Deputy', 'AI Deputee™')
WHERE solution LIKE '%AI Deputy%';

UPDATE public.business_case_studies 
SET challenge = REPLACE(challenge, 'AI Deputy', 'AI Deputee™')
WHERE challenge LIKE '%AI Deputy%';

UPDATE public.business_case_studies 
SET title = REPLACE(title, 'AI Deputy', 'AI Deputee™')
WHERE title LIKE '%AI Deputy%';

UPDATE public.business_case_studies 
SET short_summary = REPLACE(short_summary, 'AI Deputy', 'AI Deputee™')
WHERE short_summary LIKE '%AI Deputy%';