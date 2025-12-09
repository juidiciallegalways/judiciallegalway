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
import { toast } from "sonner"
import { Loader2, UploadCloud, FileText, Trash2, RefreshCw, BookOpen, Scale, Users, Activity, ShoppingCart } from "lucide-react"

export function AdminDashboard() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState("library")
  
  // Real Data State
  const [caseFiles, setCaseFiles] = useState<any[]>([])
  const [books, setBooks] = useState<any[]>([])
  const [courtCases, setCourtCases] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [purchases, setPurchases] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Upload State
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  
  // Forms
  const [libraryForm, setLibraryForm] = useState({
    title: "", desc: "", caseNumber: "", courtName: "Supreme Court of India", 
    price: "0", totalPages: "10", isPremium: false, category: "constitutional"
  })
  
  const [bookForm, setBookForm] = useState({
    title: "", author: "", desc: "", price: "0", stock: "100", category: "law_notes"
  })

  const [courtForm, setCourtForm] = useState({
    caseNumber: "", petitioner: "", respondent: "", 
    court: "High Court of Delhi", status: "pending", nextHearing: ""
  })

  const fetchData = async () => {
    setIsLoading(true)
    console.log("Fetching Admin Data...")

    const [filesRes, booksRes, courtRes, usersRes, purchasesRes, logsRes] = await Promise.all([
      supabase.from('case_files').select('*').order('created_at', { ascending: false }),
      supabase.from('books').select('*').order('created_at', { ascending: false }),
      supabase.from('court_cases').select('*').order('updated_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('purchases').select('*').order('created_at', { ascending: false }),
      supabase.from('activity_logs').select('*').order('created_at', { ascending: false })
    ])

    if (filesRes.data) setCaseFiles(filesRes.data)
    if (booksRes.data) setBooks(booksRes.data)
    if (courtRes.data) setCourtCases(courtRes.data)
    if (usersRes.data) setUsers(usersRes.data)
    if (purchasesRes.data) setPurchases(purchasesRes.data)
    if (logsRes.data) setLogs(logsRes.data)
    
    setIsLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `case-files/${fileName}` // Upload to 'protected_files' bucket

    console.log("Uploading file to:", filePath)
    const { error } = await supabase.storage.from('protected_files').upload(filePath, file)
    if (error) {
      console.error("Storage Error:", error)
      throw error
    }
    return filePath
  }

  // 1. LIBRARY UPLOAD (Uses 'file_url' column)
  const handleLibraryUpload = async () => {
    if (!file || !libraryForm.title) return toast.error("File & Title required")
    setUploading(true)
    try {
      const path = await uploadFile(file)
      const { error } = await supabase.from('case_files').insert({
        title: libraryForm.title,
        description: libraryForm.desc,
        case_number: libraryForm.caseNumber,
        court_name: libraryForm.courtName,
        price: parseFloat(libraryForm.price),
        is_premium: libraryForm.isPremium,
        file_url: path, // MATCHES SCHEMA
        is_published: true,
        category: libraryForm.category,
        total_pages: parseInt(libraryForm.totalPages),
        thumbnail_url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800"
      })
      if (error) throw error
      toast.success("Case File Published!")
      setFile(null)
      fetchData()
    } catch (e: any) { toast.error(e.message) }
    finally { setUploading(false) }
  }

  // 2. BOOK UPLOAD (Uses 'file_path' column)
  const handleBookUpload = async () => {
    if (!file || !bookForm.title) return toast.error("File & Title required")
    setUploading(true)
    try {
      const path = await uploadFile(file)
      const { error } = await supabase.from('books').insert({
        title: bookForm.title,
        author: bookForm.author,
        description: bookForm.desc,
        price: parseFloat(bookForm.price),
        stock: parseInt(bookForm.stock),
        category: bookForm.category,
        file_path: path, // MATCHES SCHEMA
        is_published: true,
        cover_url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800"
      })
      if (error) throw error
      toast.success("Book Published!")
      setFile(null)
      fetchData()
    } catch (e: any) { toast.error(e.message) }
    finally { setUploading(false) }
  }

  // 3. COURT UPDATE (Uses Array for party_names)
  const handleCourtUpdate = async () => {
    if (!courtForm.caseNumber) return toast.error("Case Number required")
    setUploading(true)
    try {
      const { error } = await supabase.from('court_cases').insert({
        case_number: courtForm.caseNumber,
        case_title: `${courtForm.petitioner} v. ${courtForm.respondent}`,
        party_names: [courtForm.petitioner, courtForm.respondent], // MATCHES ARRAY SCHEMA
        court_name: courtForm.court,
        status: courtForm.status,
        state: "Delhi",
        next_hearing_date: courtForm.nextHearing || null,
      })
      if (error) throw error
      toast.success("Court Case Updated!")
      fetchData()
    } catch (e: any) { toast.error(e.message) }
    finally { setUploading(false) }
  }

  const handleDelete = async (table: string, id: string) => {
    if (!confirm("Delete this item?")) return
    await supabase.from(table).delete().eq('id', id)
    fetchData()
    toast.success("Deleted")
  }

  return (
    <div className="container mx-auto py-10 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={fetchData}><RefreshCw className="w-4 h-4 mr-2"/> Refresh</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 mb-8">
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="books">Store</TabsTrigger>
          <TabsTrigger value="court">Court</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* LIBRARY TAB */}
        <TabsContent value="library" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Upload Case File</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* Form Inputs (Same as before) */}
              <div className="grid md:grid-cols-2 gap-4">
                <Input placeholder="Title" value={libraryForm.title} onChange={e => setLibraryForm({...libraryForm, title: e.target.value})} />
                <Input placeholder="Citation" value={libraryForm.caseNumber} onChange={e => setLibraryForm({...libraryForm, caseNumber: e.target.value})} />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <Input type="number" placeholder="Price" value={libraryForm.price} onChange={e => setLibraryForm({...libraryForm, price: e.target.value})} />
                <select className="border rounded px-2 h-10" value={libraryForm.category} onChange={e => setLibraryForm({...libraryForm, category: e.target.value})}>
                  <option value="constitutional">Constitutional</option>
                  <option value="criminal">Criminal</option>
                  <option value="civil">Civil</option>
                </select>
                <div className="flex items-center gap-2"><Switch checked={libraryForm.isPremium} onCheckedChange={c => setLibraryForm({...libraryForm, isPremium: c})} /><Label>Premium?</Label></div>
              </div>
              <Input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
              <Button onClick={handleLibraryUpload} disabled={uploading} className="w-full">
                {uploading ? <Loader2 className="animate-spin" /> : <FileText className="mr-2 h-4 w-4" />} Upload
              </Button>
            </CardContent>
          </Card>
          <div className="border rounded-md">
             <Table>
               <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
               <TableBody>
                 {caseFiles.map(f => <TableRow key={f.id}><TableCell>{f.title}</TableCell><TableCell>{f.category}</TableCell><TableCell><Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete('case_files', f.id)}><Trash2 className="w-4 h-4"/></Button></TableCell></TableRow>)}
               </TableBody>
             </Table>
          </div>
        </TabsContent>

        {/* BOOKS TAB */}
        <TabsContent value="books" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Upload Book</CardTitle></CardHeader>
            <CardContent className="space-y-4">
               <div className="grid md:grid-cols-2 gap-4">
                <Input placeholder="Book Title" value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} />
                <Input placeholder="Author" value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value})} />
              </div>
               <Input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
               <Button onClick={handleBookUpload} disabled={uploading}>Publish Book</Button>
            </CardContent>
          </Card>
          {/* Books Table */}
          <div className="border rounded-md">
             <Table>
               <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Price</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
               <TableBody>
                 {books.map(b => <TableRow key={b.id}><TableCell>{b.title}</TableCell><TableCell>₹{b.price}</TableCell><TableCell><Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete('books', b.id)}><Trash2 className="w-4 h-4"/></Button></TableCell></TableRow>)}
               </TableBody>
             </Table>
          </div>
        </TabsContent>
        
        {/* COURT TAB */}
        <TabsContent value="court" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Add Case Update</CardTitle></CardHeader>
            <CardContent className="space-y-4">
               <Input placeholder="Case Number" value={courtForm.caseNumber} onChange={e => setCourtForm({...courtForm, caseNumber: e.target.value})} />
               <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="Petitioner" value={courtForm.petitioner} onChange={e => setCourtForm({...courtForm, petitioner: e.target.value})} />
                  <Input placeholder="Respondent" value={courtForm.respondent} onChange={e => setCourtForm({...courtForm, respondent: e.target.value})} />
               </div>
               <Button onClick={handleCourtUpdate} disabled={uploading}>Update Case</Button>
            </CardContent>
          </Card>
          {/* Court Table */}
          <div className="border rounded-md">
             <Table>
               <TableHeader><TableRow><TableHead>Case No</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
               <TableBody>
                 {courtCases.map(c => <TableRow key={c.id}><TableCell>{c.case_number}</TableCell><TableCell>{c.status}</TableCell><TableCell><Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete('court_cases', c.id)}><Trash2 className="w-4 h-4"/></Button></TableCell></TableRow>)}
               </TableBody>
             </Table>
          </div>
        </TabsContent>

        {/* USERS TAB */}
        <TabsContent value="users">
          <Card>
            <CardHeader><CardTitle>Users ({users.length})</CardTitle></CardHeader>
            <CardContent>
               <Table>
                 <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead></TableRow></TableHeader>
                 <TableBody>
                   {users.map(u => <TableRow key={u.id}><TableCell>{u.email}</TableCell><TableCell>{u.role}</TableCell><TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell></TableRow>)}
                 </TableBody>
               </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ORDERS TAB */}
        <TabsContent value="orders">
          <Card>
             <CardHeader><CardTitle>Orders ({purchases.length})</CardTitle></CardHeader>
             <CardContent>
               <Table>
                 <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                 <TableBody>
                   {purchases.map(p => <TableRow key={p.id}><TableCell>{p.item_type}</TableCell><TableCell>₹{p.amount}</TableCell><TableCell>{p.payment_status}</TableCell></TableRow>)}
                 </TableBody>
               </Table>
             </CardContent>
          </Card>
        </TabsContent>

        {/* LOGS TAB */}
        <TabsContent value="logs">
          <Card>
             <CardHeader><CardTitle>Activity Logs</CardTitle></CardHeader>
             <CardContent>
               <Table>
                 <TableHeader><TableRow><TableHead>Action</TableHead><TableHead>IP</TableHead><TableHead>Time</TableHead></TableRow></TableHeader>
                 <TableBody>
                   {logs.map(l => <TableRow key={l.id}><TableCell>{l.action}</TableCell><TableCell>{l.ip_address}</TableCell><TableCell>{new Date(l.created_at).toLocaleString()}</TableCell></TableRow>)}
                 </TableBody>
               </Table>
             </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}