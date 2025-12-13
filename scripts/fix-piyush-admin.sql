-- ============================================================================
-- FIX ADMIN ACCESS FOR PIYUSH
-- ============================================================================
-- User ID: 317be0cb-3a48-474a-a4fe-3b2e07afdd10
-- Email: piyushchandola2005@gmail.com
-- ============================================================================

-- STEP 1: Check current state
SELECT 
  'CURRENT STATE' as status,
  id,
  email,
  role,
  full_name,
  created_at,
  updated_at
FROM public.profiles 
WHERE id = '317be0cb-3a48-474a-a4fe-3b2e07afdd10';

-- STEP 2: Update to admin role
UPDATE public.profiles 
SET 
  role = 'admin',
  full_name = 'piyush chandola',
  avatar_url = 'https://lh3.googleusercontent.com/a/ACg8ocLKISvoxF4ZwLhlKvNVBA1j4maX5iH6VOxtdbouF1CsY-bhRGAq=s96-c',
  updated_at = NOW()
WHERE id = '317be0cb-3a48-474a-a4fe-3b2e07afdd10';

-- STEP 3: If profile doesn't exist, create it
INSERT INTO public.profiles (id, email, full_name, avatar_url, role, created_at, updated_at)
VALUES (
  '317be0cb-3a48-474a-a4fe-3b2e07afdd10',
  'piyushchandola2005@gmail.com',
  'piyush chandola',
  'https://lh3.googleusercontent.com/a/ACg8ocLKISvoxF4ZwLhlKvNVBA1j4maX5iH6VOxtdbouF1CsY-bhRGAq=s96-c',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  full_name = 'piyush chandola',
  avatar_url = 'https://lh3.googleusercontent.com/a/ACg8ocLKISvoxF4ZwLhlKvNVBA1j4maX5iH6VOxtdbouF1CsY-bhRGAq=s96-c',
  updated_at = NOW();

-- STEP 4: Verify the fix
SELECT 
  '✅ VERIFICATION' as status,
  id,
  email,
  role,
  full_name,
  created_at,
  updated_at,
  CASE 
    WHEN role = 'admin' THEN '✅ SUCCESS - You are now an admin!'
    ELSE '❌ FAILED - Something went wrong'
  END as result
FROM public.profiles 
WHERE id = '317be0cb-3a48-474a-a4fe-3b2e07afdd10';

-- STEP 5: Check all admin users
SELECT 
  'ALL ADMINS' as info,
  id,
  email,
  full_name,
  role,
  created_at
FROM public.profiles 
WHERE role = 'admin'
ORDER BY created_at DESC;
