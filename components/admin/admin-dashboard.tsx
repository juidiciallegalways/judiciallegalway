"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"
import { 
  Loader2, FileText, Trash2, RefreshCw, BookOpen, Scale, Users, 
  ShoppingBag, TrendingUp, Eye, Edit, Plus, Download, Search,
  Calendar, DollarSign, Activity, BarChart3, PieChart, ArrowUpRight,
  ArrowDownRight, Clock, CheckCircle, XCircle, AlertCircle
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

// Types matching database schema
type UserRole = 'student' | 'lawyer' | 'admin'
type CaseStatus = 'pending' | 'hearing_today' | 'disposed' | 'adjourned'
type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  phone: string | null
  created_at: string
}

interface CaseFile {
  id: string
  title: string
  description: string | null
  case_number: string | null
  court_name: string | null
  category: string
  price: number
  is_published: boolean
  is_premium: boolean
  total_pages: number
  created_at: string
}

interface Book {
  id: string
  title: string
  author: string
  price: number
  stock: number
  is_published: boolean
  category: string | null
  created_at: string
}

interface CourtCase {
  id: string
  case_number: string
  case_title: string
  court_name: string
  state: string
  status: CaseStatus
  next_hearing_date: string | null
  created_at: string
}

interface Purchase {
  id: string
  user_id: string
  item_type: string
  amount: number
  payment_status: PaymentStatus
  created_at: string
}

