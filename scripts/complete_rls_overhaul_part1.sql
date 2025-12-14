-- COMPLETE RLS OVERHAUL - Clean, Non-Recursive Policies
-- This replaces ALL RLS policies with perfect, non-recursive versions

-- 1. First, drop ALL existing policies from ALL tables
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;

DROP POLICY IF EXISTS "Anyone can view published case files" ON public.case_files;
DROP POLICY IF EXISTS "Admins can manage case files" ON public.case_files;
DROP POLICY IF EXISTS "Lawyers can manage case files" ON public.case_files;

DROP POLICY IF EXISTS "Anyone can view published books" ON public.books;
DROP POLICY IF EXISTS "Admins can manage books" ON public.books;
DROP POLICY IF EXISTS "Lawyers can manage books" ON public.books;

DROP POLICY IF EXISTS "Users can create own purchases" ON public.purchases;
DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchases;
DROP POLICY IF EXISTS "Admins can view all purchases" ON public.purchases;
DROP POLICY IF EXISTS "Admins can manage purchases" ON public.purchases;

DROP POLICY IF EXISTS "Users can create own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscriptions;

DROP POLICY IF EXISTS "Users can create own logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can view own logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Admins can view all logs" ON public.activity_logs;

-- 2. Create helper functions (SECURITY DEFINER bypasses RLS)
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

-- 3. Create PERFECT non-recursive policies

-- PROFILES TABLE
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update any profile" 
ON public.profiles FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete any profile" 
ON public.profiles FOR DELETE 
USING (is_admin(auth.uid()));

-- CASE FILES TABLE
CREATE POLICY "Anyone can view published case files" 
ON public.case_files FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can manage case files" 
ON public.case_files FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Lawyers can manage case files" 
ON public.case_files FOR ALL 
USING (is_lawyer_or_admin(auth.uid()));

-- BOOKS TABLE
CREATE POLICY "Anyone can view published books" 
ON public.books FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can manage books" 
ON public.books FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Lawyers can manage books" 
ON public.books FOR ALL 
USING (is_lawyer_or_admin(auth.uid()));
