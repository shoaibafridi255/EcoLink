
-- Restrict avatars SELECT to owning user folder
DROP POLICY IF EXISTS "Avatars are viewable by authenticated" ON storage.objects;
CREATE POLICY "Users can view own avatar"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Remove self-insert path for user_roles; only handle_new_user trigger (SECURITY DEFINER) or admins can assign roles
DROP POLICY IF EXISTS "Users can create own basic role" ON public.user_roles;
