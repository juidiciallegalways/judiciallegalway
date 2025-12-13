# 🔧 ADMIN ACCESS FIX - Step by Step Guide

## 🚨 PROBLEM IDENTIFIED

You're experiencing **3 issues**:
1. Profile shows "student" instead of "admin" in navbar
2. Can't access admin panel (redirected with error)
3. Error: `?error=profile_created_contact_admin`

## 🎯 ROOT CAUSES

### Issue 1: Profile Not Refreshing
The auth context caches your profile data. After updating the role in the database, the cached data still shows "student".

### Issue 2: Admin Page Creating New Profile
The admin page has logic that creates a NEW profile with "student" role if it doesn't find one, which might be overwriting your admin role.

### Issue 3: Browser Cache
Your browser might be caching the old session data.

---

## ✅ SOLUTION - Follow These Steps EXACTLY

### STEP 1: Verify Database Role (CRITICAL)

1. Go to your Supabase Dashboard
2. Navigate to **Table Editor** → **profiles**
3. Find your email in the list
4. **VERIFY** the `role` column says `admin`

If it doesn't say `admin`, run this in **SQL Editor**:

```sql
-- Replace with YOUR actual email
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-actual-email@example.com';

-- Verify it worked
SELECT id, email, role, updated_at 
FROM public.profiles 
WHERE email = 'your-actual-email@example.com';
```

**IMPORTANT:** Make sure `updated_at` timestamp changes after the UPDATE!

---

### STEP 2: Clear ALL Browser Data

This is **CRITICAL** - you must clear everything:

1. **Sign out** from the application
2. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
3. Select:
   - ✅ Cookies and site data
   - ✅ Cached images and files
   - ✅ Site settings
4. Time range: **All time**
5. Click **Clear data**
6. **Close ALL browser tabs**
7. **Restart your browser**

---

### STEP 3: Force Session Refresh

1. Open a **NEW incognito/private window**
2. Go to your site: `https://judiciallegalway.vercel.app`
3. Sign in with your admin email
4. After login, immediately go to: `https://judiciallegalway.vercel.app/debug-auth`
5. Check what it shows:
   - ✅ User email should match yours
   - ✅ Role should say "admin"
   - ✅ "Is Admin" should say "true"

---

### STEP 4: Test Admin Access

1. From the debug page, click on your profile icon in the navbar
2. You should see **"Admin Panel"** in the dropdown
3. Click **"Admin Panel"**
4. You should be taken to `/admin` without any redirect

---

## 🔍 TROUBLESHOOTING

### If Debug Page Shows "student" Role:

**Problem:** Database update didn't work or profile isn't refreshing

**Solution:**
```sql
-- Force update with explicit timestamp
UPDATE public.profiles 
SET 
  role = 'admin',
  updated_at = NOW()
WHERE email = 'your-email@example.com';

-- Double check
SELECT * FROM public.profiles WHERE email = 'your-email@example.com';
```

Then:
1. Sign out completely
2. Clear browser cache again
3. Wait 30 seconds
4. Sign in again

---

### If You Get "profile_created_contact_admin" Error:

**Problem:** The admin page is creating a new profile

**Solution:**

1. Check if you have MULTIPLE profiles in the database:
```sql
-- Check for duplicate profiles
SELECT id, email, role, created_at 
FROM public.profiles 
WHERE email = 'your-email@example.com'
ORDER BY created_at DESC;
```

2. If you see multiple rows, delete the student ones and keep only the admin:
```sql
-- Delete duplicate student profiles (keep the admin one!)
DELETE FROM public.profiles 
WHERE email = 'your-email@example.com' 
AND role = 'student';

-- Verify only admin profile remains
SELECT * FROM public.profiles WHERE email = 'your-email@example.com';
```

---

### If Profile Icon Still Shows "student":

**Problem:** React state not updating

**Solution:**

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Type this and press Enter:
```javascript
localStorage.clear()
sessionStorage.clear()
location.reload()
```

4. Sign in again

---

### If Admin Panel Link Doesn't Appear:

**Problem:** Auth context not detecting admin role

**Solution:**

1. Go to `/debug-auth` page
2. Take a screenshot of what you see
3. Check browser console for errors (F12 → Console tab)
4. Look for any red error messages

