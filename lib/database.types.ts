// Database types matching the complete schema

export type UserRole = 'student' | 'lawyer' | 'admin'
export type CaseStatus = 'pending' | 'hearing_today' | 'disposed' | 'adjourned'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type ItemType = 'case_file' | 'book' | 'subscription'
export type SubscriptionPlan = 'monthly' | 'quarterly' | 'yearly'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  phone: string | null
  created_at: string
  updated_at: string
}

export interface CaseFile {
  id: string
  title: string
  description: string | null
  case_number: string | null
  court_name: string | null
  category: string
  subcategory: string | null
  year: number | null
  thumbnail_url: string | null
  file_url: string
  file_type: string | null
  file_size: number | null
  is_premium: boolean
  price: number
  is_published: boolean
  total_pages: number
  tags: string[] | null
  judge_name: string | null
  petitioner: string | null
  respondent: string | null
  advocate_names: string[] | null
  case_summary: string | null
  key_points: string[] | null
  judgment_date: string | null
  bench: string | null
  state: string | null
  uploaded_by: string | null
  created_at: string
  updated_at: string
}

export interface Book {
  id: string
  title: string
  author: string
  description: string | null
  cover_url: string | null
  preview_url: string | null
  file_url: string | null
  price: number
  original_price: number | null
  category: string | null
  isbn: string | null
  pages: number | null
  publisher: string | null
  is_bundle: boolean
  bundle_items: string[] | null
  stock: number
  is_published: boolean
  uploaded_by: string | null
  created_at: string
  updated_at: string
}

export interface CourtCase {
  id: string
  case_number: string
  case_title: string
  party_names: string[] | null
  advocate_names: string[] | null
  court_name: string
  court_type: string | null
  state: string
  judge_name: string | null
  status: CaseStatus
  filing_date: string | null
  next_hearing_date: string | null
  disposal_date: string | null
  case_summary: string | null
  added_by: string | null
  created_at: string
  updated_at: string
}

export interface Purchase {
  id: string
  user_id: string
  item_type: ItemType
  item_id: string
  amount: number
  payment_id: string | null
  payment_status: PaymentStatus
  payment_method: string | null
  transaction_details: any
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_type: SubscriptionPlan
  status: SubscriptionStatus
  start_date: string
  end_date: string
  amount: number
  payment_id: string | null
  auto_renew: boolean
  created_at: string
  updated_at: string
}

export interface SavedCase {
  id: string
  user_id: string
  case_id: string
  notes: string | null
  created_at: string
}

export interface CaseFileProgress {
  id: string
  user_id: string
  case_file_id: string
  current_page: number
  total_pages: number
  bookmarks: any[]
  highlights: any[]
  notes: any[]
  last_accessed: string
  created_at: string
  updated_at: string
}

export interface BookProgress {
  id: string
  user_id: string
  book_id: string
  current_page: number
  total_pages: number
  bookmarks: any[]
  highlights: any[]
  notes: any[]
  last_accessed: string
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  action: string
  details: any
  ip_address: string | null
  device_info: string | null
  created_at: string
}

export interface CartItem {
  id: string
  user_id: string
  item_type: ItemType
  item_id: string
  quantity: number
  created_at: string
}

// Helper types for joins
export interface PurchaseWithDetails extends Purchase {
  profiles?: Profile
  case_files?: CaseFile
  books?: Book
}

export interface CourtCaseWithProfile extends CourtCase {
  profiles?: Profile
}

// Stats types
export interface DashboardStats {
  totalUsers: number
  totalStudents: number
  totalLawyers: number
  totalAdmins: number
  totalPurchases: number
  totalRevenue: number
  totalCaseFiles: number
  totalBooks: number
  totalCourtCases: number
  pendingPayments: number
  todayRevenue: number
  monthRevenue: number
  weekRevenue: number
  activeSubscriptions: number
}
