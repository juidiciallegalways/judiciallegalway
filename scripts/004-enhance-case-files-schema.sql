-- Enhance case_files table with judge and additional fields
-- Add missing fields for better case file details

ALTER TABLE public.case_files 
  ADD COLUMN IF NOT EXISTS judge_name TEXT,
  ADD COLUMN IF NOT EXISTS petitioner TEXT,
  ADD COLUMN IF NOT EXISTS respondent TEXT,
  ADD COLUMN IF NOT EXISTS advocate_names TEXT[],
  ADD COLUMN IF NOT EXISTS case_summary TEXT,
  ADD COLUMN IF NOT EXISTS key_points TEXT[],
  ADD COLUMN IF NOT EXISTS judgment_date DATE,
  ADD COLUMN IF NOT EXISTS bench TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT;

-- Add index for judge_name for better queries
CREATE INDEX IF NOT EXISTS idx_case_files_judge_name ON public.case_files(judge_name);
CREATE INDEX IF NOT EXISTS idx_case_files_state ON public.case_files(state);