Common errors:
- "Failed to fetch profile" → Database connection issue
- "RLS policy violation" → Row Level Security blocking access
- "Invalid JWT" → Session expired, sign out and in again

---

## 🛠️ ADVANCED FIX: Manual Profile Refresh

If nothing else works, try this:

### Option 1: Force Profile Refresh via Console

1. Go to your site
2. Open DevTools (F12)
3. Go to **Console** tab
4. Paste this code:

```javascript
// Force refresh profile
fetch('/api/auth/refresh-profile', { method: 'POST' })
  .then(() => {
    console.log('Profile refreshed')
    location.reload()
  })
```

### Option 2: Delete and Recreate Profile

**⚠️ WARNING: This will delete your profile data!**

```sql
-- Backup your profile first
SELECT * FROM public.profiles WHERE email = 'your-email@example.com';

-- Delete profile
DELETE FROM public.profiles WHERE email = 'your-email@example.com';

-- Get your user ID from auth.users
SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Recreate profile with admin role (use the ID from above)
INSERT INTO public.profiles (id, email, role, created_at, updated_at)
VALUES (
  'your-user-id-here',
  'your-email@example.com',
  'admin',
  NOW(),
  NOW()
);
```

Then sign out and sign in again.

---

## 📊 VERIFICATION CHECKLIST

After following the steps, verify:

- [ ] Database shows `role = 'admin'` for your email
- [ ] `/debug-auth` page shows "Role: admin"
- [ ] `/debug-auth` page shows "Is Admin: true"
- [ ] Profile dropdown shows "Admin Panel" option
- [ ] Clicking "Admin Panel" takes you to `/admin`
- [ ] Admin dashboard loads without redirect
- [ ] No error in URL (`?error=...`)

---

## 🆘 STILL NOT WORKING?

### Check RLS Policies

Your Row Level Security might be blocking profile updates:

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Temporarily disable RLS for testing (NOT for production!)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Try updating role again
UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### Check Auth User Exists

```sql
-- Verify your auth user exists
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'your-email@example.com';

-- Check if profile ID matches auth user ID
SELECT 
  au.id as auth_id,
  au.email as auth_email,
  p.id as profile_id,
  p.email as profile_email,
  p.role
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE au.email = 'your-email@example.com';
```

If the IDs don't match, that's your problem!

---

## 🎯 QUICK FIX SCRIPT

Run this complete script in Supabase SQL Editor:

```sql
-- Complete Admin Fix Script
-- Replace 'your-email@example.com' with your actual email

DO $$
DECLARE
  user_id_var UUID;
  user_email_var TEXT := 'your-email@example.com'; -- CHANGE THIS!
BEGIN
  -- Get user ID from auth
  SELECT id INTO user_id_var 
  FROM auth.users 
  WHERE email = user_email_var;
  
  IF user_id_var IS NULL THEN
    RAISE EXCEPTION 'User not found in auth.users with email: %', user_email_var;
  END IF;
  
  -- Delete any existing profiles for this email
  DELETE FROM public.profiles WHERE email = user_email_var;
  
  -- Create fresh admin profile
  INSERT INTO public.profiles (id, email, role, created_at, updated_at)
  VALUES (user_id_var, user_email_var, 'admin', NOW(), NOW());
  
  -- Verify
  RAISE NOTICE 'Admin profile created successfully for: %', user_email_var;
END $$;

-- Check result
SELECT id, email, role, created_at 
FROM public.profiles 
WHERE email = 'your-email@example.com';
```

**After running this:**
1. Sign out
2. Clear browser cache
3. Close all tabs
4. Open new incognito window
5. Sign in
6. Go to `/debug-auth` to verify

---

## 📞 CONTACT INFO

If you're still stuck after trying everything:

1. Go to `/debug-auth`
2. Take a screenshot
3. Open browser console (F12)
4. Take a screenshot of any errors
5. Run this SQL and screenshot the result:
```sql
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created,
  p.id as profile_id,
  p.role,
  p.created_at as profile_created
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE au.email = 'your-email@example.com';
```

---

**Last Updated:** December 13, 2025  
**Status:** Active troubleshooting guide
