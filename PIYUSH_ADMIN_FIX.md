# 🎯 QUICK FIX FOR PIYUSH - ADMIN ACCESS

**Your User ID:** `317be0cb-3a48-474a-a4fe-3b2e07afdd10`  
**Your Email:** `piyushchandola2005@gmail.com`

---

## ⚡ FASTEST FIX (2 Minutes)

### 1️⃣ Run This SQL (Copy & Paste)

Go to **Supabase Dashboard** → **SQL Editor** → Paste this:

```sql
-- Fix Piyush's admin access
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

-- Verify it worked
SELECT id, email, role, updated_at 
FROM public.profiles 
WHERE id = '317be0cb-3a48-474a-a4fe-3b2e07afdd10';
```

**Expected Result:** Should show `role = 'admin'`

---

### 2️⃣ Clear Browser Cache

1. **Sign out** from https://judiciallegalway.vercel.app
2. Press `Ctrl + Shift + Delete`
3. Select **All time**
4. Check:
   - ✅ Cookies and site data
   - ✅ Cached images and files
5. Click **Clear data**
6. **Close ALL tabs**
7. **Restart browser**

---

### 3️⃣ Test in Incognito

1. Open **new incognito window**
2. Go to: https://judiciallegalway.vercel.app
3. Sign in with Google (piyushchandola2005@gmail.com)
4. Go to: https://judiciallegalway.vercel.app/debug-auth
5. Should show:
   - ✅ Role: admin
   - ✅ "You are an Admin!" green box

---

### 4️⃣ Access Admin Panel

1. Click your profile icon (top right)
2. Should see **"Admin Panel"** option
3. Click it
4. Admin dashboard should load! 🎉

---

## 🔍 IF IT DOESN'T WORK

### Option A: Force Refresh Profile

1. Go to your site
2. Press `F12` (open DevTools)
3. Go to **Console** tab
4. Paste this:

```javascript
fetch('/api/auth/refresh-profile')
  .then(r => r.json())
  .then(data => {
    console.log('Profile:', data)
    if (data.profile?.role === 'admin') {
      alert('✅ You are admin! Refreshing page...')
      localStorage.clear()
      sessionStorage.clear()
      location.href = '/debug-auth'
    } else {
      alert('❌ Role is: ' + (data.profile?.role || 'not found'))
    }
  })
```

---

### Option B: Check Database Directly

Go to **Supabase** → **Table Editor** → **profiles**

Find your email: `piyushchandola2005@gmail.com`

**Manually edit:**
- Click on the row
- Change `role` to `admin`
- Click Save
- Sign out and sign in again

---

### Option C: Delete & Recreate Profile

```sql
-- Delete existing profile
DELETE FROM public.profiles 
WHERE id = '317be0cb-3a48-474a-a4fe-3b2e07afdd10';

-- Create fresh admin profile
INSERT INTO public.profiles (id, email, full_name, avatar_url, role, created_at, updated_at)
VALUES (
  '317be0cb-3a48-474a-a4fe-3b2e07afdd10',
  'piyushchandola2005@gmail.com',
  'piyush chandola',
  'https://lh3.googleusercontent.com/a/ACg8ocLKISvoxF4ZwLhlKvNVBA1j4maX5iH6VOxtdbouF1CsY-bhRGAq=s96-c',
  'admin',
  NOW(),
  NOW()
);

-- Verify
SELECT * FROM public.profiles WHERE id = '317be0cb-3a48-474a-a4fe-3b2e07afdd10';
```

Then sign out, clear cache, and sign in again.

---

## ✅ SUCCESS CHECKLIST

- [ ] SQL query ran successfully
- [ ] Verification shows `role = 'admin'`
- [ ] Signed out from app
- [ ] Browser cache cleared
- [ ] Browser restarted
- [ ] Signed in again (incognito)
- [ ] `/debug-auth` shows "admin" role
- [ ] Profile dropdown has "Admin Panel"
- [ ] Admin dashboard loads

---

## 🆘 STILL STUCK?

### Debug Info to Collect:

1. **Check Database:**
```sql
SELECT * FROM public.profiles WHERE id = '317be0cb-3a48-474a-a4fe-3b2e07afdd10';
```
Screenshot the result.

2. **Check Auth:**
```sql
SELECT id, email, created_at FROM auth.users WHERE id = '317be0cb-3a48-474a-a4fe-3b2e07afdd10';
```
Screenshot the result.

3. **Go to:** https://judiciallegalway.vercel.app/debug-auth
   Screenshot the page.

4. **Browser Console:**
   Press F12 → Console tab → Screenshot any errors

---

## 🎯 MOST COMMON ISSUE

**Problem:** Browser is caching old session with "student" role

**Solution:** 
1. Use incognito mode for testing
2. OR clear cache completely
3. OR use different browser

---

## 📞 QUICK COMMANDS

### Check Your Profile:
```sql
SELECT * FROM public.profiles WHERE email = 'piyushchandola2005@gmail.com';
```

### Set Admin Role:
```sql
UPDATE public.profiles SET role = 'admin', updated_at = NOW() WHERE email = 'piyushchandola2005@gmail.com';
```

### Clear Browser Cache (Console):
```javascript
localStorage.clear(); sessionStorage.clear(); location.reload();
```

### Force Profile Refresh (Console):
```javascript
fetch('/api/auth/refresh-profile').then(r => r.json()).then(console.log)
```

---

## 🎉 WHEN IT WORKS

You'll see:
1. ✅ Green "You are an Admin!" box on `/debug-auth`
2. ✅ "Admin Panel" in profile dropdown
3. ✅ Admin dashboard with stats, upload forms, user management
4. ✅ No redirect errors

---

**Created:** December 13, 2025  
**For:** Piyush Chandola (piyushchandola2005@gmail.com)  
**Status:** Ready to apply
