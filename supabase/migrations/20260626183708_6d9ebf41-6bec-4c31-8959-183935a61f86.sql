CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  requested_role text;
  user_role public.app_role;
  avatar text;
BEGIN
  avatar := COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '');

  INSERT INTO public.profiles (id, full_name, company, location, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company', ''),
    COALESCE(NEW.raw_user_meta_data->>'location', ''),
    avatar
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    company = EXCLUDED.company,
    location = EXCLUDED.location,
    avatar_url = EXCLUDED.avatar_url;

  requested_role := lower(COALESCE(NEW.raw_user_meta_data->>'role', 'seeker'));
  IF requested_role = 'lister' THEN
    user_role := 'lister'::public.app_role;
  ELSE
    user_role := 'seeker'::public.app_role;
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, user_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;