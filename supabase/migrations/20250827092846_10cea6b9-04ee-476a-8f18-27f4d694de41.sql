-- Secure zapier_fallback: restrict public access and enable RLS
-- 1) Ensure RLS is enabled
ALTER TABLE public.zapier_fallback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zapier_fallback FORCE ROW LEVEL SECURITY;

-- 2) Drop any overly-permissive/public policies if they exist
DROP POLICY IF EXISTS "zapier_fallback_allow_all" ON public.zapier_fallback;
DROP POLICY IF EXISTS "Allow all" ON public.zapier_fallback;
DROP POLICY IF EXISTS "Public access" ON public.zapier_fallback;
DROP POLICY IF EXISTS "anon_access" ON public.zapier_fallback;
DROP POLICY IF EXISTS "allow all" ON public.zapier_fallback;

-- 3) Create restrictive policies
-- Allow INSERTs only from authenticated users (service role bypasses RLS and will continue to work for edge functions/Zapier integrations using the service key)
CREATE POLICY "Insert zapier_fallback (authenticated)"
ON public.zapier_fallback
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Only admins can read these email addresses
CREATE POLICY "Select zapier_fallback (admin only)"
ON public.zapier_fallback
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Only admins can update/delete
CREATE POLICY "Update zapier_fallback (admin only)"
ON public.zapier_fallback
FOR UPDATE
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Delete zapier_fallback (admin only)"
ON public.zapier_fallback
FOR DELETE
USING (public.is_admin(auth.uid()));