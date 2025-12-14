-- FINAL CLEAN RLS - Handle all existing policies
-- Run this to completely reset RLS with perfect policies

-- 1. Drop EVERY policy from ALL tables (comprehensive)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      policy_record.policyname, 
                      policy_record.schemaname, 
                      policy_record.tablename);
    END LOOP;
END $$;

-- 2. Create helper functions
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

CREATE OR REPLACE FUNCTION is_lawyer_or_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id AND role IN ('lawyer', 'admin')
    );
END;
$$;

-- 3. Create clean policies for all tables

-- PROFILES
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins update profiles" ON public.profiles FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins delete profiles" ON public.profiles FOR DELETE USING (is_admin(auth.uid()));

-- CASE FILES
CREATE POLICY "Public view published cases" ON public.case_files FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage cases" ON public.case_files FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Lawyers manage cases" ON public.case_files FOR ALL USING (is_lawyer_or_admin(auth.uid()));

-- BOOKS
CREATE POLICY "Public view published books" ON public.books FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage books" ON public.books FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Lawyers manage books" ON public.books FOR ALL USING (is_lawyer_or_admin(auth.uid()));

-- PURCHASES
CREATE POLICY "Users create purchases" ON public.purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view purchases" ON public.purchases FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins manage purchases" ON public.purchases FOR ALL USING (is_admin(auth.uid()));

-- SUBSCRIPTIONS
CREATE POLICY "Users create subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update subscriptions" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins view subscriptions" ON public.subscriptions FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins manage subscriptions" ON public.subscriptions FOR ALL USING (is_admin(auth.uid()));

-- ACTIVITY LOGS
CREATE POLICY "Users create logs" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own logs" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all logs" ON public.activity_logs FOR SELECT USING (is_admin(auth.uid()));

-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin TO service_role;
GRANT EXECUTE ON FUNCTION is_lawyer_or_admin TO authenticated;
GRANT EXECUTE ON FUNCTION is_lawyer_or_admin TO service_role;

-- 5. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 6. Show results
SELECT tablename, COUNT(*) as policy_count 
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename 
ORDER BY tablename;
