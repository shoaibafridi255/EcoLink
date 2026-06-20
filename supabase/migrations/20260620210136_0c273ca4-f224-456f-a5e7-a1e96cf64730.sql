
-- Make shoaibafridi150@gmail.com the sole admin
DELETE FROM public.user_roles WHERE role = 'admin'::public.app_role;
INSERT INTO public.user_roles (user_id, role)
VALUES ('00198c54-c5be-41c8-872f-28644fa23742', 'admin'::public.app_role)
ON CONFLICT (user_id, role) DO NOTHING;

-- Remove self-assignment of admin role
DROP POLICY IF EXISTS "Users can create first admin role" ON public.user_roles;
DROP FUNCTION IF EXISTS public.can_create_first_admin(uuid);

-- Ensure new signups never get admin auto-assigned
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  requested_role text;
  user_role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name, company, location)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company', ''),
    COALESCE(NEW.raw_user_meta_data->>'location', '')
  );

  requested_role := lower(COALESCE(NEW.raw_user_meta_data->>'role', 'seeker'));
  IF requested_role = 'lister' THEN
    user_role := 'lister'::public.app_role;
  ELSE
    user_role := 'seeker'::public.app_role;
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, user_role);
  RETURN NEW;
END;
$function$;
