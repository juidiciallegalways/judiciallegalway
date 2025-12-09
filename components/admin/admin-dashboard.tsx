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
import { Loader2, UploadCloud, FileText, Trash2, RefreshCw, BookOpen, Scale } from "lucide-react"

export function AdminDashboard() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState("library")
  const [isLoading, setIsLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  // Data
  const [caseFiles, setCaseFiles] = useState<any[]>([])
  const [books, setBooks] = useState<any[]>([])
  const [courtCases, setCourtCases] = useState<any[]>([])

  // --- FULL FORMS (MATCHING DB SCHEMA) ---
  const [libForm, setLibForm] = useState({
    title: "", desc: "", caseNumber: "", courtName: "", category: "constitutional", 
    subcategory: "", year: new Date().getFullYear(), price: "0", totalPages: "10", 
    isPremium: false, tags: "" 
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
    const [f, b, c] = await Promise.all([
      supabase.from('case_files').select('*').order('created_at', { ascending: false }),
      supabase.from('books').select('*').order('created_at', { ascending: false }),
      supabase.from('court_cases').select('*').order('updated_at', { ascending: false })
    ])
    if (f.data) setCaseFiles(f.data)
    if (b.data) setBooks(b.data)
    if (c.data) setCourtCases(c.data)
    setIsLoading(false)
  }
  useEffect(() => { fetchData() }, [])

  // Upload Logic
  const uploadFile = async (file: File) => {
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`
    const { error } = await supabase.storage.from('protected_files').upload(`case-files/${fileName}`, file)
    if (error) throw error
    return `case-files/${fileName}`
  }

  // 1. LIBRARY UPLOAD (FULL FIELDS)
  const handleLibUpload = async () => {
    if (!file || !libForm.title) return toast.error("File & Title required")
    setUploading(true)
    try {
      const path = await uploadFile(file)
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
        tags: libForm.tags.split(',').map(s => s.trim()), // Convert string to text[]
        file_url: path, 
        is_published: true,
        thumbnail_url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800"
      })
      if (error) throw error
      toast.success("Case File Published!")
      setFile(null)
      fetchData()
    } catch (e: any) { toast.error(e.message) }
    finally { setUploading(false) }
  }

  // 2. BOOK UPLOAD (FULL FIELDS)
  const handleBookUpload = async () => {
    if (!file || !bookForm.title) return toast.error("File & Title required")
    setUploading(true)
    try {
      const path = await uploadFile(file)
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
        cover_url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800"
      })
      if (error) throw error
      toast.success("Book Published!")
      setFile(null)
      fetchData()
    } catch (e: any) { toast.error(e.message) }
    finally { setUploading(false) }
  }

  // 3. COURT UPDATE (FULL FIELDS)
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
      fetchData()
    } catch (e: any) { toast.error(e.message) }
    finally { setUploading(false) }
  }

  const deleteItem = async (table: string, id: string) => {
    if(!confirm("Delete?")) return
    await supabase.from(table).delete().eq('id', id)
    fetchData()
  }

  return (
    <div className="container mx-auto py-10 max-w-6xl">
      <div className="flex justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={fetchData}><RefreshCw className="w-4 h-4 mr-2"/> Refresh</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="books">Book Store</TabsTrigger>
          <TabsTrigger value="court">Court Updates</TabsTrigger>
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
              <Input placeholder="Subcategory" value={libForm.subcategory} onChange={e => setLibForm({...libForm, subcategory: e.target.value})} />
              <div className="grid grid-cols-4 gap-4">
                <Input type="number" placeholder="Year" value={libForm.year} onChange={e => setLibForm({...libForm, year: Number(e.target.value)})} />
                <Input type="number" placeholder="Pages" value={libForm.totalPages} onChange={e => setLibForm({...libForm, totalPages: e.target.value})} />
                <Input type="number" placeholder="Price" value={libForm.price} onChange={e => setLibForm({...libForm, price: e.target.value})} />
                <Input placeholder="Tags (comma sep)" value={libForm.tags} onChange={e => setLibForm({...libForm, tags: e.target.value})} />
              </div>
              <Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
              <Button onClick={handleLibUpload} disabled={uploading}>{uploading ? "Uploading..." : "Publish"}</Button>
            </div>
          </Card>
          {/* Table */}
          <div className="border rounded p-4">
             {caseFiles.map(f => <div key={f.id} className="flex justify-between py-2 border-b">{f.title} <Button size="sm" variant="ghost" onClick={() => deleteItem('case_files', f.id)}><Trash2 className="w-4 h-4 text-red-500"/></Button></div>)}
          </div>
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
                <div className="grid grid-cols-3 gap-4">
                   <Input placeholder="ISBN" value={bookForm.isbn} onChange={e => setBookForm({...bookForm, isbn: e.target.value})} />
                   <Input placeholder="Publisher" value={bookForm.publisher} onChange={e => setBookForm({...bookForm, publisher: e.target.value})} />
                   <Input type="number" placeholder="Pages" value={bookForm.pages} onChange={e => setBookForm({...bookForm, pages: e.target.value})} />
                </div>
                <Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
                <Button onClick={handleBookUpload} disabled={uploading}>Publish Book</Button>
             </div>
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
                  <select className="border p-2 rounded" value={courtForm.status} onChange={e => setCourtForm({...courtForm, status: e.target.value})}>
                     <option value="pending">Pending</option><option value="hearing_today">Hearing Today</option>
                  </select>
                  <Input type="date" value={courtForm.nextHearing} onChange={e => setCourtForm({...courtForm, nextHearing: e.target.value})} />
               </div>
               <Button onClick={handleCourtUpdate} disabled={uploading}>Post Update</Button>
             </div>
           </Card>
           <div className="border rounded p-4">
             {courtCases.map(c => <div key={c.id} className="flex justify-between py-2 border-b">{c.case_number} ({c.status}) <Button size="sm" variant="ghost" onClick={() => deleteItem('court_cases', c.id)}><Trash2 className="w-4 h-4 text-red-500"/></Button></div>)}
           </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}