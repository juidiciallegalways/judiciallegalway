-- Create your profile in production
-- Run this in your PRODUCTION Supabase

-- 1. Check if profile exists
SELECT 'Profile exists check' as test, COUNT(*) as count FROM profiles 
WHERE id = 'a70291f4-92e2-4b0f-90ca-ce371d60dcc3';

-- 2. If not exists, create it
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
VALUES (
    'a70291f4-92e2-4b0f-90ca-ce371d60dcc3',
    'juidiciallegalways@gmail.com',
    'Juidicial Legal Ways',
    'admin',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 3. Verify profile created
SELECT 'Profile after insert' as test, id, email, role, created_at FROM profiles 
WHERE id = 'a70291f4-92e2-4b0f-90ca-ce371d60dcc3';

-- 4. Also create for piyush if needed
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
VALUES (
    '317be0cb-3a48-474a-a4fe-3b2e07afdd10',
    'piyushchandola2005@gmail.com',
    'piyush chandola',
    'admin',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;
