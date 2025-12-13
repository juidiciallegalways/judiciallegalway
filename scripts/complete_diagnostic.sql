-- COMPLETE PROJECT DIAGNOSTIC
-- Run this to check all potential issues

-- 1. Check if your profile actually exists
SELECT 'PROFILE_EXISTS' as check, COUNT(*) as count 
FROM profiles 
WHERE id = 'a70291f4-92e2-4b0f-90ca-ce371d60dcc3';

-- 2. Check if user exists in auth
SELECT 'AUTH_USER_EXISTS' as check, COUNT(*) as count 
FROM auth.users 
WHERE id = 'a70291f4-92e2-4b0f-90ca-ce371d60dcc3';

-- 3. Check profile by email
SELECT 'PROFILE_BY_EMAIL' as check, id, email, role, created_at 
FROM profiles 
WHERE email = 'juidiciallegalways@gmail.com';

-- 4. Check all RLS policies causing issues
SELECT 'PROBLEMATIC_POLICIES' as check, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles' 
AND qual LIKE '%profiles%';

-- 5. Test direct query without RLS
SELECT 'DIRECT_QUERY_TEST' as check, *
FROM profiles 
WHERE id = 'a70291f4-92e2-4b0f-90ca-ce371d60dcc3';

-- 6. Check table permissions
SELECT 'TABLE_PERMISSIONS' as check, 
       has_table_privilege('authenticated', 'public.profiles', 'SELECT') as can_select,
       has_table_privilege('authenticated', 'public.profiles', 'INSERT') as can_insert,
       has_table_privilege('authenticated', 'public.profiles', 'UPDATE') as can_update;

-- 7. Check if RLS is actually the problem
SELECT 'RLS_STATUS' as check, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';
