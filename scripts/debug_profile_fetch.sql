-- Debug the profile fetch issue
-- Run this to test if the new RLS policies work

-- Test 1: Direct query as the user (simulate auth.uid())
SELECT 'Direct user query test' as test, * FROM profiles 
WHERE id = 'a70291f4-92e2-4b0f-90ca-ce371d60dcc3';

-- Test 2: Test the is_admin function
SELECT 'is_admin function test' as test, is_admin('a70291f4-92e2-4b0f-90ca-ce371d60dcc3');

-- Test 3: Check if user's profile exists
SELECT 'Profile exists check' as test, COUNT(*) as count FROM profiles 
WHERE id = 'a70291f4-92e2-4b0f-90ca-ce371d60dcc3';

-- Test 4: Check user's role
SELECT 'User role check' as test, role FROM profiles 
WHERE id = 'a70291f4-92e2-4b0f-90ca-ce371d60dcc3';

-- Test 5: List all policies on profiles table
SELECT 'Current policies' as info, policyname, cmd, qual FROM pg_policies 
WHERE tablename = 'profiles' ORDER BY policyname;
