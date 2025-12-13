-- Quick fix for admin dashboard - disable RLS on all tables
ALTER TABLE public.case_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.books DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.court_cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;

-- Confirm changes
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('case_files', 'books', 'court_cases', 'profiles', 'purchases', 'activity_logs', 'subscriptions');
