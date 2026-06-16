CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.register_profile(_user_id uuid, _full_name text, _company text DEFAULT '', _location text DEFAULT '', _role text DEFAULT 'seeker')
RETURNS public.app_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  requested_role text;
  assigned_role public.app_role;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> _user_id THEN
    RAISE EXCEPTION 'You can only register your own account';
  END IF;

  requested_role := lower(COALESCE(_role, 'seeker'));

  IF requested_role = 'admin' AND NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'::public.app_role
  ) THEN
    assigned_role := 'admin'::public.app_role;
  ELSIF requested_role = 'lister' THEN
    assigned_role := 'lister'::public.app_role;
  ELSE
    assigned_role := 'seeker'::public.app_role;
  END IF;

  INSERT INTO public.profiles (id, full_name, company, location)
  VALUES (_user_id, COALESCE(_full_name, ''), COALESCE(_company, ''), COALESCE(_location, ''))
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    company = EXCLUDED.company,
    location = EXCLUDED.location,
    updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, assigned_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN assigned_role;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.register_profile(uuid, text, text, text, text) TO authenticated;