// Database utility functions for common queries
import { createClient } from "@/lib/supabase/client"
import { createClient as createServerClient } from "@/utils/supabase/server"
import type { 
  CaseFile, Book, CourtCase, Purchase, Profile, 
  DashboardStats, ActivityLog, Subscription 
} from "./database.types"

// Client-side utilities
export const db = {
  // Case Files
  async getCaseFiles(filters?: { category?: string; isPremium?: boolean; isPublished?: boolean }) {
    const supabase = createClient()
    let query = supabase.from('case_files').select('*').order('created_at', { ascending: false })
    
    if (filters?.category) query = query.eq('category', filters.category)
    if (filters?.isPremium !== undefined) query = query.eq('is_premium', filters.isPremium)
    if (filters?.isPublished !== undefined) query = query.eq('is_published', filters.isPublished)
    
    const { data, error } = await query
    if (error) throw error
    return data as CaseFile[]
  },

  async getCaseFileById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('case_files')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as CaseFile
  },

  // Books
  async getBooks(filters?: { category?: string; isPublished?: boolean }) {
    const supabase = createClient()
    let query = supabase.from('books').select('*').order('created_at', { ascending: false })
    
    if (filters?.category) query = query.eq('category', filters.category)
    if (filters?.isPublished !== undefined) query = query.eq('is_published', filters.isPublished)
    
    const { data, error } = await query
    if (error) throw error
    return data as Book[]
  },

  async getBookById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Book
  },

  // Court Cases
  async getCourtCases(filters?: { status?: string; state?: string }) {
    const supabase = createClient()
    let query = supabase.from('court_cases').select('*').order('updated_at', { ascending: false })
    
    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.state) query = query.eq('state', filters.state)
    
    const { data, error } = await query
    if (error) throw error
    return data as CourtCase[]
  },

  async getCourtCaseById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('court_cases')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as CourtCase
  },

  // Purchases
  async getUserPurchases(userId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .eq('payment_status', 'completed')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Purchase[]
  },

  async hasPurchased(userId: string, itemType: string, itemId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('item_type', itemType)
      .eq('item_id', itemId)
      .eq('payment_status', 'completed')
      .maybeSingle()
    if (error) throw error
    return !!data
  },

  // Progress Tracking
  async getCaseFileProgress(userId: string, caseFileId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('case_file_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('case_file_id', caseFileId)
      .maybeSingle()
    if (error) throw error
    return data
  },

  async updateCaseFileProgress(userId: string, caseFileId: string, progress: any) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('case_file_progress')
      .upsert({
        user_id: userId,
        case_file_id: caseFileId,
        ...progress,
        last_accessed: new Date().toISOString()
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getBookProgress(userId: string, bookId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('book_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .maybeSingle()
    if (error) throw error
    return data
  },

  async updateBookProgress(userId: string, bookId: string, progress: any) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('book_progress')
      .upsert({
        user_id: userId,
        book_id: bookId,
        ...progress,
        last_accessed: new Date().toISOString()
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  // Activity Logging
  async logActivity(userId: string, action: string, details?: any) {
    const supabase = createClient()
    const { error } = await supabase.from('activity_logs').insert({
      user_id: userId,
      action,
      details: details || null
    })
    if (error) console.error('Failed to log activity:', error)
  },

  // Subscriptions
  async getUserSubscription(userId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString())
      .maybeSingle()
    if (error) throw error
    return data as Subscription | null
  },

  async hasActiveSubscription(userId: string) {
    const subscription = await this.getUserSubscription(userId)
    return !!subscription
  }
}

// Server-side utilities
export const serverDb = {
  async getDashboardStats(): Promise<DashboardStats> {
    const supabase = await createServerClient()
    
    const [
      { data: users },
      { data: purchases },
      { data: caseFiles },
      { data: books },
      { data: courtCases },
      { data: subscriptions }
    ] = await Promise.all([
      supabase.from('profiles').select('role'),
      supabase.from('purchases').select('amount, payment_status, created_at'),
      supabase.from('case_files').select('id'),
      supabase.from('books').select('id'),
      supabase.from('court_cases').select('id'),
      supabase.from('subscriptions').select('status, end_date')
    ])

    const totalUsers = users?.length || 0
    const totalStudents = users?.filter(u => u.role === 'student').length || 0
    const totalLawyers = users?.filter(u => u.role === 'lawyer').length || 0
    const totalAdmins = users?.filter(u => u.role === 'admin').length || 0

    const completedPurchases = purchases?.filter(p => p.payment_status === 'completed') || []
    const totalRevenue = completedPurchases.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    const pendingPayments = purchases?.filter(p => p.payment_status === 'pending').length || 0

    const today = new Date().toISOString().split('T')[0]
    const todayRevenue = completedPurchases
      .filter(p => p.created_at.startsWith(today))
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const weekRevenue = completedPurchases
      .filter(p => p.created_at >= weekAgo)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)

    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const monthRevenue = completedPurchases
      .filter(p => p.created_at >= monthStart)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)

    const activeSubscriptions = subscriptions?.filter(
      s => s.status === 'active' && new Date(s.end_date) > new Date()
    ).length || 0

    return {
      totalUsers,
      totalStudents,
      totalLawyers,
      totalAdmins,
      totalPurchases: purchases?.length || 0,
      totalRevenue,
      totalCaseFiles: caseFiles?.length || 0,
      totalBooks: books?.length || 0,
      totalCourtCases: courtCases?.length || 0,
      pendingPayments,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      activeSubscriptions
    }
  },

  async getAllUsers() {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Profile[]
  },

  async getAllPurchases() {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('purchases')
      .select('*, profiles(email, full_name)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getActivityLogs(limit: number = 100) {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*, profiles(email, full_name)')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data as ActivityLog[]
  }
}
