-- COMPLETE RLS OVERHAUL - Part 2
-- Continue with remaining tables

-- BOOKS TABLE (continued)
CREATE POLICY "Lawyers can manage books" 
ON public.books FOR ALL 
USING (is_lawyer_or_admin(auth.uid()));

-- PURCHASES TABLE
CREATE POLICY "Users can create own purchases" 
ON public.purchases FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own purchases" 
ON public.purchases FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases" 
ON public.purchases FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage purchases" 
ON public.purchases FOR ALL 
USING (is_admin(auth.uid()));

-- SUBSCRIPTIONS TABLE
CREATE POLICY "Users can create own subscriptions" 
ON public.subscriptions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" 
ON public.subscriptions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" 
ON public.subscriptions FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage subscriptions" 
ON public.subscriptions FOR ALL 
USING (is_admin(auth.uid()));

-- ACTIVITY LOGS TABLE
CREATE POLICY "Users can create own logs" 
ON public.activity_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own logs" 
ON public.activity_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all logs" 
ON public.activity_logs FOR SELECT 
USING (is_admin(auth.uid()));

-- 4. Grant permissions to helper functions
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin TO service_role;
GRANT EXECUTE ON FUNCTION is_lawyer_or_admin TO authenticated;
GRANT EXECUTE ON FUNCTION is_lawyer_or_admin TO service_role;

-- 5. Ensure RLS is enabled on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 6. Verify all policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('profiles', 'case_files', 'books', 'purchases', 'subscriptions', 'activity_logs')
ORDER BY tablename, policyname;
