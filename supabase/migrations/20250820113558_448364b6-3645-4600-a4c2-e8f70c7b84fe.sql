-- Strengthen security for leads table: add created_by, triggers, and RLS policies

-- 1) Schema changes
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS created_by uuid;

CREATE INDEX IF NOT EXISTS idx_leads_created_by ON public.leads(created_by);

-- 2) Triggers to set ownership and timestamps
CREATE OR REPLACE FUNCTION public.set_leads_created_by()
RETURNS trigger AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  NEW.last_updated := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_set_leads_created_by ON public.leads;
CREATE TRIGGER trg_set_leads_created_by
BEFORE INSERT ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.set_leads_created_by();

CREATE OR REPLACE FUNCTION public.touch_leads_last_updated()
RETURNS trigger AS $$
BEGIN
  NEW.last_updated := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_touch_leads_last_updated ON public.leads;
CREATE TRIGGER trg_touch_leads_last_updated
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.touch_leads_last_updated();

-- 3) RLS policies - restrict visibility to owner or admin
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop overly permissive existing policies
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update leads" ON public.leads;

-- Replace with secure policies
CREATE POLICY "Insert own leads (authenticated)"
ON public.leads
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "View own leads or admin"
ON public.leads
FOR SELECT
USING (created_by = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Update own leads or admin"
ON public.leads
FOR UPDATE
USING (created_by = auth.uid() OR is_admin(auth.uid()))
WITH CHECK (created_by = auth.uid() OR is_admin(auth.uid()));