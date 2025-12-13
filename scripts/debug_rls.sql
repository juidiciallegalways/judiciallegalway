-- Quick test to check if RLS policies are still causing recursion
-- Run this to see what's happening

-- Check current policies on profiles table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Check if the is_admin function exists
SELECT 
    proname,
    prosrc
FROM pg_proc 
WHERE proname = 'is_admin';

-- Test direct query (should work if RLS is fixed)
SELECT * FROM profiles WHERE id = 'a70291f4-92e2-4b0f-90ca-ce371d60dcc3';

-- Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';
