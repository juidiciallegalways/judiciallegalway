-- Debug why profile fetch is failing in production
-- Profile exists but fetchProfile is hanging

-- 1. Test direct query (should work with new RLS)
SELECT 'Test direct query' as test, * FROM profiles 
WHERE id = 'a70291f4-92e2-4b0f-90ca-ce371d60dcc3';

-- 2. Test with simulated auth.uid()
-- This mimics what the app does
SET request.jwt.claim.sub = 'a70291f4-92e2-4b0f-90ca-ce371d60dcc3';
SELECT 'Test with auth.uid()' as test, * FROM profiles 
WHERE id = auth.uid();

-- 3. Check if RLS is actually working
SELECT 'RLS status' as test, rowsecurity FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- 4. Test the is_admin function
SELECT 'Test is_admin function' as test, is_admin('a70291f4-92e2-4b0f-90ca-ce371d60dcc3');

-- 5. Check current user role
SELECT 'User role' as test, role FROM profiles 
WHERE id = 'a70291f4-92e2-4b0f-90ca-ce371d60dcc3';

-- 6. List all policies to verify they're correct
SELECT 'Policies' as info, policyname, cmd, qual FROM pg_policies 
WHERE tablename = 'profiles' ORDER BY policyname;
