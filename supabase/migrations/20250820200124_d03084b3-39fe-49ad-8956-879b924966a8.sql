-- Fix RLS visibility by adding participants to the existing project
-- NOTE: previous attempt failed due to CHECK constraint disallowing role = 'admin'.
-- We'll insert participants with an allowed role ('client').

-- Add all known users as participants (idempotent)
INSERT INTO public.project_participants (project_id, user_id, role)
SELECT 'b63792d5-ac44-466b-adbf-ee727f0adf35'::uuid, '74a1805e-229b-4dc4-bb7b-005ace57e901'::uuid, 'client'
WHERE NOT EXISTS (
  SELECT 1 FROM public.project_participants 
  WHERE project_id = 'b63792d5-ac44-466b-adbf-ee727f0adf35'::uuid AND user_id = '74a1805e-229b-4dc4-bb7b-005ace57e901'::uuid
);

INSERT INTO public.project_participants (project_id, user_id, role)
SELECT 'b63792d5-ac44-466b-adbf-ee727f0adf35'::uuid, 'af0f6416-bc3f-4c22-b543-57aa10c83a7c'::uuid, 'client'
WHERE NOT EXISTS (
  SELECT 1 FROM public.project_participants 
  WHERE project_id = 'b63792d5-ac44-466b-adbf-ee727f0adf35'::uuid AND user_id = 'af0f6416-bc3f-4c22-b543-57aa10c83a7c'::uuid
);

INSERT INTO public.project_participants (project_id, user_id, role)
SELECT 'b63792d5-ac44-466b-adbf-ee727f0adf35'::uuid, '64f63b1f-bcf4-41f1-9e1f-951b7b5d0959'::uuid, 'client'
WHERE NOT EXISTS (
  SELECT 1 FROM public.project_participants 
  WHERE project_id = 'b63792d5-ac44-466b-adbf-ee727f0adf35'::uuid AND user_id = '64f63b1f-bcf4-41f1-9e1f-951b7b5d0959'::uuid
);