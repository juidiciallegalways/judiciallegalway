-- Create separate bucket for public images
-- Keep protected_files private for PDFs, create public_images for thumbnails

-- Create public images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'public_images',
    'public_images',
    true, -- public access for images
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create policies for public_images bucket
-- Anyone can view public images
CREATE POLICY "Public images access" ON storage.objects FOR SELECT
USING (bucket_id = 'public_images');

-- Authenticated users can upload images
CREATE POLICY "Authenticated upload images" ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'public_images' AND 
  auth.role() = 'authenticated'
);

-- Users can update their own images
CREATE POLICY "Users update own images" ON storage.objects FOR UPDATE
USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own images
CREATE POLICY "Users delete own images" ON storage.objects FOR DELETE
USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Confirm both buckets exist with correct settings
SELECT id, name, public 
FROM storage.buckets 
WHERE id IN ('protected_files', 'public_images')
ORDER BY id;
