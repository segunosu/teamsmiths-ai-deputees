-- Fix the handle_new_user function to properly read user_type from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, user_type)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'user_type', 'client')
  );
  RETURN new;
END;
$function$;