-- Test query to check if user has any purchases
-- Replace 'your-user-id-here' with actual user ID from auth.users table

SELECT 
    p.*,
    u.email as user_email
FROM purchases p
JOIN auth.users u ON p.user_id = u.id 
WHERE u.email = 'juidiciallegalways@gmail.com';

-- Check saved cases for this user
SELECT 
    sc.*,
    u.email as user_email
FROM saved_cases sc
JOIN auth.users u ON sc.user_id = u.id 
WHERE u.email = 'juidiciallegalways@gmail.com';

-- Check progress tracking
SELECT 
    cfp.*,
    u.email as user_email
FROM case_file_progress cfp
JOIN auth.users u ON cfp.user_id = u.id
WHERE u.email = 'juidiciallegalways@gmail.com';

-- Check book progress
SELECT 
    bp.*,
    u.email as user_email
FROM book_progress bp
JOIN auth.users u ON bp.user_id = u.id
WHERE u.email = 'juidiciallegalways@gmail.com';
