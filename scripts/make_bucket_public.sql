-- Quick fix: Make bucket public and add proper policies
-- Run this to fix image access

-- 1. Make the bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'protected_files';

-- 2. Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Admins can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read files" ON storage.objects;

-- 3. Create simple public access policy
CREATE POLICY "Public file access" ON storage.objects FOR SELECT
USING (bucket_id = 'protected_files');

-- 4. Allow authenticated users to upload
CREATE POLICY "Authenticated upload" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'protected_files' AND auth.role() = 'authenticated');

-- 5. Confirm bucket is now public
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'protected_files';
