"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, UploadCloud, FileText, Trash2, RefreshCw, BookOpen, Scale, Users, ShoppingBag, Activity, CreditCard, TrendingUp } from "lucide-react"

export function AdminDashboard() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState("library")
  const [isLoading, setIsLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Data
  const [caseFiles, setCaseFiles] = useState<any[]>([])
  const [books, setBooks] = useState<any[]>([])
  const [courtCases, setCourtCases] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [purchases, setPurchases] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [activityLogs, setActivityLogs] = useState<any[]>([])
  const [savedCases, setSavedCases] = useState<any[]>([])

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPurchases: 0,
    totalRevenue: 0,
    totalCaseFiles: 0,
    totalBooks: 0,
    totalCourtCases: 0
  })

  // Forms
  const [libForm, setLibForm] = useState({
    title: "", desc: "", caseNumber: "", courtName: "", category: "constitutional", 
    subcategory: "", year: new Date().getFullYear(), price: "0", totalPages: "10", 
    isPremium: false, tags: "", judgeName: "", petitioner: "", respondent: "",
    advocates: "", caseSummary: "", keyPoints: "", judgmentDate: "", bench: "", state: ""
  })
  
  const [bookForm, setBookForm] = useState({
    title: "", author: "", desc: "", price: "0", originalPrice: "0", 
    stock: "100", category: "law_notes", isbn: "", publisher: "", pages: "200"
  })

  const [courtForm, setCourtForm] = useState({
    caseNumber: "", petitioner: "", respondent: "", courtName: "Supreme Court of India", 
    courtType: "Supreme Court", state: "Delhi", judgeName: "", status: "pending", 
    nextHearing: "", advocates: ""
  })

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [f, b, c, u, p, s, a, sc] = await Promise.all([
        supabase.from('case_files').select('*').order('created_at', { ascending: false }),
        supabase.from('books').select('*').order('created_at', { ascending: false }),
        supabase.from('court_cases').select('*').order('updated_at', { ascending: false }),
        // Use service role or bypass RLS for admin - fetch all profiles
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('purchases').select('*').order('created_at', { ascending: false }),
        supabase.from('subscriptions').select('*').order('created_at', { ascending: false }),
        supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('saved_cases').select('*').order('created_at', { ascending: false })
      ])
      
      // Log for debugging
      if (u.error) {
        console.error("Users fetch error:", u.error)
      }
      
      if (f.data) setCaseFiles(f.data)
      if (b.data) setBooks(b.data)
      if (c.data) setCourtCases(c.data)
      if (u.data) setUsers(u.data)
      if (p.data) {
        setPurchases(p.data)
        const revenue = p.data
          .filter((p: any) => p.payment_status === 'completed')
          .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0)
        setStats(prev => ({
          ...prev,
          totalPurchases: p.data.length,
          totalRevenue: revenue
        }))
      }
      if (s.data) setSubscriptions(s.data)
      if (a.data) setActivityLogs(a.data)
      if (sc.data) setSavedCases(sc.data)

      // Update stats
      setStats(prev => ({
        ...prev,
        totalUsers: u.data?.length || 0,
        totalCaseFiles: f.data?.length || 0,
        totalBooks: b.data?.length || 0,
        totalCourtCases: c.data?.length || 0
      }))
    } catch (error: any) {
      toast.error("Failed to fetch data: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Check admin status on mount
  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = "/auth/login?next=/admin"
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profile?.role === "admin") {
        setIsAdmin(true)
        setCheckingAuth(false)
        // Fetch data after confirming admin
        fetchData()
      } else {
        toast.error("Admin access required")
        setTimeout(() => window.location.href = "/", 1000)
      }
    }
    checkAdmin()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Upload Logic
  const uploadFile = async (file: File, folder: string = 'case-files') => {
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`
    const { error } = await supabase.storage.from('protected_files').upload(`${folder}/${fileName}`, file)
    if (error) throw error
    return `${folder}/${fileName}`
  }

  // Upload Image/Thumbnail
  const uploadImage = async (file: File, folder: string = 'thumbnails') => {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`
    const { error } = await supabase.storage.from('protected_files').upload(`${folder}/${fileName}`, file, {
      cacheControl: '3600',
      upsert: false
    })
    if (error) throw error
    
    // Get public URL (or signed URL for private bucket)
    const { data } = await supabase.storage.from('protected_files').getPublicUrl(`${folder}/${fileName}`)
    return data.publicUrl
  }

  // 1. LIBRARY UPLOAD
  const handleLibUpload = async () => {
    if (!file || !libForm.title) return toast.error("File & Title required")
    setUploading(true)
    try {
      const path = await uploadFile(file, 'case-files')
      let thumbnailUrl = "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800"
      
      // Upload thumbnail if provided
      if (thumbnailFile) {
        thumbnailUrl = await uploadImage(thumbnailFile, 'thumbnails')
      }
      
      const { error } = await supabase.from('case_files').insert({
        title: libForm.title,
        description: libForm.desc,
        case_number: libForm.caseNumber,
        court_name: libForm.courtName,
        category: libForm.category,
        subcategory: libForm.subcategory,
        year: Number(libForm.year),
        price: Number(libForm.price),
        is_premium: libForm.isPremium,
        total_pages: Number(libForm.totalPages),
        tags: libForm.tags.split(',').map(s => s.trim()).filter(Boolean),
        file_path: path,
        is_published: true,
        thumbnail_url: thumbnailUrl,
        judge_name: libForm.judgeName || null,
        petitioner: libForm.petitioner || null,
        respondent: libForm.respondent || null,
        advocate_names: libForm.advocates ? libForm.advocates.split(',').map(s => s.trim()).filter(Boolean) : null,
        case_summary: libForm.caseSummary || null,
        key_points: libForm.keyPoints ? libForm.keyPoints.split(',').map(s => s.trim()).filter(Boolean) : null,
        judgment_date: libForm.judgmentDate || null,
        bench: libForm.bench || null,
        state: libForm.state || null
      })
      if (error) throw error
      toast.success("Case File Published!")
      setFile(null)
      setThumbnailFile(null)
      setLibForm({
        title: "", desc: "", caseNumber: "", courtName: "", category: "constitutional", 
        subcategory: "", year: new Date().getFullYear(), price: "0", totalPages: "10", 
        isPremium: false, tags: "", judgeName: "", petitioner: "", respondent: "",
        advocates: "", caseSummary: "", keyPoints: "", judgmentDate: "", bench: "", state: ""
      })
      fetchData()
    } catch (e: any) { toast.error(e.message) }
    finally { setUploading(false) }
  }

  // 2. BOOK UPLOAD
  const handleBookUpload = async () => {
    if (!file || !bookForm.title) return toast.error("File & Title required")
    setUploading(true)
    try {
      const path = await uploadFile(file, 'books')
      let coverUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800"
      
      // Upload cover if provided
      if (coverFile) {
        coverUrl = await uploadImage(coverFile, 'covers')
      }
      
      const { error } = await supabase.from('books').insert({
        title: bookForm.title,
        author: bookForm.author,
        description: bookForm.desc,
        price: Number(bookForm.price),
        original_price: Number(bookForm.originalPrice),
        stock: Number(bookForm.stock),
        category: bookForm.category,
        isbn: bookForm.isbn,
        publisher: bookForm.publisher,
        pages: Number(bookForm.pages),
        file_path: path,
        is_published: true,
        cover_url: coverUrl
      })
      if (error) throw error
      toast.success("Book Published!")
      setFile(null)
      setCoverFile(null)
      setBookForm({
        title: "", author: "", desc: "", price: "0", originalPrice: "0", 
        stock: "100", category: "law_notes", isbn: "", publisher: "", pages: "200"
      })
      fetchData()
    } catch (e: any) { toast.error(e.message) }
    finally { setUploading(false) }
  }

  // 3. COURT UPDATE
  const handleCourtUpdate = async () => {
    if (!courtForm.caseNumber) return toast.error("Case Number required")
    setUploading(true)
    try {
      const { error } = await supabase.from('court_cases').insert({
        case_number: courtForm.caseNumber,
        case_title: `${courtForm.petitioner} v. ${courtForm.respondent}`,
        party_names: [courtForm.petitioner, courtForm.respondent],
        advocate_names: courtForm.advocates.split(',').map(s => s.trim()),
        court_name: courtForm.courtName,
        court_type: courtForm.courtType,
        state: courtForm.state,
        judge_name: courtForm.judgeName,
        status: courtForm.status,
        next_hearing_date: courtForm.nextHearing || null,
        filing_date: new Date().toISOString()
      })
      if (error) throw error
      toast.success("Case Updated!")
      setCourtForm({
        caseNumber: "", petitioner: "", respondent: "", courtName: "Supreme Court of India", 
        courtType: "Supreme Court", state: "Delhi", judgeName: "", status: "pending", 
        nextHearing: "", advocates: ""
      })
      fetchData()
    } catch (e: any) { toast.error(e.message) }
    finally { setUploading(false) }
  }

  const deleteItem = async (table: string, id: string) => {
    if(!confirm("Delete this item?")) return
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) {
      toast.error("Delete failed: " + error.message)
    } else {
      toast.success("Deleted successfully")
      fetchData()
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    if (error) {
      toast.error("Update failed: " + error.message)
    } else {
      toast.success("Role updated")
      fetchData()
    }
  }

  if (checkingAuth) {
    return (
      <div className="container mx-auto py-20 text-center">
        <Loader2 className="animate-spin mx-auto h-8 w-8 mb-4" />
        <p className="text-muted-foreground">Verifying admin access...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-20 text-center">
        <p className="text-destructive">Admin access required</p>
      </div>
    )
  }

  if (isLoading) {
    return <div className="container mx-auto py-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>
  }

  return (
    <div className="container mx-auto py-10 max-w-7xl">
      <div className="flex justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={fetchData}><RefreshCw className="w-4 h-4 mr-2"/> Refresh</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Users</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Purchases</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalPurchases}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Revenue</span>
            </div>
            <p className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">Case Files</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalCaseFiles}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-muted-foreground">Books</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalBooks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-muted-foreground">Court Cases</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalCourtCases}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="court">Court</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>

        {/* LIBRARY TAB */}
        <TabsContent value="library" className="space-y-6 mt-6">
          <Card className="p-6">
            <h3 className="font-bold mb-4">Add Case File</h3>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Title" value={libForm.title} onChange={e => setLibForm({...libForm, title: e.target.value})} />
                <Input placeholder="Case Number" value={libForm.caseNumber} onChange={e => setLibForm({...libForm, caseNumber: e.target.value})} />
              </div>
              <Textarea placeholder="Description" value={libForm.desc} onChange={e => setLibForm({...libForm, desc: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Petitioner" value={libForm.petitioner} onChange={e => setLibForm({...libForm, petitioner: e.target.value})} />
                <Input placeholder="Respondent" value={libForm.respondent} onChange={e => setLibForm({...libForm, respondent: e.target.value})} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input placeholder="Judge Name" value={libForm.judgeName} onChange={e => setLibForm({...libForm, judgeName: e.target.value})} />
                <Input placeholder="Bench" value={libForm.bench} onChange={e => setLibForm({...libForm, bench: e.target.value})} />
                <Input placeholder="State" value={libForm.state} onChange={e => setLibForm({...libForm, state: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <Input type="number" placeholder="Year" value={libForm.year} onChange={e => setLibForm({...libForm, year: Number(e.target.value)})} />
                <Input type="number" placeholder="Pages" value={libForm.totalPages} onChange={e => setLibForm({...libForm, totalPages: e.target.value})} />
                <Input type="number" placeholder="Price" value={libForm.price} onChange={e => setLibForm({...libForm, price: e.target.value})} />
                <Input type="date" placeholder="Judgment Date" value={libForm.judgmentDate} onChange={e => setLibForm({...libForm, judgmentDate: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Advocates (comma sep)" value={libForm.advocates} onChange={e => setLibForm({...libForm, advocates: e.target.value})} />
                <Input placeholder="Tags (comma sep)" value={libForm.tags} onChange={e => setLibForm({...libForm, tags: e.target.value})} />
              </div>
              <Textarea placeholder="Case Summary" value={libForm.caseSummary} onChange={e => setLibForm({...libForm, caseSummary: e.target.value})} rows={3} />
              <Input placeholder="Key Points (comma sep)" value={libForm.keyPoints} onChange={e => setLibForm({...libForm, keyPoints: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>PDF/Document File *</Label>
                  <Input type="file" accept=".pdf,.doc,.docx" onChange={e => setFile(e.target.files?.[0] || null)} />
                </div>
                <div>
                  <Label>Thumbnail Image (Optional)</Label>
                  <Input type="file" accept="image/*" onChange={e => setThumbnailFile(e.target.files?.[0] || null)} />
                </div>
              </div>
              {thumbnailFile && (
                <div className="text-sm text-muted-foreground">
                  Preview: <img src={URL.createObjectURL(thumbnailFile)} alt="Preview" className="h-20 w-20 object-cover rounded mt-2" />
                </div>
              )}
              <Button onClick={handleLibUpload} disabled={uploading}>{uploading ? "Uploading..." : "Publish"}</Button>
            </div>
          </Card>
          <Card>
            <CardHeader><CardTitle>Case Files ({caseFiles.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="border rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Case #</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {caseFiles.map(f => (
                      <TableRow key={f.id}>
                        <TableCell>{f.title}</TableCell>
                        <TableCell className="font-mono text-xs">{f.case_number || 'N/A'}</TableCell>
                        <TableCell>₹{f.price || 0}</TableCell>
                        <TableCell>
                          <Badge variant={f.is_published ? "default" : "secondary"}>
                            {f.is_published ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => deleteItem('case_files', f.id)}>
                            <Trash2 className="w-4 h-4 text-red-500"/>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BOOKS TAB */}
        <TabsContent value="books" className="space-y-6 mt-6">
          <Card className="p-6">
             <h3 className="font-bold mb-4">Add Book</h3>
             <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                   <Input placeholder="Title" value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} />
                   <Input placeholder="Author" value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value})} />
                </div>
                <Textarea placeholder="Description" value={bookForm.desc} onChange={e => setBookForm({...bookForm, desc: e.target.value})} />
                <div className="grid grid-cols-3 gap-4">
                   <Input placeholder="ISBN" value={bookForm.isbn} onChange={e => setBookForm({...bookForm, isbn: e.target.value})} />
                   <Input placeholder="Publisher" value={bookForm.publisher} onChange={e => setBookForm({...bookForm, publisher: e.target.value})} />
                   <Input type="number" placeholder="Pages" value={bookForm.pages} onChange={e => setBookForm({...bookForm, pages: e.target.value})} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input type="number" placeholder="Price" value={bookForm.price} onChange={e => setBookForm({...bookForm, price: e.target.value})} />
                  <Input type="number" placeholder="Original Price" value={bookForm.originalPrice} onChange={e => setBookForm({...bookForm, originalPrice: e.target.value})} />
                  <Input type="number" placeholder="Stock" value={bookForm.stock} onChange={e => setBookForm({...bookForm, stock: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>PDF/Document File *</Label>
                    <Input type="file" accept=".pdf,.doc,.docx" onChange={e => setFile(e.target.files?.[0] || null)} />
                  </div>
                  <div>
                    <Label>Cover Image (Optional)</Label>
                    <Input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)} />
                  </div>
                </div>
                {coverFile && (
                  <div className="text-sm text-muted-foreground">
                    Preview: <img src={URL.createObjectURL(coverFile)} alt="Preview" className="h-32 w-24 object-cover rounded mt-2" />
                  </div>
                )}
                <Button onClick={handleBookUpload} disabled={uploading}>Publish Book</Button>
             </div>
          </Card>
          <Card>
            <CardHeader><CardTitle>Books ({books.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="border rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.map(b => (
                      <TableRow key={b.id}>
                        <TableCell>{b.title}</TableCell>
                        <TableCell>{b.author}</TableCell>
                        <TableCell>₹{b.price || 0}</TableCell>
                        <TableCell>{b.stock || 0}</TableCell>
                        <TableCell>
                          <Badge variant={b.is_published ? "default" : "secondary"}>
                            {b.is_published ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => deleteItem('books', b.id)}>
                            <Trash2 className="w-4 h-4 text-red-500"/>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* COURT TAB */}
        <TabsContent value="court" className="space-y-6 mt-6">
           <Card className="p-6">
             <h3 className="font-bold mb-4">Update Case Status</h3>
             <div className="grid gap-4">
               <div className="grid grid-cols-3 gap-4">
                  <Input placeholder="Case No" value={courtForm.caseNumber} onChange={e => setCourtForm({...courtForm, caseNumber: e.target.value})} />
                  <Input placeholder="Petitioner" value={courtForm.petitioner} onChange={e => setCourtForm({...courtForm, petitioner: e.target.value})} />
                  <Input placeholder="Respondent" value={courtForm.respondent} onChange={e => setCourtForm({...courtForm, respondent: e.target.value})} />
               </div>
               <div className="grid grid-cols-3 gap-4">
                  <Input placeholder="Court Name" value={courtForm.courtName} onChange={e => setCourtForm({...courtForm, courtName: e.target.value})} />
                  <Input placeholder="Judge Name" value={courtForm.judgeName} onChange={e => setCourtForm({...courtForm, judgeName: e.target.value})} />
                  <Input placeholder="Advocates (comma sep)" value={courtForm.advocates} onChange={e => setCourtForm({...courtForm, advocates: e.target.value})} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <Select value={courtForm.status} onValueChange={(v) => setCourtForm({...courtForm, status: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="hearing_today">Hearing Today</SelectItem>
                      <SelectItem value="disposed">Disposed</SelectItem>
                      <SelectItem value="adjourned">Adjourned</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="date" value={courtForm.nextHearing} onChange={e => setCourtForm({...courtForm, nextHearing: e.target.value})} />
               </div>
               <Button onClick={handleCourtUpdate} disabled={uploading}>Post Update</Button>
             </div>
           </Card>
           <Card>
            <CardHeader><CardTitle>Court Cases ({courtCases.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="border rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case #</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Court</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courtCases.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs">{c.case_number}</TableCell>
                        <TableCell>{c.case_title || 'N/A'}</TableCell>
                        <TableCell>{c.court_name}</TableCell>
                        <TableCell>
                          <Badge>{c.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => deleteItem('court_cases', c.id)}>
                            <Trash2 className="w-4 h-4 text-red-500"/>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* USERS TAB */}
        <TabsContent value="users" className="space-y-6 mt-6">
          <Card>
            <CardHeader><CardTitle>Users ({users.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="border rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(u => (
                      <TableRow key={u.id}>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.full_name || 'N/A'}</TableCell>
                        <TableCell>
                          <Select value={u.role || 'student'} onValueChange={(v) => updateUserRole(u.id, v)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => deleteItem('profiles', u.id)}>
                            <Trash2 className="w-4 h-4 text-red-500"/>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PURCHASES TAB */}
        <TabsContent value="purchases" className="space-y-6 mt-6">
          <Card>
            <CardHeader><CardTitle>Purchases ({purchases.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="border rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Item Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="text-xs">{p.user_id?.substring(0, 8)}...</TableCell>
                        <TableCell><Badge variant="outline">{p.item_type}</Badge></TableCell>
                        <TableCell>₹{p.amount || 0}</TableCell>
                        <TableCell>
                          <Badge variant={p.payment_status === 'completed' ? 'default' : 'secondary'}>
                            {p.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SUBSCRIPTIONS TAB */}
        <TabsContent value="subscriptions" className="space-y-6 mt-6">
          <Card>
            <CardHeader><CardTitle>Subscriptions ({subscriptions.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="border rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>End Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="text-xs">{s.user_id?.substring(0, 8)}...</TableCell>
                        <TableCell><Badge>{s.plan_type}</Badge></TableCell>
                        <TableCell>₹{s.amount || 0}</TableCell>
                        <TableCell>
                          <Badge variant={s.status === 'active' ? 'default' : 'secondary'}>
                            {s.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(s.end_date).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACTIVITY TAB */}
        <TabsContent value="activity" className="space-y-6 mt-6">
          <Card>
            <CardHeader><CardTitle>Activity Logs ({activityLogs.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="border rounded max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityLogs.map(a => (
                      <TableRow key={a.id}>
                        <TableCell className="text-xs">{a.user_id?.substring(0, 8)}...</TableCell>
                        <TableCell>{a.action}</TableCell>
                        <TableCell className="text-xs font-mono">{a.ip_address || 'N/A'}</TableCell>
                        <TableCell>{new Date(a.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SAVED CASES TAB */}
        <TabsContent value="saved" className="space-y-6 mt-6">
          <Card>
            <CardHeader><CardTitle>Saved Cases ({savedCases.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="border rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Case ID</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {savedCases.map(sc => (
                      <TableRow key={sc.id}>
                        <TableCell className="text-xs">{sc.user_id?.substring(0, 8)}...</TableCell>
                        <TableCell className="font-mono text-xs">{sc.case_id?.substring(0, 8)}...</TableCell>
                        <TableCell>{new Date(sc.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
