-- Fix remaining security issues after the first migration

-- 1. Fix function search path mutable warnings by updating all existing functions
CREATE OR REPLACE FUNCTION public.set_leads_created_by()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  NEW.last_updated := now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.touch_leads_last_updated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.last_updated := now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_public_settings()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_type text, p_title text, p_message text, p_related_id uuid DEFAULT NULL::uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, related_id)
  VALUES (p_user_id, p_type, p_title, p_message, p_related_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_storage_upload()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only set owner if owner column exists and is not already set
  IF TG_OP = 'INSERT' AND NEW.owner IS NULL THEN
    NEW.owner := auth.uid();
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_projects_for_user(_uid uuid)
RETURNS SETOF projects
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT p.*
  FROM public.projects p
  WHERE (
    -- Admins can see all projects
    public.is_admin(auth.uid())
  ) OR (
    -- Otherwise, only allow requesting your own projects
    _uid = auth.uid()
    AND (
      p.teamsmith_user_id = _uid
      OR EXISTS (
        SELECT 1 FROM public.project_participants pp
        WHERE pp.project_id = p.id AND pp.user_id = _uid
      )
    )
  )
  ORDER BY p.created_at DESC;
$function$;

CREATE OR REPLACE FUNCTION public.update_admin_setting(p_key text, p_value jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'not_authorized';
  end if;

  insert into public.admin_settings (setting_key, setting_value, updated_at, updated_by)
  values (p_key, p_value, now(), auth.uid())
  on conflict (setting_key)
  do update set setting_value = excluded.setting_value,
               updated_at = now(),
               updated_by = auth.uid();
end;
$function$;

CREATE OR REPLACE FUNCTION public.link_briefs_to_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Link any unattached briefs with matching email to this user
  UPDATE public.briefs 
  SET user_id = NEW.id
  WHERE contact_email = NEW.email 
    AND user_id IS NULL;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email
  );
  RETURN new;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin(_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = _uid AND p.is_admin = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_project_participant(_project_id uuid, _uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.project_participants pp
    WHERE pp.project_id = _project_id AND pp.user_id = _uid
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_project_id_from_deliverable(_deliverable_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT d.project_id FROM public.deliverables d WHERE d.id = _deliverable_id;
$function$;

CREATE OR REPLACE FUNCTION public.get_project_id_from_document(_document_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT doc.project_id FROM public.documents doc WHERE doc.id = _document_id;
$function$;

CREATE OR REPLACE FUNCTION public.get_project_id_from_milestone(_milestone_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT m.project_id FROM public.milestones m WHERE m.id = _milestone_id;
$function$;

CREATE OR REPLACE FUNCTION public.link_briefs_to_user_by_email(_email text, _user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Link any unattached briefs with matching email to this user
  UPDATE public.briefs 
  SET user_id = _user_id
  WHERE user_id IS NULL 
    AND LOWER(contact_email) = LOWER(_email);
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;