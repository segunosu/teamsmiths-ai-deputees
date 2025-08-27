-- Remove public SELECT policy from admin_settings
DROP POLICY IF EXISTS "Everyone can view settings" ON public.admin_settings;

-- Create a SECURITY DEFINER function to expose only safe, non-sensitive settings
CREATE OR REPLACE FUNCTION public.get_public_settings()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb := '{}'::jsonb;
BEGIN
  -- Whitelist only non-sensitive keys that the public UI needs
  SELECT COALESCE(jsonb_object_agg(setting_key, setting_value), '{}'::jsonb)
  INTO result
  FROM public.admin_settings
  WHERE setting_key IN (
    'shortlist_size_default',
    'invite_response_sla_hours',
    'allow_custom_request_without_login'
  );

  RETURN result;
END;
$$;