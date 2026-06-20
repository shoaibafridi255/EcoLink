
-- Ensure only shoaibafridi150@gmail.com is admin
DELETE FROM public.user_roles WHERE role = 'admin';

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users WHERE email = 'shoaibafridi150@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
