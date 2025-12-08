-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study Materials table
CREATE TABLE IF NOT EXISTS public.study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  thumbnail_url TEXT,
  content_url TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  total_pages INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Court Cases table
CREATE TABLE IF NOT EXISTS public.court_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT NOT NULL UNIQUE,
  case_title TEXT NOT NULL,
  party_names TEXT[],
  advocate_names TEXT[],
  court_name TEXT NOT NULL,
  court_type TEXT,
  state TEXT NOT NULL,
  judge_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'hearing_today', 'disposed', 'adjourned')),
  filing_date DATE,
  next_hearing_date DATE,
  disposal_date DATE,
  case_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Books table
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  preview_url TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category TEXT,
  isbn TEXT,
  pages INTEGER,
  publisher TEXT,
  is_bundle BOOLEAN DEFAULT false,
  bundle_items UUID[],
  stock INTEGER DEFAULT 100,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchases table
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('study_material', 'book', 'subscription')),
  item_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_id TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Cases (user bookmarked cases)
CREATE TABLE IF NOT EXISTS public.saved_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES public.court_cases(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, case_id)
);

-- User Progress (for study materials)
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.study_materials(id) ON DELETE CASCADE,
  current_page INTEGER DEFAULT 1,
  total_pages INTEGER DEFAULT 0,
  bookmarks JSONB DEFAULT '[]',
  highlights JSONB DEFAULT '[]',
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, material_id)
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  device_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'quarterly', 'yearly')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.court_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Enable insert for authenticated users" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for study_materials (public read, admin write)
CREATE POLICY "Anyone can view published materials" ON public.study_materials FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage materials" ON public.study_materials FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for court_cases (public read)
CREATE POLICY "Anyone can view cases" ON public.court_cases FOR SELECT USING (true);
CREATE POLICY "Admins can manage cases" ON public.court_cases FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for books (public read)
CREATE POLICY "Anyone can view published books" ON public.books FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage books" ON public.books FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for purchases
CREATE POLICY "Users can view own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own purchases" ON public.purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for saved_cases
CREATE POLICY "Users can manage own saved cases" ON public.saved_cases FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_progress
CREATE POLICY "Users can manage own progress" ON public.user_progress FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for activity_logs
CREATE POLICY "Users can view own logs" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own logs" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_study_materials_category ON public.study_materials(category);
CREATE INDEX IF NOT EXISTS idx_court_cases_status ON public.court_cases(status);
CREATE INDEX IF NOT EXISTS idx_court_cases_state ON public.court_cases(state);
CREATE INDEX IF NOT EXISTS idx_court_cases_case_number ON public.court_cases(case_number);
CREATE INDEX IF NOT EXISTS idx_books_category ON public.books(category);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);


-- created by piyush -- 
--Allow authenticated uploads (Admin/You)
create policy "Allow authenticated uploads"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'protected_files' );
-- Allow viewing only via Signed URLs (handled by server logic)
-- No "select" policy needed for public because it's private!

-- Ensure case_files table exists with correct schema
create table if not exists public.case_files (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  case_number text,
  court_name text,
  file_path text not null, -- Stores the private bucket path
  thumbnail_url text,
  category text,
  subcategory text,
  year integer,
  price numeric default 0,
  is_premium boolean default false,
  is_published boolean default true,
  total_pages integer default 0,
  tags text[]
);

-- Enable RLS
alter table public.case_files enable row level security;

-- Policy: Everyone can READ published cases
create policy "Public can view published cases"
on public.case_files for select
using ( is_published = true );

-- Policy: Only Admins can INSERT/UPDATE (You can refine this later with specific admin roles)
-- For now, we allow authenticated users to insert for testing the Admin Panel
create policy "Authenticated users can upload"
on public.case_files for insert
to authenticated
with check ( true );
