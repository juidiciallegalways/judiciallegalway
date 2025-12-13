-- ============================================================================
-- JUDICIALLY LEGAL WAYS - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- This is the single source of truth for the database schema
-- Run this on a fresh Supabase project
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. CUSTOM TYPES & ENUMS
-- ============================================================================

-- User roles
CREATE TYPE user_role AS ENUM ('student', 'lawyer', 'admin');

-- Court case status
CREATE TYPE case_status AS ENUM ('pending', 'hearing_today', 'disposed', 'adjourned');

-- Payment status
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Item types for purchases
CREATE TYPE item_type AS ENUM ('case_file', 'book', 'subscription');

-- Subscription plans
CREATE TYPE subscription_plan AS ENUM ('monthly', 'quarterly', 'yearly');

-- Subscription status
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired');

-- ============================================================================
-- 3. CORE TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1 PROFILES (extends Supabase auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'student' NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth';
COMMENT ON COLUMN public.profiles.role IS 'User role: student (can buy/read), lawyer (can buy/read/add court cases), admin (full access)';

-- ----------------------------------------------------------------------------
-- 3.2 CASE FILES (Legal case studies and judgments)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.case_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  case_number TEXT,
  court_name TEXT,
  category TEXT NOT NULL, -- criminal, civil, constitutional, family, property, corporate, tax, labor, ipr, environmental
  subcategory TEXT,
  year INTEGER,
  thumbnail_url TEXT,
  file_url TEXT NOT NULL, -- Path in storage bucket
  file_type TEXT DEFAULT 'pdf',
  file_size INTEGER, -- in bytes
  is_premium BOOLEAN DEFAULT false,
  price DECIMAL(10,2) DEFAULT 0 NOT NULL,
  is_published BOOLEAN DEFAULT true,
  total_pages INTEGER DEFAULT 0,
  tags TEXT[], -- e.g., ['landmark', 'supreme-court', 'constitutional-law']
  
  -- Additional legal metadata
  judge_name TEXT,
  petitioner TEXT,
  respondent TEXT,
  advocate_names TEXT[],
  case_summary TEXT,
  key_points TEXT[],
  judgment_date DATE,
  bench TEXT,
  state TEXT,
  
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.case_files IS 'Legal case files, judgments, and case studies for purchase/reading';
COMMENT ON COLUMN public.case_files.file_url IS 'Storage path in protected_files bucket';
COMMENT ON COLUMN public.case_files.price IS 'Price in INR. Set to 0 for free content';

-- ----------------------------------------------------------------------------
-- 3.3 BOOKS (Physical and digital books)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  preview_url TEXT,
  file_url TEXT, -- Path in storage bucket for digital books
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category TEXT, -- law_notes, criminal_law, civil_law, constitutional_law, evidence_law, bundle
  isbn TEXT,
  pages INTEGER,
  publisher TEXT,
  is_bundle BOOLEAN DEFAULT false,
  bundle_items UUID[], -- Array of book IDs if this is a bundle
  stock INTEGER DEFAULT 100,
  is_published BOOLEAN DEFAULT true,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.books IS 'Books available in the store (physical and digital)';
COMMENT ON COLUMN public.books.file_url IS 'Storage path for digital book PDF in protected_files bucket';
COMMENT ON COLUMN public.books.is_bundle IS 'True if this is a bundle of multiple books';

-- ----------------------------------------------------------------------------
-- 3.4 COURT CASES (Court tracker - real-time case status)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.court_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT NOT NULL UNIQUE,
  case_title TEXT NOT NULL,
  party_names TEXT[], -- [petitioner, respondent, ...]
  advocate_names TEXT[],
  court_name TEXT NOT NULL,
  court_type TEXT, -- Supreme Court, High Court, District Court, etc.
  state TEXT NOT NULL,
  judge_name TEXT,
  status case_status DEFAULT 'pending' NOT NULL,
  filing_date DATE,
  next_hearing_date DATE,
  disposal_date DATE,
  case_summary TEXT,
  
  -- Tracking metadata
  added_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.court_cases IS 'Court case tracking system - real-time status updates';
COMMENT ON COLUMN public.court_cases.added_by IS 'Lawyer or admin who added this case';
COMMENT ON COLUMN public.court_cases.status IS 'Current status: pending, hearing_today, disposed, adjourned';

-- ----------------------------------------------------------------------------
-- 3.5 PURCHASES (Transaction records)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_type item_type NOT NULL,
  item_id UUID NOT NULL, -- References case_files.id, books.id, or subscriptions.id
  amount DECIMAL(10,2) NOT NULL,
  payment_id TEXT, -- Razorpay/Stripe payment ID
  payment_status payment_status DEFAULT 'pending' NOT NULL,
  payment_method TEXT, -- 'razorpay', 'stripe', 'cod', etc.
  transaction_details JSONB, -- Store full payment gateway response
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.purchases IS 'All purchase transactions (case files, books, subscriptions)';
COMMENT ON COLUMN public.purchases.item_id IS 'UUID of the purchased item (case_file, book, or subscription)';

-- ----------------------------------------------------------------------------
-- 3.6 SUBSCRIPTIONS (Premium subscriptions)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_type subscription_plan NOT NULL,
  status subscription_status DEFAULT 'active' NOT NULL,
  start_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_id TEXT,
  auto_renew BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.subscriptions IS 'User subscription plans for premium access';

-- ----------------------------------------------------------------------------
-- 3.7 SAVED CASES (User bookmarked court cases)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES public.court_cases(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, case_id)
);

