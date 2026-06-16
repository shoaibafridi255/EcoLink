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

  IF requested_role = 'admin' AND NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'::public.app_role
  ) THEN
    user_role := 'admin'::public.app_role;
  ELSIF requested_role = 'lister' THEN
    user_role := 'lister'::public.app_role;
  ELSE
    user_role := 'seeker'::public.app_role;
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, user_role);

  RETURN NEW;
END;
$function$;

DROP POLICY IF EXISTS "Users can insert own role on signup" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can assign roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can remove roles" ON public.user_roles;

CREATE POLICY "Admins can assign roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can remove roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));