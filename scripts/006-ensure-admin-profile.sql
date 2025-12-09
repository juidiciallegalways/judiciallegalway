-- Ensure admin users have proper profiles
-- Run this to fix any missing admin profiles

-- Update existing auth users to have profiles if they don't
INSERT INTO public.profiles (id, email, role)
SELECT 
  au.id,
  au.email,
  'student' -- Default role
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- If you need to set a specific user as admin, run:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';

