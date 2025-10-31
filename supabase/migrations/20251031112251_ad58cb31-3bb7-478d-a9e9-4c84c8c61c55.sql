-- Fix security warning: Set search_path for update_user_profiles_updated_at function
DROP TRIGGER IF EXISTS set_user_profiles_updated_at ON public.user_profiles;
DROP FUNCTION IF EXISTS update_user_profiles_updated_at();

CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_user_profiles_updated_at();