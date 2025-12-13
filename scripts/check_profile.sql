-- Check if your profile exists in the database
SELECT 
    p.*,
    u.email as user_email,
    u.created_at as user_created
FROM profiles p
JOIN auth.users u ON p.id = u.id 
WHERE u.email = 'juidiciallegalways@gmail.com';

-- If no profile found, create one manually:
INSERT INTO profiles (
    id, 
    email, 
    role, 
    created_at, 
    updated_at
) 
SELECT 
    u.id,
    u.email,
    'student',
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'juidiciallegalways@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = u.id
);