COMMENT ON TABLE public.saved_cases IS 'Court cases bookmarked/saved by users';

-- ----------------------------------------------------------------------------
-- 3.8 CASE FILE PROGRESS (Reading progress tracking)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.case_file_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  case_file_id UUID NOT NULL REFERENCES public.case_files(id) ON DELETE CASCADE,
  current_page INTEGER DEFAULT 1,
  total_pages INTEGER DEFAULT 0,
  bookmarks JSONB DEFAULT '[]', -- [{page: 5, note: "Important"}, ...]
  highlights JSONB DEFAULT '[]', -- [{page: 3, text: "...", color: "#yellow"}, ...]
  notes JSONB DEFAULT '[]', -- [{page: 2, note: "My thoughts"}, ...]
  last_accessed TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, case_file_id)
);

COMMENT ON TABLE public.case_file_progress IS 'User reading progress for case files';

-- ----------------------------------------------------------------------------
-- 3.9 BOOK PROGRESS (Reading progress for books)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.book_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  current_page INTEGER DEFAULT 1,
  total_pages INTEGER DEFAULT 0,
  bookmarks JSONB DEFAULT '[]',
  highlights JSONB DEFAULT '[]',
  notes JSONB DEFAULT '[]',
  last_accessed TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, book_id)
);

COMMENT ON TABLE public.book_progress IS 'User reading progress for books';

-- ----------------------------------------------------------------------------
-- 3.10 ACTIVITY LOGS (Audit trail)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'login', 'purchase', 'view_case_file', 'add_court_case', etc.
  details JSONB, -- Additional context
  ip_address TEXT,
  device_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.activity_logs IS 'Audit log of all user actions';

-- ----------------------------------------------------------------------------
-- 3.11 CART (Shopping cart - optional, can use localStorage)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_type item_type NOT NULL,
  item_id UUID NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, item_type, item_id)
);

COMMENT ON TABLE public.cart_items IS 'Shopping cart items (optional - frontend uses localStorage)';

