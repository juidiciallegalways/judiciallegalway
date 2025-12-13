// Admin utility functions for common operations
import { createClient } from "@/lib/supabase/client"
import type { UserRole, CaseStatus, PaymentStatus } from "./database.types"

export const adminUtils = {
  // User Management
  async updateUserRole(userId: string, newRole: UserRole) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteUser(userId: string) {
    const supabase = createClient()
    // Note: This will cascade delete all user data due to foreign key constraints
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)
    
    if (error) throw error
  },

  async getUserStats(userId: string) {
    const supabase = createClient()
    
    const [purchases, caseProgress, bookProgress, savedCases] = await Promise.all([
      supabase.from('purchases').select('*').eq('user_id', userId).eq('payment_status', 'completed'),
      supabase.from('case_file_progress').select('*').eq('user_id', userId),
      supabase.from('book_progress').select('*').eq('user_id', userId),
      supabase.from('saved_cases').select('*').eq('user_id', userId)
    ])

    return {
      totalPurchases: purchases.data?.length || 0,
      totalSpent: purchases.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0,
      caseFilesRead: caseProgress.data?.length || 0,
      booksRead: bookProgress.data?.length || 0,
      savedCases: savedCases.data?.length || 0
    }
  },

  // Content Management
  async togglePublishStatus(table: 'case_files' | 'books', id: string) {
    const supabase = createClient()
    
    // Get current status
    const { data: current } = await supabase
      .from(table)
      .select('is_published')
      .eq('id', id)
      .single()
    
    if (!current) throw new Error('Item not found')
    
    // Toggle status
    const { data, error } = await supabase
      .from(table)
      .update({ is_published: !current.is_published })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteContent(table: 'case_files' | 'books' | 'court_cases', id: string) {
    const supabase = createClient()
    
    // Get file URLs before deleting
    if (table === 'case_files' || table === 'books') {
      const { data } = await supabase
        .from(table)
        .select('file_url, thumbnail_url, cover_url')
        .eq('id', id)
        .single()
      
      // Delete from storage
      if (data?.file_url) {
        await supabase.storage.from('protected_files').remove([data.file_url])
      }
      if (data?.thumbnail_url) {
        await supabase.storage.from('protected_files').remove([data.thumbnail_url])
      }
      if (data?.cover_url) {
        await supabase.storage.from('protected_files').remove([data.cover_url])
      }
    }
    
    // Delete from database
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async bulkPublish(table: 'case_files' | 'books', ids: string[], publish: boolean) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from(table)
      .update({ is_published: publish })
      .in('id', ids)
      .select()
    
    if (error) throw error
    return data
  },

  async bulkDelete(table: 'case_files' | 'books' | 'court_cases', ids: string[]) {
    const supabase = createClient()
    const { error } = await supabase
      .from(table)
      .delete()
      .in('id', ids)
    
    if (error) throw error
  },

  // Purchase Management
  async updatePaymentStatus(purchaseId: string, status: PaymentStatus) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('purchases')
      .update({ payment_status: status })
      .eq('id', purchaseId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async refundPurchase(purchaseId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('purchases')
      .update({ 
        payment_status: 'refunded',
        transaction_details: {
          refunded_at: new Date().toISOString()
        }
      })
      .eq('id', purchaseId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getPurchaseDetails(purchaseId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        profiles (email, full_name),
        case_files (title),
        books (title)
      `)
      .eq('id', purchaseId)
      .single()
    
    if (error) throw error
    return data
  },

  // Court Case Management
  async updateCourtCaseStatus(caseId: string, status: CaseStatus, nextHearingDate?: string) {
    const supabase = createClient()
    const updates: any = { status }
    if (nextHearingDate) updates.next_hearing_date = nextHearingDate
    
    const { data, error } = await supabase
      .from('court_cases')
      .update(updates)
      .eq('id', caseId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async bulkUpdateCourtCaseStatus(caseIds: string[], status: CaseStatus) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('court_cases')
      .update({ status })
      .in('id', caseIds)
      .select()
    
    if (error) throw error
    return data
  },

  // Analytics
  async getRevenueByPeriod(startDate: string, endDate: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('purchases')
      .select('amount, created_at, item_type')
      .eq('payment_status', 'completed')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
    
    if (error) throw error
    
    const total = data.reduce((sum, p) => sum + Number(p.amount), 0)
    const byType = data.reduce((acc, p) => {
      acc[p.item_type] = (acc[p.item_type] || 0) + Number(p.amount)
      return acc
    }, {} as Record<string, number>)
    
    return { total, byType, transactions: data.length }
  },

  async getTopSellingContent(limit: number = 10) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('purchases')
      .select('item_id, item_type')
      .eq('payment_status', 'completed')
    
    if (error) throw error
    
    // Count occurrences
    const counts = data.reduce((acc, p) => {
      const key = `${p.item_type}:${p.item_id}`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Sort and get top items
    const sorted = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
    
    return sorted.map(([key, count]) => {
      const [type, id] = key.split(':')
      return { item_type: type, item_id: id, sales_count: count }
    })
  },

  async getUserGrowth(days: number = 30) {
    const supabase = createClient()
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('created_at, role')
      .gte('created_at', startDate)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    
    // Group by date
    const byDate = data.reduce((acc, user) => {
      const date = user.created_at.split('T')[0]
      if (!acc[date]) acc[date] = { total: 0, students: 0, lawyers: 0, admins: 0 }
      acc[date].total++
      acc[date][`${user.role}s` as 'students' | 'lawyers' | 'admins']++
      return acc
    }, {} as Record<string, any>)
    
    return byDate
  },

  // Activity Logging
  async logAdminAction(userId: string, action: string, details?: any) {
    const supabase = createClient()
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        action: `ADMIN: ${action}`,
        details: details || null
      })
    
    if (error) console.error('Failed to log admin action:', error)
  },

  // Storage Management
  async getStorageUsage() {
    const supabase = createClient()
    const { data, error } = await supabase
      .storage
      .from('protected_files')
      .list()
    
    if (error) throw error
    
    const totalSize = data.reduce((sum, file) => sum + (file.metadata?.size || 0), 0)
    const fileCount = data.length
    
    return {
      totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      fileCount
    }
  },

  async cleanupOrphanedFiles() {
    const supabase = createClient()
    
    // Get all file URLs from database
    const [caseFiles, books] = await Promise.all([
      supabase.from('case_files').select('file_url, thumbnail_url'),
      supabase.from('books').select('file_url, cover_url')
    ])
    
    const usedFiles = new Set<string>()
    caseFiles.data?.forEach(cf => {
      if (cf.file_url) usedFiles.add(cf.file_url)
      if (cf.thumbnail_url) usedFiles.add(cf.thumbnail_url)
    })
    books.data?.forEach(b => {
      if (b.file_url) usedFiles.add(b.file_url)
      if (b.cover_url) usedFiles.add(b.cover_url)
    })
    
    // Get all files in storage
    const { data: storageFiles } = await supabase
      .storage
      .from('protected_files')
      .list()
    
    // Find orphaned files
    const orphaned = storageFiles?.filter(file => 
      !usedFiles.has(file.name)
    ) || []
    
    return orphaned
  },

  // Subscription Management
  async createSubscription(userId: string, planType: 'monthly' | 'quarterly' | 'yearly', amount: number) {
    const supabase = createClient()
    
    const duration = {
      monthly: 30,
      quarterly: 90,
      yearly: 365
    }
    
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + duration[planType])
    
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_type: planType,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
        amount,
        auto_renew: false
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async cancelSubscription(subscriptionId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled', auto_renew: false })
      .eq('id', subscriptionId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getExpiredSubscriptions() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, profiles(email, full_name)')
      .eq('status', 'active')
      .lt('end_date', new Date().toISOString())
    
    if (error) throw error
    return data
  }
}

// Export individual functions for convenience
export const {
  updateUserRole,
  deleteUser,
  getUserStats,
  togglePublishStatus,
  deleteContent,
  bulkPublish,
  bulkDelete,
  updatePaymentStatus,
  refundPurchase,
  getPurchaseDetails,
  updateCourtCaseStatus,
  bulkUpdateCourtCaseStatus,
  getRevenueByPeriod,
  getTopSellingContent,
  getUserGrowth,
  logAdminAction,
  getStorageUsage,
  cleanupOrphanedFiles,
  createSubscription,
  cancelSubscription,
  getExpiredSubscriptions
} = adminUtils
