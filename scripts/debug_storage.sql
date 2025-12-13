-- Check what's actually in your storage buckets
-- Run this to debug the file path issue

-- List all files in protected_files bucket
SELECT 
    id,
    name,
    bucket_id,
    created_at,
    updated_at,
    metadata
FROM storage.objects 
WHERE bucket_id = 'protected_files'
ORDER BY created_at DESC;

-- Check specifically for the file that's causing the error
SELECT 
    id,
    name,
    bucket_id,
    created_at
FROM storage.objects 
WHERE bucket_id = 'protected_files'
AND name LIKE '%1765653459379-WhatsApp_Image_2025-11-13_at_04.17.31.jpeg%';

-- Check if there are any files in thumbnails folder
SELECT 
    id,
    name,
    bucket_id,
    created_at
FROM storage.objects 
WHERE bucket_id = 'protected_files'
AND name LIKE 'thumbnails/%';

-- List all buckets to confirm they exist
SELECT id, name, public 
FROM storage.buckets;
