-- Ensure extensions schema exists and move pgvector there to satisfy linter
CREATE SCHEMA IF NOT EXISTS extensions;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    ALTER EXTENSION vector SET SCHEMA extensions;
  END IF;
END $$;

-- Recreate helper functions with fixed search_path
CREATE OR REPLACE FUNCTION public.is_admin(_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public, extensions
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = _uid AND p.is_admin = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_project_participant(_project_id uuid, _uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public, extensions
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_participants pp
    WHERE pp.project_id = _project_id AND pp.user_id = _uid
  );
$$;

CREATE OR REPLACE FUNCTION public.get_project_id_from_deliverable(_deliverable_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public, extensions
AS $$
  SELECT d.project_id FROM public.deliverables d WHERE d.id = _deliverable_id;
$$;

CREATE OR REPLACE FUNCTION public.get_project_id_from_document(_document_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public, extensions
AS $$
  SELECT doc.project_id FROM public.documents doc WHERE doc.id = _document_id;
$$;

CREATE OR REPLACE FUNCTION public.get_project_id_from_milestone(_milestone_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public, extensions
AS $$
  SELECT m.project_id FROM public.milestones m WHERE m.id = _milestone_id;
$$;