# Judicially Legal Ways - Database Schema Documentation

## Overview

This database schema supports a legal education platform with three user roles:
- **Students**: Can browse, purchase, and read case files and books
- **Lawyers**: Can do everything students can + add/manage court cases
- **Admins**: Full CRUD access to all tables

## Architecture

### Core Entities

```
┌─────────────┐
│  auth.users │ (Supabase Auth)
└──────┬──────┘
       │
       ├──────────────────────────────────────┐
       │                                      │
┌──────▼──────┐                    ┌─────────▼────────┐
│  profiles   │                    │  activity_logs   │
│  (extends)  │                    │  (audit trail)   │
└──────┬──────┘                    └──────────────────┘
       │
       ├─────────────┬─────────────┬─────────────┐
       │             │             │             │
┌──────▼──────┐ ┌───▼────┐  ┌─────▼──────┐ ┌───▼────────┐
│ case_files  │ │ books  │  │court_cases │ │subscriptions│
│ (products)  │ │(products)│ │ (tracker)  │ │  (plans)   │
└──────┬──────┘ └───┬────┘  └─────┬──────┘ └────────────┘
       │            │              │
       ├────────────┴──────────────┤
       │                           │
┌──────▼──────┐            ┌──────▼──────┐
│  purchases  │            │ saved_cases │
│(transactions)│           │ (bookmarks) │
└─────────────┘            └─────────────┘
       │
┌──────▼──────────────┐
│ progress tracking   │
│ (reading progress)  │
└─────────────────────┘
```

## Tables

### 1. profiles
Extends Supabase auth.users with additional user information.

**Columns:**
- `id` (UUID, PK): References auth.users(id)
- `email` (TEXT, UNIQUE): User email
- `full_name` (TEXT): Display name
- `avatar_url` (TEXT): Profile picture URL
- `role` (ENUM): 'student', 'lawyer', or 'admin'
- `phone` (TEXT): Contact number
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Access:**
- Users can view/update their own profile
- Admins can view/update all profiles

### 2. case_files
Legal case studies, judgments, and case files for purchase/reading.

**Columns:**
- `id` (UUID, PK)
- `title` (TEXT): Case file title
- `description` (TEXT): Detailed description
- `case_number` (TEXT): Official case number
- `court_name` (TEXT): Court where case was heard
- `category` (TEXT): criminal, civil, constitutional, etc.
- `subcategory` (TEXT): More specific categorization
- `year` (INTEGER): Year of judgment
- `thumbnail_url` (TEXT): Preview image
- `file_url` (TEXT): Path in storage bucket
- `file_type` (TEXT): Usually 'pdf'
- `file_size` (INTEGER): Size in bytes
- `is_premium` (BOOLEAN): Premium content flag
- `price` (DECIMAL): Price in INR (0 for free)
- `is_published` (BOOLEAN): Visibility flag
- `total_pages` (INTEGER): Number of pages
- `tags` (TEXT[]): Array of tags
- **Legal metadata:**
  - `judge_name` (TEXT)
  - `petitioner` (TEXT)
  - `respondent` (TEXT)
  - `advocate_names` (TEXT[])
  - `case_summary` (TEXT)
  - `key_points` (TEXT[])
  - `judgment_date` (DATE)
  - `bench` (TEXT)
  - `state` (TEXT)
- `uploaded_by` (UUID): Admin who uploaded
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Access:**
- Anyone can view published case files
- Admins can CRUD all case files

**Indexes:**
- category, year, tags (GIN), case_number, is_published, created_at

### 3. books
Physical and digital books available in the store.

**Columns:**
- `id` (UUID, PK)
- `title` (TEXT): Book title
- `author` (TEXT): Author name
- `description` (TEXT): Book description
- `cover_url` (TEXT): Cover image
- `preview_url` (TEXT): Preview/sample URL
- `file_url` (TEXT): Digital book PDF path
- `price` (DECIMAL): Price in INR
- `original_price` (DECIMAL): For showing discounts
- `category` (TEXT): law_notes, criminal_law, etc.
- `isbn` (TEXT): ISBN number
- `pages` (INTEGER): Number of pages
- `publisher` (TEXT): Publisher name
- `is_bundle` (BOOLEAN): Bundle flag
- `bundle_items` (UUID[]): Array of book IDs in bundle
- `stock` (INTEGER): Available quantity
- `is_published` (BOOLEAN): Visibility flag
- `uploaded_by` (UUID): Admin who uploaded
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Access:**
- Anyone can view published books
- Admins can CRUD all books