-- ============================================================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Case Files
CREATE INDEX IF NOT EXISTS idx_case_files_category ON public.case_files(category);
CREATE INDEX IF NOT EXISTS idx_case_files_year ON public.case_files(year);
CREATE INDEX IF NOT EXISTS idx_case_files_tags ON public.case_files USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_case_files_case_number ON public.case_files(case_number);
CREATE INDEX IF NOT EXISTS idx_case_files_published ON public.case_files(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_case_files_created_at ON public.case_files(created_at DESC);

-- Books
CREATE INDEX IF NOT EXISTS idx_books_category ON public.books(category);
CREATE INDEX IF NOT EXISTS idx_books_author ON public.books(author);
CREATE INDEX IF NOT EXISTS idx_books_published ON public.books(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_books_created_at ON public.books(created_at DESC);

-- Court Cases
CREATE INDEX IF NOT EXISTS idx_court_cases_status ON public.court_cases(status);
CREATE INDEX IF NOT EXISTS idx_court_cases_state ON public.court_cases(state);
CREATE INDEX IF NOT EXISTS idx_court_cases_case_number ON public.court_cases(case_number);
CREATE INDEX IF NOT EXISTS idx_court_cases_next_hearing ON public.court_cases(next_hearing_date);
CREATE INDEX IF NOT EXISTS idx_court_cases_updated_at ON public.court_cases(updated_at DESC);

-- Purchases
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_item ON public.purchases(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON public.purchases(created_at DESC);

-- Activity Logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- Progress tracking
CREATE INDEX IF NOT EXISTS idx_case_file_progress_user_id ON public.case_file_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_book_progress_user_id ON public.book_progress(user_id);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.court_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_file_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 5.1 PROFILES POLICIES
-- ----------------------------------------------------------------------------

-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile" 
ON public.profiles FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ----------------------------------------------------------------------------
-- 5.2 CASE FILES POLICIES
-- ----------------------------------------------------------------------------

-- Anyone can view published case files
CREATE POLICY "Anyone can view published case files" 
ON public.case_files FOR SELECT 
USING (is_published = true);

-- Admins can do everything with case files
CREATE POLICY "Admins can manage case files" 
ON public.case_files FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ----------------------------------------------------------------------------
-- 5.3 BOOKS POLICIES
-- ----------------------------------------------------------------------------

-- Anyone can view published books
CREATE POLICY "Anyone can view published books" 
ON public.books FOR SELECT 
USING (is_published = true);

-- Admins can do everything with books
CREATE POLICY "Admins can manage books" 
ON public.books FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ----------------------------------------------------------------------------
-- 5.4 COURT CASES POLICIES
-- ----------------------------------------------------------------------------

-- Anyone can view court cases
CREATE POLICY "Anyone can view court cases" 
ON public.court_cases FOR SELECT 
USING (true);

-- Admins can do everything with court cases
CREATE POLICY "Admins can manage court cases" 
ON public.court_cases FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Lawyers can add court cases
CREATE POLICY "Lawyers can add court cases" 
ON public.court_cases FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('lawyer', 'admin')
  )
);

-- Lawyers can update their own court cases
CREATE POLICY "Lawyers can update own court cases" 
ON public.court_cases FOR UPDATE 
USING (
  added_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('lawyer', 'admin')
  )
);

-- ----------------------------------------------------------------------------
-- 5.5 PURCHASES POLICIES
-- ----------------------------------------------------------------------------

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases" 
ON public.purchases FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own purchases
CREATE POLICY "Users can create own purchases" 
ON public.purchases FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can view all purchases
CREATE POLICY "Admins can view all purchases" 
ON public.purchases FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ----------------------------------------------------------------------------
-- 5.6 SUBSCRIPTIONS POLICIES
-- ----------------------------------------------------------------------------

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own subscriptions
CREATE POLICY "Users can create own subscriptions" 
ON public.subscriptions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions
CREATE POLICY "Users can update own subscriptions" 
ON public.subscriptions FOR UPDATE 
USING (auth.uid() = user_id);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions" 
ON public.subscriptions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ----------------------------------------------------------------------------
-- 5.7 SAVED CASES POLICIES
-- ----------------------------------------------------------------------------