export function AdminDashboard() {
  const supabase = createClient()
  const { isAdmin, isLoading: authLoading } = useAuth()
  
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  
  // File states
  const [file, setFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  
  // Data states
  const [caseFiles, setCaseFiles] = useState<CaseFile[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [courtCases, setCourtCases] = useState<CourtCase[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [activityLogs, setActivityLogs] = useState<any[]>([])
  
  // Search states
  const [userSearch, setUserSearch] = useState("")
  const [caseFileSearch, setCaseFileSearch] = useState("")
  const [bookSearch, setBookSearch] = useState("")
  
  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalLawyers: 0,
    totalAdmins: 0,
    totalPurchases: 0,
    totalRevenue: 0,
    totalCaseFiles: 0,
    totalBooks: 0,
    totalCourtCases: 0,
    pendingPayments: 0,
    todayRevenue: 0,
    monthRevenue: 0
  })

  // Form states
  const [libForm, setLibForm] = useState({
    title: "", description: "", caseNumber: "", courtName: "", 
    category: "constitutional", subcategory: "", year: new Date().getFullYear(), 
    price: "0", totalPages: "10", isPremium: false, tags: "",
    judgeName: "", petitioner: "", respondent: "", advocates: "",
    caseSummary: "", keyPoints: "", judgmentDate: "", bench: "", state: ""
  })
  
  const [bookForm, setBookForm] = useState({
    title: "", author: "", description: "", price: "0", originalPrice: "0", 
    stock: "100", category: "law_notes", isbn: "", publisher: "", pages: "200"
  })

  const [courtForm, setCourtForm] = useState({
    caseNumber: "", caseTitle: "", petitioner: "", respondent: "", 
    courtName: "Supreme Court of India", courtType: "Supreme Court", 
    state: "Delhi", judgeName: "", status: "pending" as CaseStatus, 
    nextHearing: "", advocates: "", caseSummary: ""
  })

  // Fetch all data
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [cfRes, bRes, ccRes, uRes, pRes, alRes] = await Promise.all([
        supabase.from('case_files').select('*').order('created_at', { ascending: false }),
        supabase.from('books').select('*').order('created_at', { ascending: false }),
        supabase.from('court_cases').select('*').order('updated_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('purchases').select('*').order('created_at', { ascending: false }),
        supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(100)
      ])
      
      if (cfRes.data) setCaseFiles(cfRes.data)
      if (bRes.data) setBooks(bRes.data)
      if (ccRes.data) setCourtCases(ccRes.data)
      if (uRes.data) {
        setUsers(uRes.data)
        const students = uRes.data.filter((u: Profile) => u.role === 'student').length
        const lawyers = uRes.data.filter((u: Profile) => u.role === 'lawyer').length
        const admins = uRes.data.filter((u: Profile) => u.role === 'admin').length
        setStats(prev => ({ ...prev, totalUsers: uRes.data.length, totalStudents: students, totalLawyers: lawyers, totalAdmins: admins }))
      }
      if (pRes.data) {
        setPurchases(pRes.data)
        const completed = pRes.data.filter((p: Purchase) => p.payment_status === 'completed')
        const revenue = completed.reduce((sum: number, p: Purchase) => sum + Number(p.amount || 0), 0)
        const pending = pRes.data.filter((p: Purchase) => p.payment_status === 'pending').length
        
        // Today's revenue
        const today = new Date().toISOString().split('T')[0]
        const todayRevenue = completed
          .filter((p: Purchase) => p.created_at.startsWith(today))
          .reduce((sum: number, p: Purchase) => sum + Number(p.amount || 0), 0)
        
        // This month's revenue
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
        const monthRevenue = completed
          .filter((p: Purchase) => p.created_at >= monthStart)
          .reduce((sum: number, p: Purchase) => sum + Number(p.amount || 0), 0)
        
        setStats(prev => ({ 
          ...prev, 
          totalPurchases: pRes.data.length, 
          totalRevenue: revenue,
          pendingPayments: pending,
          todayRevenue,
          monthRevenue
        }))
      }
      if (alRes.data) setActivityLogs(alRes.data)
      
      setStats(prev => ({
        ...prev,
        totalCaseFiles: cfRes.data?.length || 0,
        totalBooks: bRes.data?.length || 0,
        totalCourtCases: ccRes.data?.length || 0
      }))
    } catch (error: any) {
      toast.error("Failed to fetch data: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (isAdmin && !authLoading) {
      fetchData()
    }
  }, [isAdmin, authLoading, fetchData])

  // Upload file to storage
  const uploadFile = async (file: File, folder: string = 'case-files') => {
    try {
      const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`
      console.log('Uploading file:', fileName, 'to folder:', folder)
      
      // Try protected_files bucket first, fallback to public bucket
      let { data, error } = await supabase.storage
        .from('protected_files')
        .upload(`${folder}/${fileName}`, file)
      
      if (error && error.message.includes('not found')) {
        console.log('Protected bucket not found, trying public bucket...')
        const result = await supabase.storage
          .from('public')
          .upload(`${folder}/${fileName}`, file)
        data = result.data
        error = result.error
      }
      
      if (error) {
        console.error('File upload error:', error)
        throw new Error(`File upload failed: ${error.message}`)
      }
      
      console.log('File uploaded successfully:', data)
      return `${folder}/${fileName}`
    } catch (error: any) {
      console.error('Upload file error:', error)
      throw error
    }
  }

  // Upload image
  const uploadImage = async (file: File, folder: string = 'thumbnails') => {
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image')
      }
      
      const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`
      console.log('Uploading image:', fileName, 'to folder:', folder)
      
      // Try protected_files bucket first, fallback to public bucket
      let { data, error } = await supabase.storage
        .from('protected_files')
        .upload(`${folder}/${fileName}`, file)
      
      let bucketName = 'protected_files'
      if (error && error.message.includes('not found')) {
        console.log('Protected bucket not found, trying public bucket...')
        const result = await supabase.storage
          .from('public')
          .upload(`${folder}/${fileName}`, file)
        data = result.data
        error = result.error
        bucketName = 'public'
      }
      
      if (error) {
        console.error('Image upload error:', error)
        throw new Error(`Image upload failed: ${error.message}`)
      }
      
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(`${folder}/${fileName}`)
      
      console.log('Image uploaded successfully, public URL:', publicUrlData.publicUrl)
      return publicUrlData.publicUrl
    } catch (error: any) {
      console.error('Upload image error:', error)
      throw error
    }
  }
  // Handle Case File Upload
  const handleCaseFileUpload = async () => {
    if (!file || !libForm.title || !libForm.category) {
      return toast.error("File, Title & Category are required")
    }
    
    setUploading(true)
    console.log('Starting case file upload...')
    
    try {
      // Upload main file
      console.log('Uploading main file...')
      const filePath = await uploadFile(file, 'case-files')
      console.log('Main file uploaded:', filePath)
      
      // Upload thumbnail if provided
      let thumbnailUrl = "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800"
      if (thumbnailFile) {
        console.log('Uploading thumbnail...')
        thumbnailUrl = await uploadImage(thumbnailFile, 'thumbnails')
        console.log('Thumbnail uploaded:', thumbnailUrl)
      }
      
      // Insert into database
      console.log('Inserting into database...')
      const { data, error } = await supabase.from('case_files').insert({
        title: libForm.title,
        description: libForm.description || null,
        case_number: libForm.caseNumber || null,
        court_name: libForm.courtName || null,
        category: libForm.category,
        subcategory: libForm.subcategory || null,
        year: Number(libForm.year),
        price: Number(libForm.price),
        is_premium: libForm.isPremium,
        total_pages: Number(libForm.totalPages),
        tags: libForm.tags ? libForm.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
        file_url: filePath,
        is_published: true,
        thumbnail_url: thumbnailUrl,
        judge_name: libForm.judgeName || null,
        petitioner: libForm.petitioner || null,
        respondent: libForm.respondent || null,
        advocate_names: libForm.advocates ? libForm.advocates.split(',').map(s => s.trim()).filter(Boolean) : [],
        case_summary: libForm.caseSummary || null,
        key_points: libForm.keyPoints ? libForm.keyPoints.split(',').map(s => s.trim()).filter(Boolean) : [],
        judgment_date: libForm.judgmentDate || null,
        bench: libForm.bench || null,
        state: libForm.state || null
      }).select()
      
      if (error) {
        console.error('Database insert error:', error)
        throw new Error(`Database error: ${error.message}`)
      }
      
      console.log('Case file inserted successfully:', data)
      toast.success("Case File Published!")
      
      // Reset form
      setFile(null)
      setThumbnailFile(null)
      setLibForm({
        title: "", description: "", caseNumber: "", courtName: "", 
        category: "constitutional", subcategory: "", year: new Date().getFullYear(), 
        price: "0", totalPages: "10", isPremium: false, tags: "",
        judgeName: "", petitioner: "", respondent: "", advocates: "",
        caseSummary: "", keyPoints: "", judgmentDate: "", bench: "", state: ""
      })
      
      // Refresh data
      fetchData()
      
    } catch (error: any) {
      console.error('Case file upload failed:', error)
      toast.error(`Upload failed: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  // Handle Book Upload
  const handleBookUpload = async () => {
    if (!file || !bookForm.title || !bookForm.author) {
      return toast.error("File, Title & Author are required")
    }
    setUploading(true)
    try {
      const filePath = await uploadFile(file, 'books')
      let coverUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800"
      if (coverFile) coverUrl = await uploadImage(coverFile, 'covers')
      
      const { error } = await supabase.from('books').insert({
        title: bookForm.title,
        author: bookForm.author,
        description: bookForm.description || null,
        price: Number(bookForm.price),
        original_price: Number(bookForm.originalPrice) || null,
        stock: Number(bookForm.stock),
        category: bookForm.category || null,
        isbn: bookForm.isbn || null,
        publisher: bookForm.publisher || null,
        pages: Number(bookForm.pages) || null,
        file_url: filePath,
        is_published: true,
        cover_url: coverUrl
      })
      
      if (error) throw error
      toast.success("Book Published!")
      setFile(null)
      setCoverFile(null)
      setBookForm({
        title: "", author: "", description: "", price: "0", originalPrice: "0", 
        stock: "100", category: "law_notes", isbn: "", publisher: "", pages: "200"
      })
      fetchData()
    } catch (e: any) { 
      toast.error(e.message) 
    } finally { 
      setUploading(false) 
    }
  }

  // Handle Court Case Creation
  const handleCourtCaseCreate = async () => {
    if (!courtForm.caseNumber || !courtForm.caseTitle) {
      return toast.error("Case Number & Title are required")
    }
    setUploading(true)
    try {
      const { error } = await supabase.from('court_cases').insert({
        case_number: courtForm.caseNumber,
        case_title: courtForm.caseTitle,
        party_names: [courtForm.petitioner, courtForm.respondent].filter(Boolean),
        advocate_names: courtForm.advocates ? courtForm.advocates.split(',').map(s => s.trim()).filter(Boolean) : [],
        court_name: courtForm.courtName,
        court_type: courtForm.courtType || null,
        state: courtForm.state,
        judge_name: courtForm.judgeName || null,
        status: courtForm.status,
        next_hearing_date: courtForm.nextHearing || null,
        case_summary: courtForm.caseSummary || null,
        filing_date: new Date().toISOString().split('T')[0]
      })
      
      if (error) throw error
      toast.success("Court Case Added!")
      setCourtForm({
        caseNumber: "", caseTitle: "", petitioner: "", respondent: "", 
        courtName: "Supreme Court of India", courtType: "Supreme Court", 
        state: "Delhi", judgeName: "", status: "pending", 
        nextHearing: "", advocates: "", caseSummary: ""
      })
      fetchData()
    } catch (e: any) { 
      toast.error(e.message) 
    } finally { 
      setUploading(false) 
    }
  }

  // Delete item
  const deleteItem = async (table: string, id: string) => {
    if (!confirm("Delete this item?")) return
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) {
      toast.error("Delete failed: " + error.message)
    } else {
      toast.success("Deleted successfully")
      fetchData()
    }
  }

  // Update user role
  const updateUserRole = async (userId: string, newRole: UserRole) => {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    if (error) {
      toast.error("Update failed: " + error.message)
    } else {
      toast.success("Role updated")
      fetchData()
    }
  }

  // Toggle publish status
  const togglePublishStatus = async (table: string, id: string, currentStatus: boolean) => {
    const { error } = await supabase.from(table).update({ is_published: !currentStatus }).eq('id', id)
    if (error) {
      toast.error("Update failed: " + error.message)
    } else {
      toast.success(currentStatus ? "Unpublished" : "Published")
      fetchData()
    }
  }

  // Filter functions
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(userSearch.toLowerCase()))
  )

  const filteredCaseFiles = caseFiles.filter(cf => 
    cf.title.toLowerCase().includes(caseFileSearch.toLowerCase()) ||
    (cf.case_number && cf.case_number.toLowerCase().includes(caseFileSearch.toLowerCase()))
  )

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
    book.author.toLowerCase().includes(bookSearch.toLowerCase())
  )

  if (authLoading) {
    return (
      <div className="container mx-auto py-20 text-center">
        <Loader2 className="animate-spin mx-auto h-8 w-8 mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-20 text-center">
        <AlertCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You need admin privileges to access this page.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-20 text-center">
        <Loader2 className="animate-spin mx-auto h-8 w-8 mb-4" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your legal platform</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="case-files">Case Files</TabsTrigger>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="court-cases">Court Cases</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Total Users</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <div className="text-xs text-muted-foreground mt-1">
                  {stats.totalStudents} Students, {stats.totalLawyers} Lawyers, {stats.totalAdmins} Admins
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Total Revenue</span>
                </div>
                <p className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</p>
                <div className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  ₹{stats.monthRevenue.toFixed(2)} this month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag className="h-5 w-5 text-purple-500" />
                  <span className="text-sm text-muted-foreground">Purchases</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalPurchases}</p>
                <div className="text-xs text-muted-foreground mt-1">
                  {stats.pendingPayments} pending
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-orange-500" />
                  <span className="text-sm text-muted-foreground">Case Files</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalCaseFiles}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-indigo-500" />
                  <span className="text-sm text-muted-foreground">Books</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalBooks}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="h-5 w-5 text-red-500" />
                  <span className="text-sm text-muted-foreground">Court Cases</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalCourtCases}</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {activityLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="flex-1">{log.action}</span>
                      <span className="text-muted-foreground text-xs">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Today's Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  ₹{stats.todayRevenue.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  From {purchases.filter(p => p.created_at.startsWith(new Date().toISOString().split('T')[0]) && p.payment_status === 'completed').length} transactions today
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        {/* CASE FILES TAB */}
        <TabsContent value="case-files" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Case Files Management</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Case File
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Case File</DialogTitle>
                  <DialogDescription>Upload a new legal case file to the platform</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={libForm.title}
                        onChange={(e) => setLibForm({...libForm, title: e.target.value})}
                        placeholder="Case title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="caseNumber">Case Number</Label>
                      <Input
                        id="caseNumber"
                        value={libForm.caseNumber}
                        onChange={(e) => setLibForm({...libForm, caseNumber: e.target.value})}
                        placeholder="e.g., AIR 2023 SC 1234"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={libForm.description}
                      onChange={(e) => setLibForm({...libForm, description: e.target.value})}
                      placeholder="Case description and summary"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={libForm.category} onValueChange={(v) => setLibForm({...libForm, category: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="criminal">Criminal Law</SelectItem>
                          <SelectItem value="civil">Civil Law</SelectItem>
                          <SelectItem value="constitutional">Constitutional Law</SelectItem>
                          <SelectItem value="family">Family Law</SelectItem>
                          <SelectItem value="property">Property Law</SelectItem>
                          <SelectItem value="corporate">Corporate Law</SelectItem>
                          <SelectItem value="tax">Tax Law</SelectItem>
                          <SelectItem value="labor">Labor Law</SelectItem>
                          <SelectItem value="ipr">IPR</SelectItem>
                          <SelectItem value="environmental">Environmental Law</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="subcategory">Subcategory</Label>
                      <Input
                        id="subcategory"
                        value={libForm.subcategory}
                        onChange={(e) => setLibForm({...libForm, subcategory: e.target.value})}
                        placeholder="Subcategory"
                      />
                    </div>
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        value={libForm.year}
                        onChange={(e) => setLibForm({...libForm, year: Number(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={libForm.price}
                        onChange={(e) => setLibForm({...libForm, price: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="totalPages">Total Pages</Label>
                      <Input
                        id="totalPages"
                        type="number"
                        value={libForm.totalPages}
                        onChange={(e) => setLibForm({...libForm, totalPages: e.target.value})}
                        placeholder="10"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        id="isPremium"
                        checked={libForm.isPremium}
                        onCheckedChange={(checked) => setLibForm({...libForm, isPremium: checked})}
                      />
                      <Label htmlFor="isPremium">Premium Content</Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={libForm.tags}
                      onChange={(e) => setLibForm({...libForm, tags: e.target.value})}
                      placeholder="landmark, supreme-court, constitutional-law"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="file">PDF File *</Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="thumbnail">Thumbnail Image</Label>
                      <Input
                        id="thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>

                  <Button onClick={handleCaseFileUpload} disabled={uploading} className="w-full">
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Publish Case File
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search case files..."
                value={caseFileSearch}
                onChange={(e) => setCaseFileSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Case Number</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCaseFiles.map((caseFile) => (
                    <TableRow key={caseFile.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {caseFile.title}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {caseFile.case_number || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{caseFile.category}</Badge>
                      </TableCell>
                      <TableCell>₹{caseFile.price}</TableCell>
                      <TableCell>
                        <Badge variant={caseFile.is_published ? "default" : "secondary"}>
                          {caseFile.is_published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(caseFile.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => togglePublishStatus('case_files', caseFile.id, caseFile.is_published)}
                          >
                            {caseFile.is_published ? <Eye className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteItem('case_files', caseFile.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        {/* BOOKS TAB */}
        <TabsContent value="books" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Books Management</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Book
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Book</DialogTitle>
                  <DialogDescription>Add a new book to the store</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bookTitle">Title *</Label>
                      <Input
                        id="bookTitle"
                        value={bookForm.title}
                        onChange={(e) => setBookForm({...bookForm, title: e.target.value})}
                        placeholder="Book title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="author">Author *</Label>
                      <Input
                        id="author"
                        value={bookForm.author}
                        onChange={(e) => setBookForm({...bookForm, author: e.target.value})}
                        placeholder="Author name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bookDescription">Description</Label>
                    <Textarea
                      id="bookDescription"
                      value={bookForm.description}
                      onChange={(e) => setBookForm({...bookForm, description: e.target.value})}
                      placeholder="Book description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="bookPrice">Price (₹) *</Label>
                      <Input
                        id="bookPrice"
                        type="number"
                        value={bookForm.price}
                        onChange={(e) => setBookForm({...bookForm, price: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="originalPrice">Original Price (₹)</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        value={bookForm.originalPrice}
                        onChange={(e) => setBookForm({...bookForm, originalPrice: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock">Stock</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={bookForm.stock}
                        onChange={(e) => setBookForm({...bookForm, stock: e.target.value})}
                        placeholder="100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="bookCategory">Category</Label>
                      <Select value={bookForm.category} onValueChange={(v) => setBookForm({...bookForm, category: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="law_notes">Law Notes</SelectItem>
                          <SelectItem value="criminal_law">Criminal Law</SelectItem>
                          <SelectItem value="civil_law">Civil Law</SelectItem>
                          <SelectItem value="constitutional_law">Constitutional Law</SelectItem>
                          <SelectItem value="evidence_law">Evidence Law</SelectItem>
                          <SelectItem value="bundle">Bundle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="isbn">ISBN</Label>
                      <Input
                        id="isbn"
                        value={bookForm.isbn}
                        onChange={(e) => setBookForm({...bookForm, isbn: e.target.value})}
                        placeholder="ISBN number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pages">Pages</Label>
                      <Input
                        id="pages"
                        type="number"
                        value={bookForm.pages}
                        onChange={(e) => setBookForm({...bookForm, pages: e.target.value})}
                        placeholder="200"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="publisher">Publisher</Label>
                    <Input
                      id="publisher"
                      value={bookForm.publisher}
                      onChange={(e) => setBookForm({...bookForm, publisher: e.target.value})}
                      placeholder="Publisher name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bookFile">PDF File *</Label>
                      <Input
                        id="bookFile"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cover">Cover Image</Label>
                      <Input
                        id="cover"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>

                  <Button onClick={handleBookUpload} disabled={uploading} className="w-full">
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Publish Book
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search books..."
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBooks.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {book.title}
                      </TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{book.category || 'General'}</Badge>
                      </TableCell>
                      <TableCell>₹{book.price}</TableCell>
                      <TableCell>{book.stock}</TableCell>
                      <TableCell>
                        <Badge variant={book.is_published ? "default" : "secondary"}>
                          {book.is_published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => togglePublishStatus('books', book.id, book.is_published)}
                          >
                            {book.is_published ? <Eye className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteItem('books', book.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        {/* COURT CASES TAB */}
        <TabsContent value="court-cases" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Court Cases Management</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Court Case
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Court Case</DialogTitle>
                  <DialogDescription>Add a new court case to the tracker</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="courtCaseNumber">Case Number *</Label>
                      <Input
                        id="courtCaseNumber"
                        value={courtForm.caseNumber}
                        onChange={(e) => setCourtForm({...courtForm, caseNumber: e.target.value})}
                        placeholder="e.g., CRL.A. 123/2024"
                      />
                    </div>
                    <div>
                      <Label htmlFor="courtCaseTitle">Case Title *</Label>
                      <Input
                        id="courtCaseTitle"
                        value={courtForm.caseTitle}
                        onChange={(e) => setCourtForm({...courtForm, caseTitle: e.target.value})}
                        placeholder="Case title"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="petitioner">Petitioner</Label>
                      <Input
                        id="petitioner"
                        value={courtForm.petitioner}
                        onChange={(e) => setCourtForm({...courtForm, petitioner: e.target.value})}
                        placeholder="Petitioner name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="respondent">Respondent</Label>
                      <Input
                        id="respondent"
                        value={courtForm.respondent}
                        onChange={(e) => setCourtForm({...courtForm, respondent: e.target.value})}
                        placeholder="Respondent name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="courtName">Court Name</Label>
                      <Input
                        id="courtName"
                        value={courtForm.courtName}
                        onChange={(e) => setCourtForm({...courtForm, courtName: e.target.value})}
                        placeholder="Court name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="courtType">Court Type</Label>
                      <Select value={courtForm.courtType} onValueChange={(v) => setCourtForm({...courtForm, courtType: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Supreme Court">Supreme Court</SelectItem>
                          <SelectItem value="High Court">High Court</SelectItem>
                          <SelectItem value="District Court">District Court</SelectItem>
                          <SelectItem value="Sessions Court">Sessions Court</SelectItem>
                          <SelectItem value="Magistrate Court">Magistrate Court</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={courtForm.state}
                        onChange={(e) => setCourtForm({...courtForm, state: e.target.value})}
                        placeholder="State"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="judgeName">Judge Name</Label>
                      <Input
                        id="judgeName"
                        value={courtForm.judgeName}
                        onChange={(e) => setCourtForm({...courtForm, judgeName: e.target.value})}
                        placeholder="Judge name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={courtForm.status} onValueChange={(v) => setCourtForm({...courtForm, status: v as CaseStatus})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="hearing_today">Hearing Today</SelectItem>
                          <SelectItem value="disposed">Disposed</SelectItem>
                          <SelectItem value="adjourned">Adjourned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nextHearing">Next Hearing Date</Label>
                      <Input
                        id="nextHearing"
                        type="date"
                        value={courtForm.nextHearing}
                        onChange={(e) => setCourtForm({...courtForm, nextHearing: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="advocates">Advocates (comma separated)</Label>
                      <Input
                        id="advocates"
                        value={courtForm.advocates}
                        onChange={(e) => setCourtForm({...courtForm, advocates: e.target.value})}
                        placeholder="Advocate 1, Advocate 2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="caseSummary">Case Summary</Label>
                    <Textarea
                      id="caseSummary"
                      value={courtForm.caseSummary}
                      onChange={(e) => setCourtForm({...courtForm, caseSummary: e.target.value})}
                      placeholder="Brief case summary"
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleCourtCaseCreate} disabled={uploading} className="w-full">
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Court Case
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case Number</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Court</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Hearing</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courtCases.map((courtCase) => (
                    <TableRow key={courtCase.id}>
                      <TableCell className="font-mono text-xs">
                        {courtCase.case_number}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {courtCase.case_title}
                      </TableCell>
                      <TableCell>{courtCase.court_name}</TableCell>
                      <TableCell>{courtCase.state}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            courtCase.status === 'hearing_today' ? 'destructive' :
                            courtCase.status === 'disposed' ? 'default' :
                            courtCase.status === 'adjourned' ? 'secondary' : 'outline'
                          }
                        >
                          {courtCase.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {courtCase.next_hearing_date ? 
                          new Date(courtCase.next_hearing_date).toLocaleDateString() : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteItem('court_cases', courtCase.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        {/* USERS TAB */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Users Management</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Students</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Lawyers</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalLawyers}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  <span className="text-sm text-muted-foreground">Admins</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalAdmins}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.full_name || 'N/A'}</TableCell>
                      <TableCell>
                        <Select 
                          value={user.role} 
                          onValueChange={(value: UserRole) => updateUserRole(user.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="lawyer">Lawyer</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{user.phone || 'N/A'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteItem('profiles', user.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PURCHASES TAB */}
        <TabsContent value="purchases" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Purchases Management</h2>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Total Purchases</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalPurchases}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Total Revenue</span>
                </div>
                <p className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <span className="text-sm text-muted-foreground">Pending</span>
                </div>
                <p className="text-2xl font-bold">{stats.pendingPayments}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  <span className="text-sm text-muted-foreground">Today</span>
                </div>
                <p className="text-2xl font-bold">₹{stats.todayRevenue.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Item Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.slice(0, 50).map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-mono text-xs">
                        {purchase.user_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{purchase.item_type}</Badge>
                      </TableCell>
                      <TableCell>₹{purchase.amount}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            purchase.payment_status === 'completed' ? 'default' :
                            purchase.payment_status === 'pending' ? 'secondary' :
                            purchase.payment_status === 'failed' ? 'destructive' : 'outline'
                          }
                        >
                          {purchase.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(purchase.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-2xl font-bold">Analytics & Reports</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Today</span>
                    <span className="font-bold">₹{stats.todayRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>This Month</span>
                    <span className="font-bold">₹{stats.monthRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total</span>
                    <span className="font-bold">₹{stats.totalRevenue.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  User Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Students</span>
                    <span className="font-bold">{stats.totalStudents}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Lawyers</span>
                    <span className="font-bold">{stats.totalLawyers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Admins</span>
                    <span className="font-bold">{stats.totalAdmins}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ACTIVITY TAB */}
        <TabsContent value="activity" className="space-y-6">
          <h2 className="text-2xl font-bold">Activity Logs</h2>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">
                        {log.user_id?.substring(0, 8)}...
                      </TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.ip_address || 'N/A'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {log.device_info || 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}