**Indexes:**
- category, author, is_published, created_at

### 4. court_cases
Real-time court case tracking system.

**Columns:**
- `id` (UUID, PK)
- `case_number` (TEXT, UNIQUE): Official case number
- `case_title` (TEXT): Case title
- `party_names` (TEXT[]): Petitioner, respondent, etc.
- `advocate_names` (TEXT[]): Lawyers involved
- `court_name` (TEXT): Court name
- `court_type` (TEXT): Supreme Court, High Court, etc.
- `state` (TEXT): State where case is filed
- `judge_name` (TEXT): Presiding judge
- `status` (ENUM): 'pending', 'hearing_today', 'disposed', 'adjourned'
- `filing_date` (DATE): When case was filed
- `next_hearing_date` (DATE): Next hearing date
- `disposal_date` (DATE): When case was disposed
- `case_summary` (TEXT): Case summary
- `added_by` (UUID): Lawyer/admin who added
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Access:**
- Anyone can view court cases
- Lawyers and admins can add court cases
- Lawyers can update their own cases
- Admins can update any case

**Indexes:**
- status, state, case_number, next_hearing_date, updated_at

### 5. purchases
Transaction records for all purchases.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK): Buyer
- `item_type` (ENUM): 'case_file', 'book', or 'subscription'
- `item_id` (UUID): ID of purchased item
- `amount` (DECIMAL): Amount paid
- `payment_id` (TEXT): Payment gateway transaction ID
- `payment_status` (ENUM): 'pending', 'completed', 'failed', 'refunded'
- `payment_method` (TEXT): razorpay, stripe, etc.
- `transaction_details` (JSONB): Full payment response
- `created_at` (TIMESTAMPTZ)

**Access:**
- Users can view their own purchases
- Users can create purchases
- Admins can view all purchases

**Indexes:**
- user_id, (item_type, item_id), payment_status, created_at

### 6. subscriptions
Premium subscription plans.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK): Subscriber
- `plan_type` (ENUM): 'monthly', 'quarterly', 'yearly'
- `status` (ENUM): 'active', 'cancelled', 'expired'
- `start_date` (TIMESTAMPTZ): Subscription start
- `end_date` (TIMESTAMPTZ): Subscription end
- `amount` (DECIMAL): Subscription cost
- `payment_id` (TEXT): Payment reference
- `auto_renew` (BOOLEAN): Auto-renewal flag
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Access:**
- Users can view/create/update their own subscriptions
- Admins can view all subscriptions

### 7. saved_cases
User bookmarked court cases.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK): User who saved
- `case_id` (UUID, FK): Saved court case
- `notes` (TEXT): User notes
- `created_at` (TIMESTAMPTZ)
- UNIQUE(user_id, case_id)

**Access:**
- Users can manage their own saved cases

### 8. case_file_progress
Reading progress tracking for case files.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK): Reader
- `case_file_id` (UUID, FK): Case file being read
- `current_page` (INTEGER): Last page read
- `total_pages` (INTEGER): Total pages
- `bookmarks` (JSONB): Array of bookmarks
- `highlights` (JSONB): Array of highlights
- `notes` (JSONB): Array of notes
- `last_accessed` (TIMESTAMPTZ): Last read time
- `created_at`, `updated_at` (TIMESTAMPTZ)
- UNIQUE(user_id, case_file_id)

**Access:**
- Users can manage their own progress

### 9. book_progress
Reading progress tracking for books.

Same structure as case_file_progress but for books.

### 10. activity_logs
Audit trail of all user actions.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK): User who performed action
- `action` (TEXT): Action type (login, purchase, view, etc.)
- `details` (JSONB): Additional context
- `ip_address` (TEXT): User IP
- `device_info` (TEXT): Device/browser info
- `created_at` (TIMESTAMPTZ)

