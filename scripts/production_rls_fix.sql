-- PRODUCTION READY FIX FOR RLS RECURSION
-- This fixes the infinite recursion in RLS policies

-- 1. First, drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;

-- 2. Create a helper function for admin checks (no recursion)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$;

-- 3. Create proper RLS policies without recursion
-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile" 
ON public.profiles FOR DELETE 
USING (auth.uid() = id);

-- Admins can view all profiles (using helper function)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (is_admin(auth.uid()));

-- Admins can update any profile (using helper function)
CREATE POLICY "Admins can update any profile" 
ON public.profiles FOR UPDATE 
USING (is_admin(auth.uid()));

-- Admins can delete any profile (using helper function)
CREATE POLICY "Admins can delete any profile" 
ON public.profiles FOR DELETE 
USING (is_admin(auth.uid()));

-- 4. Fix similar issues in other tables
-- Drop existing purchase policies
DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchases;
DROP POLICY IF EXISTS "Admins can view all purchases" ON public.purchases;
DROP POLICY IF EXISTS "Admins can update all purchases" ON public.purchases;

-- Create proper purchase policies
CREATE POLICY "Users can view own purchases" 
ON public.purchases FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases" 
ON public.purchases FOR SELECT 
USING (is_admin(auth.uid()));

-- Fix activity_logs policies
DROP POLICY IF EXISTS "Users can view own activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.activity_logs;

CREATE POLICY "Users can view own activity logs" 
ON public.activity_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity logs" 
ON public.activity_logs FOR SELECT 
USING (is_admin(auth.uid()));

-- Fix subscriptions policies
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view own subscriptions" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" 
ON public.subscriptions FOR SELECT 
USING (is_admin(auth.uid()));

-- 5. Grant permissions to the helper function
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin TO service_role;

-- 6. Verify RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 7. Test the fix
SELECT 
    is_admin('a70291f4-92e2-4b0f-90ca-ce371d60dcc3') as is_admin_check;
