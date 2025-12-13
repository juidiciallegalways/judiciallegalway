// Export utilities for admin dashboard
import type { CaseFile, Book, CourtCase, Purchase, Profile } from "./database.types"

export const exportUtils = {
  // Convert data to CSV format
  toCSV(data: any[], headers: string[]): string {
    const csvHeaders = headers.join(',')
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Handle arrays and objects
        if (Array.isArray(value)) return `"${value.join('; ')}"`
        if (typeof value === 'object' && value !== null) return `"${JSON.stringify(value)}"`
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value ?? ''
      }).join(',')
    )
    return [csvHeaders, ...csvRows].join('\n')
  },

  // Download CSV file
  downloadCSV(filename: string, csvContent: string) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },

  // Export case files
  exportCaseFiles(caseFiles: CaseFile[]) {
    const headers = [
      'id', 'title', 'case_number', 'court_name', 'category', 'subcategory',
      'year', 'price', 'is_premium', 'is_published', 'total_pages',
      'judge_name', 'petitioner', 'respondent', 'state', 'created_at'
    ]
    const csv = this.toCSV(caseFiles, headers)
    this.downloadCSV(`case-files-${new Date().toISOString().split('T')[0]}.csv`, csv)
  },

  // Export books
  exportBooks(books: Book[]) {
    const headers = [
      'id', 'title', 'author', 'price', 'original_price', 'stock',
      'category', 'isbn', 'publisher', 'pages', 'is_published', 'created_at'
    ]
    const csv = this.toCSV(books, headers)
    this.downloadCSV(`books-${new Date().toISOString().split('T')[0]}.csv`, csv)
  },

  // Export court cases
  exportCourtCases(courtCases: CourtCase[]) {
    const headers = [
      'id', 'case_number', 'case_title', 'court_name', 'court_type',
      'state', 'judge_name', 'status', 'filing_date', 'next_hearing_date',
      'disposal_date', 'created_at'
    ]
    const csv = this.toCSV(courtCases, headers)
    this.downloadCSV(`court-cases-${new Date().toISOString().split('T')[0]}.csv`, csv)
  },

  // Export users
  exportUsers(users: Profile[]) {
    const headers = [
      'id', 'email', 'full_name', 'role', 'phone', 'created_at'
    ]
    const csv = this.toCSV(users, headers)
    this.downloadCSV(`users-${new Date().toISOString().split('T')[0]}.csv`, csv)
  },

  // Export purchases
  exportPurchases(purchases: Purchase[]) {
    const headers = [
      'id', 'user_id', 'item_type', 'item_id', 'amount',
      'payment_status', 'payment_method', 'created_at'
    ]
    const csv = this.toCSV(purchases, headers)
    this.downloadCSV(`purchases-${new Date().toISOString().split('T')[0]}.csv`, csv)
  },

  // Export revenue report
  exportRevenueReport(purchases: Purchase[]) {
    const completed = purchases.filter(p => p.payment_status === 'completed')
    
    // Group by date
    const byDate = completed.reduce((acc, p) => {
      const date = p.created_at.split('T')[0]
      if (!acc[date]) {
        acc[date] = { date, total: 0, count: 0, case_files: 0, books: 0, subscriptions: 0 }
      }
      acc[date].total += Number(p.amount)
      acc[date].count++
      acc[date][p.item_type as 'case_files' | 'books' | 'subscriptions'] += Number(p.amount)
      return acc
    }, {} as Record<string, any>)
    
    const data = Object.values(byDate)
    const headers = ['date', 'total', 'count', 'case_files', 'books', 'subscriptions']
    const csv = this.toCSV(data, headers)
    this.downloadCSV(`revenue-report-${new Date().toISOString().split('T')[0]}.csv`, csv)
  },

  // Export to JSON
  downloadJSON(filename: string, data: any) {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },

  // Generate summary report
  generateSummaryReport(data: {
    users: Profile[]
    caseFiles: CaseFile[]
    books: Book[]
    courtCases: CourtCase[]
    purchases: Purchase[]
  }) {
    const completed = data.purchases.filter(p => p.payment_status === 'completed')
    const totalRevenue = completed.reduce((sum, p) => sum + Number(p.amount), 0)
    
    const report = {
      generated_at: new Date().toISOString(),
      summary: {
        total_users: data.users.length,
        students: data.users.filter(u => u.role === 'student').length,
        lawyers: data.users.filter(u => u.role === 'lawyer').length,
        admins: data.users.filter(u => u.role === 'admin').length,
        total_case_files: data.caseFiles.length,
        published_case_files: data.caseFiles.filter(cf => cf.is_published).length,
        total_books: data.books.length,
        published_books: data.books.filter(b => b.is_published).length,
        total_court_cases: data.courtCases.length,
        total_purchases: data.purchases.length,
        completed_purchases: completed.length,
        total_revenue: totalRevenue,
        average_order_value: completed.length > 0 ? totalRevenue / completed.length : 0
      },
      revenue_by_type: {
        case_files: completed.filter(p => p.item_type === 'case_file').reduce((sum, p) => sum + Number(p.amount), 0),
        books: completed.filter(p => p.item_type === 'book').reduce((sum, p) => sum + Number(p.amount), 0),
        subscriptions: completed.filter(p => p.item_type === 'subscription').reduce((sum, p) => sum + Number(p.amount), 0)
      },
      court_cases_by_status: {
        pending: data.courtCases.filter(cc => cc.status === 'pending').length,
        hearing_today: data.courtCases.filter(cc => cc.status === 'hearing_today').length,
        disposed: data.courtCases.filter(cc => cc.status === 'disposed').length,
        adjourned: data.courtCases.filter(cc => cc.status === 'adjourned').length
      }
    }
    
    this.downloadJSON(`summary-report-${new Date().toISOString().split('T')[0]}.json`, report)
  }
}

// Export individual functions
export const {
  toCSV,
  downloadCSV,
  exportCaseFiles,
  exportBooks,
  exportCourtCases,
  exportUsers,
  exportPurchases,
  exportRevenueReport,
  downloadJSON,
  generateSummaryReport
} = exportUtils
