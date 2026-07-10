
-- 1. Harden has_role: revoke public execute and only allow authenticated (needed for RLS)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 2. Tighten user_roles insert: only allow if user has no existing role (prevents duplicate/multiple role stacking)
DROP POLICY IF EXISTS "Users can create own basic role" ON public.user_roles;
CREATE POLICY "Users can create own basic role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role = ANY (ARRAY['lister'::public.app_role, 'seeker'::public.app_role])
  AND NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid())
);
