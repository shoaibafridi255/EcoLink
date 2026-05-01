
-- Create public storage bucket for material images
INSERT INTO storage.buckets (id, name, public) VALUES ('material-images', 'material-images', true);

-- Anyone can view material images
CREATE POLICY "Anyone can view material images"
ON storage.objects FOR SELECT
USING (bucket_id = 'material-images');

-- Authenticated users can upload to their own folder
CREATE POLICY "Users can upload material images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'material-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can update their own images
CREATE POLICY "Users can update own material images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'material-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own images
CREATE POLICY "Users can delete own material images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'material-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add images array column to materials
ALTER TABLE public.materials ADD COLUMN images TEXT[] DEFAULT '{}';