**Access:**
- Users can view their own logs
- Users can create logs
- Admins can view all logs

**Indexes:**
- user_id, action, created_at

### 11. cart_items
Shopping cart (optional - frontend uses localStorage).

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK): Cart owner
- `item_type` (ENUM): 'case_file', 'book', 'subscription'
- `item_id` (UUID): Item in cart
- `quantity` (INTEGER): Quantity
- `created_at` (TIMESTAMPTZ)
- UNIQUE(user_id, item_type, item_id)

**Access:**
- Users can manage their own cart

## Helper Functions

### has_purchased(user_id, item_type, item_id)
Returns BOOLEAN indicating if user has purchased an item.

```sql
SELECT public.has_purchased(
  'user-uuid',
  'case_file',
  'item-uuid'
);
```

### has_active_subscription(user_id)
Returns BOOLEAN indicating if user has an active subscription.

```sql
SELECT public.has_active_subscription('user-uuid');
```

### log_activity(user_id, action, details, ip_address, device_info)
Logs user activity and returns log ID.

```sql
SELECT public.log_activity(
  'user-uuid',
  'view_case_file',
  '{"case_file_id": "uuid"}'::jsonb,
  '192.168.1.1',
  'Chrome/Windows'
);
```

## Triggers

### Auto-update updated_at
All tables with `updated_at` column automatically update it on row modification.

### Auto-create profile on signup
When a user signs up via Supabase Auth, a profile is automatically created.

## Storage

### protected_files bucket
- **Type**: Private
- **Purpose**: Store PDFs and documents
- **Access**: 
  - Admins can upload/update/delete
  - Authenticated users can read (via signed URLs)
  - Files accessed through DRM reader with watermarking

## Security

### Row Level Security (RLS)
All tables have RLS enabled with policies based on user roles:

- **Students**: Can view published content, manage own data
- **Lawyers**: Student permissions + can add/manage court cases
- **Admins**: Full access to all tables

### Storage Security
- Files stored in private bucket
- Access via signed URLs (60-second expiry)
- DRM reader adds watermarks
- Right-click disabled, copy protection

## Performance

### Indexes
Strategic indexes on:
- Foreign keys
- Frequently queried columns (category, status, dates)
- Full-text search columns (tags using GIN)

### Query Optimization
- Use `is_published = true` filters
- Limit results with pagination
- Use `created_at DESC` for recent items

## Common Queries

### Get user's purchased case files
```sql
SELECT cf.* 
FROM case_files cf
JOIN purchases p ON p.item_id = cf.id
WHERE p.user_id = 'user-uuid'
  AND p.item_type = 'case_file'
  AND p.payment_status = 'completed';
```

### Get upcoming court hearings
```sql
SELECT * FROM court_cases
WHERE next_hearing_date >= CURRENT_DATE
  AND status IN ('pending', 'hearing_today')
ORDER BY next_hearing_date ASC
LIMIT 50;
```

### Get admin dashboard stats
```sql
SELECT 
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM case_files WHERE is_published = true) as total_case_files,
  (SELECT COUNT(*) FROM books WHERE is_published = true) as total_books,
  (SELECT COUNT(*) FROM court_cases) as total_court_cases,
  (SELECT COUNT(*) FROM purchases WHERE payment_status = 'completed') as total_purchases,
  (SELECT COALESCE(SUM(amount), 0) FROM purchases WHERE payment_status = 'completed') as total_revenue;
```

## Maintenance

### Regular Tasks
1. **Archive old activity logs** (keep last 6 months)
2. **Update expired subscriptions** (run daily)
3. **Clean up abandoned carts** (run weekly)
4. **Backup database** (automated in Supabase)

### Monitoring
- Watch for slow queries in Supabase Dashboard
- Monitor storage usage
- Check RLS policy performance
- Review activity logs for suspicious patterns

## Migration from Old Schema

See `MIGRATION_GUIDE.md` for detailed migration instructions.

## Support

For issues or questions:
1. Check Supabase Dashboard → Logs
2. Review RLS policies
3. Verify user roles
4. Check storage bucket configuration
