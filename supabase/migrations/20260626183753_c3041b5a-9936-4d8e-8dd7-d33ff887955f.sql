UPDATE public.profiles
SET avatar_url = COALESCE(
  (SELECT raw_user_meta_data->>'avatar_url' FROM auth.users WHERE auth.users.id = profiles.id),
  (SELECT raw_user_meta_data->>'picture' FROM auth.users WHERE auth.users.id = profiles.id),
  profiles.avatar_url
)
WHERE avatar_url IS NULL OR avatar_url = '';