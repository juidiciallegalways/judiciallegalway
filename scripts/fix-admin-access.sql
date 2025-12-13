-- ============================================================================
-- FIX ADMIN ACCESS - Complete Solution
-- ============================================================================
-- This script will fix admin access issues by:
-- 1. Finding your user ID from auth.users
-- 2. Cleaning up any duplicate profiles
-- 3. Creating/updating your profile with admin role
-- 4. Verifying the fix worked
-- ============================================================================

-- STEP 1: Replace this with YOUR email address
-- ⚠️ IMPORTANT: Change 'your-email@example.com' to your actual email!
\set admin_email 'your-email@example.com'

-- ============================================================================
-- DIAGNOSTIC: Check current state
-- ============================================================================

-- Check if user exists in auth.users
SELECT 
  'AUTH USER CHECK' as check_type,
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users 
WHERE email = :'admin_email';

-- Check if profile exists
SELECT 
  'PROFILE CHECK' as check_type,
  id,
  email,
  role,
  created_at,
  updated_at
FROM public.profiles 
WHERE email = :'admin_email';

-- Check for duplicate profiles
SELECT 
  'DUPLICATE CHECK' as check_type,
  COUNT(*) as profile_count
FROM public.profiles 
WHERE email = :'admin_email';

-- ============================================================================
-- FIX: Clean up and set admin role
-- ============================================================================

-- Method 1: If profile exists, just update the role
UPDATE public.profiles 
SET 
  role = 'admin',
  updated_at = NOW()
WHERE email = :'admin_email'
RETURNING id, email, role, updated_at;

-- Method 2: If profile doesn't exist, create it
-- (This will only run if the UPDATE above affected 0 rows)
DO $$
DECLARE
  user_id_var UUID;
  user_email_var TEXT := :'admin_email';
  profile_exists BOOLEAN;
BEGIN
  -- Get user ID from auth
  SELECT id INTO user_id_var 
  FROM auth.users 
  WHERE email = user_email_var;
  
  IF user_id_var IS NULL THEN
    RAISE EXCEPTION 'User not found in auth.users with email: %. Please sign up first!', user_email_var;
  END IF;
  
  -- Check if profile exists
  SELECT EXISTS(
    SELECT 1 FROM public.profiles WHERE id = user_id_var
  ) INTO profile_exists;
  
  IF NOT profile_exists THEN
    -- Create profile with admin role
    INSERT INTO public.profiles (id, email, role, created_at, updated_at)
    VALUES (user_id_var, user_email_var, 'admin', NOW(), NOW());
    
    RAISE NOTICE 'Created new admin profile for: %', user_email_var;
  ELSE
    RAISE NOTICE 'Profile already exists, role updated to admin';
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION: Confirm the fix worked
-- ============================================================================

-- Final check - should show role = 'admin'
SELECT 
  '✅ FINAL VERIFICATION' as status,
  id,
  email,
  role,
  created_at,
  updated_at,
  CASE 
    WHEN role = 'admin' THEN '✅ SUCCESS - You are now an admin!'
    ELSE '❌ FAILED - Role is not admin. Try Method 3 below.'
  END as result
FROM public.profiles 
WHERE email = :'admin_email';

-- ============================================================================
-- METHOD 3: Nuclear option - Delete and recreate (if above didn't work)
-- ============================================================================
-- ⚠️ Only run this if the verification above shows FAILED
-- ⚠️ This will delete your profile and recreate it
-- ⚠️ Uncomment the lines below to use this method

/*
DO $$
DECLARE
  user_id_var UUID;
  user_email_var TEXT := :'admin_email';
BEGIN
  -- Get user ID
  SELECT id INTO user_id_var FROM auth.users WHERE email = user_email_var;
  
  IF user_id_var IS NULL THEN
    RAISE EXCEPTION 'User not found: %', user_email_var;
  END IF;
  
  -- Delete existing profile(s)
  DELETE FROM public.profiles WHERE email = user_email_var;
  
  -- Create fresh admin profile
  INSERT INTO public.profiles (id, email, role, created_at, updated_at)
  VALUES (user_id_var, user_email_var, 'admin', NOW(), NOW());
  
  RAISE NOTICE 'Profile recreated with admin role';
END $$;

-- Verify again
SELECT * FROM public.profiles WHERE email = :'admin_email';
*/

-- ============================================================================
-- ADDITIONAL CHECKS
-- ============================================================================

-- Check RLS policies (should allow admins to update profiles)
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Check if there are any other admin users
SELECT 
  'OTHER ADMINS' as info,
  id,
  email,
  role,
  created_at
FROM public.profiles 
WHERE role = 'admin'
ORDER BY created_at DESC;

-- ============================================================================
-- NEXT STEPS AFTER RUNNING THIS SCRIPT
-- ============================================================================
-- 1. Verify the "FINAL VERIFICATION" shows ✅ SUCCESS
-- 2. Sign out of your application
-- 3. Clear browser cache (Ctrl+Shift+Delete)
-- 4. Close all browser tabs
-- 5. Open a new incognito/private window
-- 6. Sign in again
-- 7. Go to /debug-auth to verify
-- 8. Check if "Admin Panel" appears in profile dropdown
-- ============================================================================
