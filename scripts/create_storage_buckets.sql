-- Create storage buckets for your project
-- Run this in Supabase SQL editor

-- Create main storage bucket for files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'protected_files',
    'protected_files',
    true, -- public access
    52428800, -- 50MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Create thumbnails bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'thumbnails',
    'thumbnails', 
    true, -- public access
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create policies for public access
-- Anyone can view files in protected_files
CREATE POLICY "Public Access" ON storage.objects FOR SELECT
USING (bucket_id = 'protected_files');

-- Anyone can view thumbnails
CREATE POLICY "Public Thumbnails Access" ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

-- Authenticated users can upload files
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('protected_files', 'thumbnails') AND 
  auth.role() = 'authenticated'
);

-- Users can update their own files
CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE
USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own files  
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE
USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Confirm buckets created
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id IN ('protected_files', 'thumbnails');
