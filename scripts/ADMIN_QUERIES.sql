-- ============================================================================
-- ADMIN QUICK REFERENCE QUERIES
-- ============================================================================
-- Common SQL queries for managing Judicially Legal Ways
-- ============================================================================

-- ============================================================================
-- 1. USER MANAGEMENT
-- ============================================================================

-- Make a user an admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';

-- Make a user a lawyer
UPDATE public.profiles 
SET role = 'lawyer' 
WHERE email = 'lawyer@example.com';

-- View all admins
SELECT id, email, full_name, role, created_at 
FROM public.profiles 
WHERE role = 'admin'
ORDER BY created_at DESC;

-- View all users with their roles
SELECT 
  id,
  email,
  full_name,
  role,
  created_at,
  (SELECT COUNT(*) FROM purchases WHERE user_id = profiles.id AND payment_status = 'completed') as total_purchases
FROM public.profiles
ORDER BY created_at DESC;

-- Find users who haven't made any purchases
SELECT p.id, p.email, p.full_name, p.created_at
FROM public.profiles p
LEFT JOIN public.purchases pur ON pur.user_id = p.id AND pur.payment_status = 'completed'
WHERE pur.id IS NULL
  AND p.role = 'student'
ORDER BY p.created_at DESC;

-- ============================================================================
-- 2. CONTENT MANAGEMENT
-- ============================================================================

-- View all case files with upload info
SELECT 
  cf.id,
  cf.title,
  cf.case_number,
  cf.category,
  cf.price,
  cf.is_published,
  cf.total_pages,
  p.email as uploaded_by_email,
  cf.created_at
FROM public.case_files cf
LEFT JOIN public.profiles p ON p.id = cf.uploaded_by
ORDER BY cf.created_at DESC;

-- View all books with sales count
SELECT 
  b.id,
  b.title,
  b.author,
  b.price,
  b.stock,
  b.is_published,
  COUNT(pur.id) as total_sales,
  SUM(CASE WHEN pur.payment_status = 'completed' THEN pur.amount ELSE 0 END) as total_revenue
FROM public.books b
LEFT JOIN public.purchases pur ON pur.item_id = b.id AND pur.item_type = 'book'
GROUP BY b.id
ORDER BY total_sales DESC;

-- Find unpublished content
SELECT 'case_file' as type, id, title, created_at 
FROM public.case_files 
WHERE is_published = false
UNION ALL
SELECT 'book' as type, id, title, created_at 
FROM public.books 
WHERE is_published = false
ORDER BY created_at DESC;

-- Publish/unpublish content
UPDATE public.case_files SET is_published = true WHERE id = 'uuid-here';
UPDATE public.books SET is_published = false WHERE id = 'uuid-here';

-- ============================================================================
-- 3. SALES & REVENUE
-- ============================================================================

