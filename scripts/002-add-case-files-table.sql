-- by harpreet-- Add Case Files Table
-- Case Files table (replacing study materials concept with case files) --by harpreet
CREATE TABLE IF NOT EXISTS public.case_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  case_number TEXT,
  court_name TEXT,
  category TEXT NOT NULL, -- e.g., 'criminal', 'civil', 'constitutional', 'family', 'property'
  subcategory TEXT,
  year INTEGER,
  thumbnail_url TEXT,
  file_url TEXT NOT NULL, -- PDF or document URL
  file_type TEXT DEFAULT 'pdf',
  file_size INTEGER, -- in bytes
  is_premium BOOLEAN DEFAULT false,
  price DECIMAL(10,2) DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  total_pages INTEGER DEFAULT 0,
  tags TEXT[], -- e.g., ['landmark', 'supreme-court', 'constitutional-law']
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Progress for Case Files
CREATE TABLE IF NOT EXISTS public.case_file_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  case_file_id UUID NOT NULL REFERENCES public.case_files(id) ON DELETE CASCADE,
  current_page INTEGER DEFAULT 1,
  total_pages INTEGER DEFAULT 0,
  bookmarks JSONB DEFAULT '[]',
  highlights JSONB DEFAULT '[]',
  notes JSONB DEFAULT '[]',
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, case_file_id)
);

-- Purchases for Case Files
ALTER TABLE public.purchases DROP CONSTRAINT IF EXISTS purchases_item_type_check;
ALTER TABLE public.purchases ADD CONSTRAINT purchases_item_type_check 
  CHECK (item_type IN ('study_material', 'book', 'subscription', 'case_file'));

-- Enable Row Level Security
ALTER TABLE public.case_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_file_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for case_files (public read, admin write)
CREATE POLICY "Anyone can view published case files" ON public.case_files FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage case files" ON public.case_files FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for case_file_progress
CREATE POLICY "Users can manage own case file progress" ON public.case_file_progress FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_case_files_category ON public.case_files(category);
CREATE INDEX IF NOT EXISTS idx_case_files_year ON public.case_files(year);
CREATE INDEX IF NOT EXISTS idx_case_files_tags ON public.case_files USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_case_files_case_number ON public.case_files(case_number);
CREATE INDEX IF NOT EXISTS idx_case_file_progress_user_id ON public.case_file_progress(user_id);

-- Add some sample categories as a comment for reference
COMMENT ON COLUMN public.case_files.category IS 'Categories: criminal, civil, constitutional, family, property, corporate, tax, labor, ipr, environmental';
