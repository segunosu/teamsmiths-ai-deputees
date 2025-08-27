-- Harden zapier_fallback policies and remove public fallback access
-- Ensure RLS and FORCE RLS
ALTER TABLE public.zapier_fallback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zapier_fallback FORCE ROW LEVEL SECURITY;

-- Remove any permissive fallback policy if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'zapier_fallback' AND policyname = 'Fallback access'
  ) THEN
    EXECUTE 'DROP POLICY "Fallback access" ON public.zapier_fallback';
  END IF;
END $$;

-- Revoke broad privileges from client roles (RLS still applies but this is defense-in-depth)
REVOKE ALL ON TABLE public.zapier_fallback FROM anon, authenticated;

-- Recreate strict policies idempotently
DROP POLICY IF EXISTS "Insert zapier_fallback (authenticated)" ON public.zapier_fallback;
CREATE POLICY "Insert zapier_fallback (authenticated)"
ON public.zapier_fallback
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Select zapier_fallback (admin only)" ON public.zapier_fallback;
CREATE POLICY "Select zapier_fallback (admin only)"
ON public.zapier_fallback
FOR SELECT
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Update zapier_fallback (admin only)" ON public.zapier_fallback;
CREATE POLICY "Update zapier_fallback (admin only)"
ON public.zapier_fallback
FOR UPDATE
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Delete zapier_fallback (admin only)" ON public.zapier_fallback;
CREATE POLICY "Delete zapier_fallback (admin only)"
ON public.zapier_fallback
FOR DELETE
USING (public.is_admin(auth.uid()));