-- Dashboard stats
SELECT 
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM profiles WHERE role = 'student') as total_students,
  (SELECT COUNT(*) FROM profiles WHERE role = 'lawyer') as total_lawyers,
  (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as total_admins,
  (SELECT COUNT(*) FROM case_files WHERE is_published = true) as published_case_files,
  (SELECT COUNT(*) FROM books WHERE is_published = true) as published_books,
  (SELECT COUNT(*) FROM court_cases) as total_court_cases,
  (SELECT COUNT(*) FROM purchases WHERE payment_status = 'completed') as completed_purchases,
  (SELECT COALESCE(SUM(amount), 0) FROM purchases WHERE payment_status = 'completed') as total_revenue;

-- Revenue by month (last 12 months)
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_purchases,
  SUM(amount) as revenue,
  AVG(amount) as avg_order_value
FROM public.purchases
WHERE payment_status = 'completed'
  AND created_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Top selling case files
SELECT 
  cf.id,
  cf.title,
  cf.case_number,
  cf.price,
  COUNT(p.id) as total_sales,
  SUM(p.amount) as total_revenue
FROM public.case_files cf
JOIN public.purchases p ON p.item_id = cf.id AND p.item_type = 'case_file'
WHERE p.payment_status = 'completed'
GROUP BY cf.id
ORDER BY total_sales DESC
LIMIT 10;

-- Top selling books
SELECT 
  b.id,
  b.title,
  b.author,
  b.price,
  COUNT(p.id) as total_sales,
  SUM(p.amount) as total_revenue
FROM public.books b
JOIN public.purchases p ON p.item_id = b.id AND p.item_type = 'book'
WHERE p.payment_status = 'completed'
GROUP BY b.id
ORDER BY total_sales DESC
LIMIT 10;

-- Recent purchases
SELECT 
  p.id,
  p.created_at,
  prof.email as buyer_email,
  p.item_type,
  CASE 
    WHEN p.item_type = 'case_file' THEN cf.title
    WHEN p.item_type = 'book' THEN b.title
    ELSE 'Subscription'
  END as item_title,
  p.amount,
  p.payment_status
FROM public.purchases p
JOIN public.profiles prof ON prof.id = p.user_id
LEFT JOIN public.case_files cf ON cf.id = p.item_id AND p.item_type = 'case_file'
LEFT JOIN public.books b ON b.id = p.item_id AND p.item_type = 'book'
ORDER BY p.created_at DESC
LIMIT 50;

-- Failed/pending payments
SELECT 
  p.id,
  p.created_at,
  prof.email,
  p.item_type,
  p.amount,
  p.payment_status,
  p.payment_id
FROM public.purchases p
JOIN public.profiles prof ON prof.id = p.user_id
WHERE p.payment_status IN ('pending', 'failed')
ORDER BY p.created_at DESC;

-- ============================================================================
-- 4. COURT TRACKER
-- ============================================================================

-- Upcoming hearings (next 7 days)
SELECT 
  cc.case_number,
  cc.case_title,
  cc.court_name,
  cc.state,
  cc.next_hearing_date,
  cc.status,
  prof.email as added_by_email
FROM public.court_cases cc
LEFT JOIN public.profiles prof ON prof.id = cc.added_by
WHERE cc.next_hearing_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
  AND cc.status IN ('pending', 'hearing_today')
ORDER BY cc.next_hearing_date ASC;

-- Cases by status
SELECT 
  status,
  COUNT(*) as count
FROM public.court_cases
GROUP BY status
ORDER BY count DESC;

-- Cases by state
SELECT 
  state,
  COUNT(*) as count
FROM public.court_cases
GROUP BY state
ORDER BY count DESC;

-- Recently added cases
SELECT 
  cc.case_number,
  cc.case_title,
  cc.court_name,
  cc.state,
  cc.status,
  prof.email as added_by,
  cc.created_at
FROM public.court_cases cc
LEFT JOIN public.profiles prof ON prof.id = cc.added_by
ORDER BY cc.created_at DESC
LIMIT 20;

-- ============================================================================
-- 5. USER ACTIVITY
-- ============================================================================

-- Most active users (by activity logs)
SELECT 
  prof.email,
  prof.full_name,
  prof.role,
  COUNT(al.id) as activity_count,
  MAX(al.created_at) as last_activity
FROM public.profiles prof
JOIN public.activity_logs al ON al.user_id = prof.id
GROUP BY prof.id
ORDER BY activity_count DESC
LIMIT 20;

-- Recent activity
SELECT 
  al.created_at,
  prof.email,
  al.action,
  al.details,
  al.ip_address
FROM public.activity_logs al
JOIN public.profiles prof ON prof.id = al.user_id
ORDER BY al.created_at DESC
LIMIT 100;

-- Activity by action type
SELECT 
  action,
  COUNT(*) as count,
  COUNT(DISTINCT user_id) as unique_users
FROM public.activity_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY action
ORDER BY count DESC;

-- ============================================================================
-- 6. SUBSCRIPTIONS
-- ============================================================================

-- Active subscriptions
SELECT 
  s.id,
  prof.email,
  s.plan_type,
  s.start_date,
  s.end_date,
  s.amount,
  s.auto_renew,
  CASE 
    WHEN s.end_date < NOW() THEN 'Expired'
    WHEN s.end_date < NOW() + INTERVAL '7 days' THEN 'Expiring Soon'
    ELSE 'Active'
  END as status_detail
FROM public.subscriptions s
JOIN public.profiles prof ON prof.id = s.user_id
WHERE s.status = 'active'
ORDER BY s.end_date ASC;

-- Expiring subscriptions (next 7 days)
SELECT 
  s.id,
  prof.email,
  s.plan_type,
  s.end_date,
  s.auto_renew
FROM public.subscriptions s
JOIN public.profiles prof ON prof.id = s.user_id
WHERE s.status = 'active'
  AND s.end_date BETWEEN NOW() AND NOW() + INTERVAL '7 days'
ORDER BY s.end_date ASC;

-- Subscription revenue
SELECT 
  plan_type,
  COUNT(*) as total_subscriptions,
  SUM(amount) as total_revenue,
  AVG(amount) as avg_revenue
FROM public.subscriptions
WHERE status = 'active'
GROUP BY plan_type;

-- ============================================================================
-- 7. DATA CLEANUP & MAINTENANCE
-- ============================================================================

-- Archive old activity logs (keep last 6 months)
DELETE FROM public.activity_logs 
WHERE created_at < NOW() - INTERVAL '6 months';

-- Update expired subscriptions
UPDATE public.subscriptions 
SET status = 'expired' 
WHERE status = 'active' 
  AND end_date < NOW();

-- Clean up abandoned carts (older than 30 days)
DELETE FROM public.cart_items 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Find orphaned progress records (user deleted)
SELECT cp.id, cp.user_id, cp.case_file_id
FROM public.case_file_progress cp
LEFT JOIN public.profiles p ON p.id = cp.user_id
WHERE p.id IS NULL;

-- Delete orphaned progress records
DELETE FROM public.case_file_progress
WHERE user_id NOT IN (SELECT id FROM public.profiles);

DELETE FROM public.book_progress
WHERE user_id NOT IN (SELECT id FROM public.profiles);

-- ============================================================================
-- 8. SEARCH & DISCOVERY
-- ============================================================================

-- Search case files by keyword
SELECT id, title, case_number, category, price
FROM public.case_files
WHERE is_published = true
  AND (
    title ILIKE '%keyword%' OR
    description ILIKE '%keyword%' OR
    case_number ILIKE '%keyword%' OR
    'keyword' = ANY(tags)
  )
ORDER BY created_at DESC;

-- Search books by keyword
SELECT id, title, author, category, price
FROM public.books
WHERE is_published = true
  AND (
    title ILIKE '%keyword%' OR
    author ILIKE '%keyword%' OR
    description ILIKE '%keyword%'
  )
ORDER BY created_at DESC;

-- Popular tags in case files
SELECT 
  unnest(tags) as tag,
  COUNT(*) as usage_count
FROM public.case_files
WHERE is_published = true
  AND tags IS NOT NULL
GROUP BY tag
ORDER BY usage_count DESC
LIMIT 20;

-- ============================================================================
-- 9. STORAGE MANAGEMENT
-- ============================================================================

-- List all files in storage bucket
SELECT 
  name,
  bucket_id,
  created_at,
  updated_at,
  metadata
FROM storage.objects
WHERE bucket_id = 'protected_files'
ORDER BY created_at DESC;

-- Find large files (> 10MB)
SELECT 
  name,
  bucket_id,
  (metadata->>'size')::bigint / 1024 / 1024 as size_mb,
  created_at
FROM storage.objects
WHERE bucket_id = 'protected_files'
  AND (metadata->>'size')::bigint > 10485760
ORDER BY (metadata->>'size')::bigint DESC;

-- ============================================================================
-- 10. DEBUGGING & TROUBLESHOOTING
-- ============================================================================

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check for missing indexes
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
  AND correlation < 0.1
ORDER BY n_distinct DESC;

-- Verify user has correct role
SELECT id, email, role 
FROM public.profiles 
WHERE email = 'user@example.com';

-- Check if user has purchased an item
SELECT public.has_purchased(
  (SELECT id FROM profiles WHERE email = 'user@example.com'),
  'case_file',
  'item-uuid-here'
);

-- Check if user has active subscription
SELECT public.has_active_subscription(
  (SELECT id FROM profiles WHERE email = 'user@example.com')
);

-- ============================================================================
-- END OF ADMIN QUERIES
-- ============================================================================
