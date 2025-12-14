-- FIX ALL TABLES FOR ADMIN DASHBOARD
-- Run this in production to fix admin dashboard loading

-- 1. Drop problematic policies from all tables
DROP POLICY IF EXISTS "Admins can view all purchases" ON public.purchases;
DROP POLICY IF EXISTS "Admins can update all purchases" ON public.purchases;
DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchases;

DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can view own activity logs" ON public.activity_logs;

DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;

-- 2. Create clean policies using is_admin helper
-- Purchases policies
CREATE POLICY "Users can view own purchases" 
ON public.purchases FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases" 
ON public.purchases FOR SELECT 
USING (is_admin(auth.uid()));

-- Activity logs policies
CREATE POLICY "Users can view own activity logs" 
ON public.activity_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity logs" 
ON public.activity_logs FOR SELECT 
USING (is_admin(auth.uid()));

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" 
ON public.subscriptions FOR SELECT 
USING (is_admin(auth.uid()));

-- 3. Ensure RLS is enabled on all tables
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. Verify all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('purchases', 'activity_logs', 'subscriptions')
ORDER BY tablename, policyname;
