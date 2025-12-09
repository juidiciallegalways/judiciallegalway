-- Fix Schema Consistency and RLS Policies
-- This script standardizes file_path usage and fixes RLS policies

-- 1. Standardize case_files to use file_path (matching books and storage)
-- First, add file_path column if it doesn't exist
ALTER TABLE public.case_files 
  ADD COLUMN IF NOT EXISTS file_path TEXT;

-- Update existing records if file_url exists (copy file_url to file_path)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'case_files' 
    AND column_name = 'file_url'
  ) THEN
    UPDATE public.case_files 
    SET file_path = file_url 
    WHERE file_url IS NOT NULL AND (file_path IS NULL OR file_path = '');
    
    -- Now drop the file_url column
    ALTER TABLE public.case_files DROP COLUMN file_url;
  END IF;
END $$;

-- Make file_path NOT NULL if it's not already
ALTER TABLE public.case_files 
  ALTER COLUMN file_path SET NOT NULL,
  ALTER COLUMN file_path SET DEFAULT '';

-- 2. Fix RLS Policies - Admin Only for Writes
-- Drop ALL existing policies for case_files
DROP POLICY IF EXISTS "Public View" ON public.case_files;
DROP POLICY IF EXISTS "Admin Upload" ON public.case_files;
DROP POLICY IF EXISTS "Admin Update" ON public.case_files;
DROP POLICY IF EXISTS "Admin Delete" ON public.case_files;
DROP POLICY IF EXISTS "Public can view published cases" ON public.case_files;
DROP POLICY IF EXISTS "Authenticated users can upload" ON public.case_files;
DROP POLICY IF EXISTS "Admins can manage case files" ON public.case_files;
DROP POLICY IF EXISTS "Anyone can view published case files" ON public.case_files;

-- Public can view published case files
CREATE POLICY "Public can view published case files" ON public.case_files
  FOR SELECT USING (is_published = true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage case files" ON public.case_files
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. Fix books RLS - Admin Only
-- Drop ALL existing policies for books
DROP POLICY IF EXISTS "Admin Insert Books" ON public.books;
DROP POLICY IF EXISTS "Admin Update Books" ON public.books;
DROP POLICY IF EXISTS "Admins can manage books" ON public.books;
DROP POLICY IF EXISTS "Anyone can view published books" ON public.books;

-- Public can view published books
CREATE POLICY "Anyone can view published books" ON public.books
  FOR SELECT USING (is_published = true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage books" ON public.books
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. Fix court_cases RLS - Admin Only for Writes
DROP POLICY IF EXISTS "Public View Court" ON public.court_cases;
DROP POLICY IF EXISTS "Admin Manage Court" ON public.court_cases;
DROP POLICY IF EXISTS "Anyone can view cases" ON public.court_cases;
DROP POLICY IF EXISTS "Admins can manage cases" ON public.court_cases;

CREATE POLICY "Public can view court cases" ON public.court_cases
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage court cases" ON public.court_cases
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 5. Fix Storage Bucket Policy - Admin Only
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Give Admins Access" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage storage" ON storage.objects;

-- Only admins can upload/manage files
CREATE POLICY "Admins can manage storage" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'protected_files' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    bucket_id = 'protected_files' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 6. Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_case_files_file_path ON public.case_files(file_path);
CREATE INDEX IF NOT EXISTS idx_books_file_path ON public.books(file_path);
CREATE INDEX IF NOT EXISTS idx_case_files_is_published ON public.case_files(is_published);
CREATE INDEX IF NOT EXISTS idx_books_is_published ON public.books(is_published);
CREATE INDEX IF NOT EXISTS idx_purchases_item_id ON public.purchases(item_id);
CREATE INDEX IF NOT EXISTS idx_purchases_item_type ON public.purchases(item_type);

-- 7. Add purchase verification helper function (for checking access)
CREATE OR REPLACE FUNCTION public.user_has_access(item_type TEXT, item_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.purchases
    WHERE purchases.item_type = user_has_access.item_type
      AND purchases.item_id = user_has_access.item_id
      AND purchases.user_id = user_has_access.user_id
      AND purchases.payment_status = 'completed'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

