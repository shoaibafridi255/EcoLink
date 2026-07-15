
CREATE TABLE public.material_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id uuid NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX material_views_user_idx ON public.material_views(user_id, viewed_at DESC);
GRANT SELECT, INSERT ON public.material_views TO authenticated;
GRANT ALL ON public.material_views TO service_role;
ALTER TABLE public.material_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert their own views" ON public.material_views FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read their own views" ON public.material_views FOR SELECT TO authenticated USING (auth.uid() = user_id);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
