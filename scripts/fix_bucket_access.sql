-- Fix the storage bucket access issue
-- Make the bucket public so images can be accessed

-- Update the bucket to be public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'protected_files';

-- Also create a thumbnails bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'thumbnails',
    'thumbnails', 
    true, -- public access
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Confirm the changes
SELECT id, name, public 
FROM storage.buckets 
WHERE id IN ('protected_files', 'thumbnails');