-- Users can manage their own saved cases
CREATE POLICY "Users can manage own saved cases" 
ON public.saved_cases FOR ALL 
USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 5.8 PROGRESS TRACKING POLICIES
-- ----------------------------------------------------------------------------

-- Users can manage their own case file progress
CREATE POLICY "Users can manage own case file progress" 
ON public.case_file_progress FOR ALL 
USING (auth.uid() = user_id);

-- Users can manage their own book progress
CREATE POLICY "Users can manage own book progress" 
ON public.book_progress FOR ALL 
USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 5.9 ACTIVITY LOGS POLICIES
-- ----------------------------------------------------------------------------

-- Users can view their own logs
CREATE POLICY "Users can view own logs" 
ON public.activity_logs FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own logs
CREATE POLICY "Users can create own logs" 
ON public.activity_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can view all logs
CREATE POLICY "Admins can view all logs" 
ON public.activity_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ----------------------------------------------------------------------------
-- 5.10 CART POLICIES
-- ----------------------------------------------------------------------------

-- Users can manage their own cart
CREATE POLICY "Users can manage own cart" 
ON public.cart_items FOR ALL 
USING (auth.uid() = user_id);

-- ============================================================================
-- 6. STORAGE BUCKET POLICIES
-- ============================================================================

-- Create storage bucket for protected files (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('protected_files', 'protected_files', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users (admins) to upload
CREATE POLICY "Admins can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'protected_files' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow authenticated users (admins) to update files
CREATE POLICY "Admins can update files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'protected_files' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow authenticated users (admins) to delete files
CREATE POLICY "Admins can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'protected_files' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow authenticated users to read files (for signed URLs)
CREATE POLICY "Authenticated users can read files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'protected_files');

-- ============================================================================
-- 7. FUNCTIONS & TRIGGERS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 7.1 Function to update updated_at timestamp
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_files_updated_at BEFORE UPDATE ON public.case_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_court_cases_updated_at BEFORE UPDATE ON public.court_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_file_progress_updated_at BEFORE UPDATE ON public.case_file_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_book_progress_updated_at BEFORE UPDATE ON public.book_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 7.2 Function to create profile on user signup
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 7.3 Function to check if user has purchased an item
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_purchased(
  p_user_id UUID,
  p_item_type item_type,
  p_item_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.purchases
    WHERE user_id = p_user_id
      AND item_type = p_item_type
      AND item_id = p_item_id
      AND payment_status = 'completed'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.has_purchased IS 'Check if a user has purchased a specific item';

-- ----------------------------------------------------------------------------
-- 7.4 Function to check if user has active subscription
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = p_user_id
      AND status = 'active'
      AND end_date > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.has_active_subscription IS 'Check if a user has an active subscription';

-- ----------------------------------------------------------------------------
-- 7.5 Function to log activity
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_activity(
  p_user_id UUID,
  p_action TEXT,
  p_details JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_device_info TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.activity_logs (user_id, action, details, ip_address, device_info)
  VALUES (p_user_id, p_action, p_details, p_ip_address, p_device_info)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.log_activity IS 'Log user activity for audit trail';

-- ============================================================================
-- 8. INITIAL DATA / SEED DATA
-- ============================================================================

-- Create a default admin user (you'll need to update this with your actual admin email)
-- First, sign up through the UI, then run this to make that user an admin:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin@example.com';

-- Sample categories for reference
COMMENT ON COLUMN public.case_files.category IS 'Categories: criminal, civil, constitutional, family, property, corporate, tax, labor, ipr, environmental';
COMMENT ON COLUMN public.books.category IS 'Categories: law_notes, criminal_law, civil_law, constitutional_law, evidence_law, bundle';

-- ============================================================================
-- 9. GRANTS & PERMISSIONS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant access to sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================

-- To verify the schema was created successfully, run:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
