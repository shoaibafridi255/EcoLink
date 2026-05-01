
-- Create materials table
CREATE TABLE public.materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  quantity TEXT,
  price_type TEXT NOT NULL DEFAULT 'free' CHECK (price_type IN ('free', 'negotiable', 'fixed')),
  price NUMERIC,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'sold')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Anyone can view active materials
CREATE POLICY "Anyone can view active materials"
ON public.materials FOR SELECT
USING (status = 'active');

-- Owners can view all their own materials
CREATE POLICY "Owners can view own materials"
ON public.materials FOR SELECT
USING (auth.uid() = user_id);

-- Authenticated users can insert their own materials
CREATE POLICY "Users can insert own materials"
ON public.materials FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Owners can update their own materials
CREATE POLICY "Users can update own materials"
ON public.materials FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Owners can delete their own materials
CREATE POLICY "Users can delete own materials"
ON public.materials FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE TRIGGER update_materials_updated_at
BEFORE UPDATE ON public.materials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
