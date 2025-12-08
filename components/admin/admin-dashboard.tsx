"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Loader2, UploadCloud, FileText, Trash2, RefreshCw, BookOpen, Scale } from "lucide-react"

export function AdminDashboard() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState("library")
  
  // Real Data State (Initialized Empty)
  const [caseFiles, setCaseFiles] = useState<any[]>([])
  const [courtCases, setCourtCases] = useState<any[]>([])
  const [books, setBooks] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Upload States
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
    court: "High Court of Delhi", status: "Hearing Scheduled", nextHearing: ""
  })

  // 1. FETCH REAL DATA FROM DB
  const fetchData = async () => {
    setIsLoadingData(true)
    
    // Fetch Case Files
    const { data: files, error: filesError } = await supabase
      .from('case_files')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (files) setCaseFiles(files)
    if (filesError) toast.error("Failed to load Case Files")

    // Fetch Books
    const { data: booksData, error: booksError } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (booksData) setBooks(booksData)
    if (booksError) toast.error("Failed to load Books")

    // Fetch Court Cases
    const { data: cases, error: casesError } = await supabase
      .from('court_cases')
      .select('*')
      .order('updated_at', { ascending: false })

    if (cases) setCourtCases(cases)
    if (casesError) toast.error("Failed to load Court Cases")
    
    setIsLoadingData(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 2. FILE UPLOADER HELPER
  const uploadFileToStorage = async (file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `protected/${fileName}` 

    const { error: uploadError } = await supabase.storage
      .from('protected_files')
      .upload(filePath, file)

    if (uploadError) throw uploadError
    return filePath
  }

  // 3. UPLOAD CASE FILE (Library)
  const handleLibraryUpload = async () => {
    if (!file || !libraryForm.title) { toast.error("Title and File required"); return }

    try {
      setUploading(true)
      const filePath = await uploadFileToStorage(file)

      const { error } = await supabase.from('case_files').insert({
        title: libraryForm.title,
        description: libraryForm.desc,
        case_number: libraryForm.caseNumber,
        court_name: libraryForm.courtName,
        price: parseFloat(libraryForm.price),
        is_premium: libraryForm.isPremium,
        file_path: filePath,
        is_published: true,
        category: libraryForm.category,
        total_pages: parseInt(libraryForm.totalPages),
        thumbnail_url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800"
      })

      if (error) throw error
      toast.success("Case File Published!")
      setFile(null)
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setUploading(false)
    }
  }

  // 4. UPLOAD BOOK (Store)
  const handleBookUpload = async () => {
    if (!file || !bookForm.title || !bookForm.author) { toast.error("Title, Author and File required"); return }

    try {
      setUploading(true)
      const filePath = await uploadFileToStorage(file)

      const { error } = await supabase.from('books').insert({
        title: bookForm.title,
        author: bookForm.author,
        description: bookForm.desc,
        price: parseFloat(bookForm.price),
        stock: parseInt(bookForm.stock),
        category: bookForm.category,
        file_path: filePath,
        is_published: true,
        cover_url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800"
      })

      if (error) throw error
      toast.success("Book Published!")
      setFile(null)
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setUploading(false)
    }
  }

  // 5. UPDATE COURT CASE
  const handleCourtUpdate = async () => {
    if (!courtForm.caseNumber) { toast.error("Case Number Required"); return }
    
    try {
      setUploading(true)
      // Construct Title from Petitioner/Respondent if not separate fields
      const caseTitle = `${courtForm.petitioner} v. ${courtForm.respondent}`
      
      const { error } = await supabase.from('court_cases').insert({
        case_number: courtForm.caseNumber,
        case_title: caseTitle,
        party_names: [courtForm.petitioner, courtForm.respondent], // Store as array
        court_name: courtForm.court,
        status: courtForm.status,
        next_hearing_date: courtForm.nextHearing || null,
        // petitioner/respondent might not exist as columns in your SQL script 001
        // so we rely on case_title and party_names array
      })
      if (error) throw error
      toast.success("Court Case Updated!")
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (table: string, id: string) => {
    if(!confirm("Are you sure?")) return;
    await supabase.from(table).delete().eq('id', id)
    toast.success("Deleted item")
    fetchData()
  }

  return (
    <div className="container mx-auto py-10 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={fetchData} disabled={isLoadingData}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingData ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="library">Case Files</TabsTrigger>
          <TabsTrigger value="books">Book Store</TabsTrigger>
          <TabsTrigger value="court">Court Updates</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: CASE FILES --- */}
        <TabsContent value="library" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Upload Case File</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input value={libraryForm.title} onChange={e => setLibraryForm({...libraryForm, title: e.target.value})} placeholder="Case Title" />
                <Input value={libraryForm.caseNumber} onChange={e => setLibraryForm({...libraryForm, caseNumber: e.target.value})} placeholder="Citation / Number" />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <Input type="number" value={libraryForm.price} onChange={e => setLibraryForm({...libraryForm, price: e.target.value})} placeholder="Price" />
                <select className="border rounded px-3 h-10" value={libraryForm.category} onChange={e => setLibraryForm({...libraryForm, category: e.target.value})}>
                  <option value="constitutional">Constitutional</option>
                  <option value="criminal">Criminal</option>
                  <option value="civil">Civil</option>
                </select>
                <div className="flex items-center gap-2 pt-2">
                   <Switch checked={libraryForm.isPremium} onCheckedChange={c => setLibraryForm({...libraryForm, isPremium: c})} />
                   <Label>Premium?</Label>
                </div>
              </div>
              <Input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
              <Button onClick={handleLibraryUpload} disabled={uploading} className="w-full">
                {uploading ? <Loader2 className="animate-spin mr-2" /> : <FileText className="mr-2 h-4 w-4" />}
                Upload Case File
              </Button>
            </CardContent>
          </Card>
          
          <Card>
             <CardHeader><CardTitle>Library Inventory ({caseFiles.length})</CardTitle></CardHeader>
             <CardContent>
               <Table>
                 <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                 <TableBody>
                   {caseFiles.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center">No files found.</TableCell></TableRow> : 
                    caseFiles.map(f => (
                     <TableRow key={f.id}>
                       <TableCell>{f.title}</TableCell>
                       <TableCell>{f.category}</TableCell>
                       <TableCell><Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete('case_files', f.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 2: BOOK STORE --- */}
        <TabsContent value="books" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Upload Book / Notes</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} placeholder="Book Title" />
                <Input value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value})} placeholder="Author Name" />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <Input type="number" value={bookForm.price} onChange={e => setBookForm({...bookForm, price: e.target.value})} placeholder="Price (₹)" />
                <Input type="number" value={bookForm.stock} onChange={e => setBookForm({...bookForm, stock: e.target.value})} placeholder="Stock" />
                <select className="border rounded px-3 h-10" value={bookForm.category} onChange={e => setBookForm({...bookForm, category: e.target.value})}>
                    <option value="law_notes">Law Notes</option>
                    <option value="judicial_exam_prep">Judicial Exam Prep</option>
                    <option value="hybrid_study_material">Hybrid Material</option>
                    <option value="judiciary_syllabus">Syllabus</option>
                </select>
              </div>
              <Input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
              <Button onClick={handleBookUpload} disabled={uploading} className="w-full">
                {uploading ? <Loader2 className="animate-spin mr-2" /> : <BookOpen className="mr-2 h-4 w-4" />}
                Upload Book PDF
              </Button>
            </CardContent>
          </Card>
          
           <Card>
             <CardHeader><CardTitle>Store Inventory ({books.length})</CardTitle></CardHeader>
             <CardContent>
               <Table>
                 <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                 <TableBody>
                   {books.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center">No books found.</TableCell></TableRow> : 
                    books.map(b => (
                     <TableRow key={b.id}>
                       <TableCell>{b.title}</TableCell>
                       <TableCell>{b.category}</TableCell>
                       <TableCell><Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete('books', b.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 3: COURT TRACKER --- */}
        <TabsContent value="court" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Add Case Update</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                 <Input placeholder="Case Number" value={courtForm.caseNumber} onChange={e => setCourtForm({...courtForm, caseNumber: e.target.value})} />
                 <Input placeholder="Petitioner" value={courtForm.petitioner} onChange={e => setCourtForm({...courtForm, petitioner: e.target.value})} />
                 <Input placeholder="Respondent" value={courtForm.respondent} onChange={e => setCourtForm({...courtForm, respondent: e.target.value})} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                 <select className="border rounded p-2 h-10" value={courtForm.status} onChange={e => setCourtForm({...courtForm, status: e.target.value})}>
                   <option value="Hearing Scheduled">Hearing Scheduled</option>
                   <option value="Disposed">Disposed</option>
                   <option value="Adjourned">Adjourned</option>
                   <option value="Judgment Reserved">Judgment Reserved</option>
                 </select>
                 <Input type="date" value={courtForm.nextHearing} onChange={e => setCourtForm({...courtForm, nextHearing: e.target.value})} />
              </div>
              <Button onClick={handleCourtUpdate} disabled={uploading}>
                <Scale className="mr-2 h-4 w-4" /> Post Update
              </Button>
            </CardContent>
          </Card>
          
           <Card>
             <CardHeader><CardTitle>Active Cases ({courtCases.length})</CardTitle></CardHeader>
             <CardContent>
               <Table>
                 <TableHeader><TableRow><TableHead>Case No</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                 <TableBody>
                   {courtCases.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center">No active cases.</TableCell></TableRow> :
                    courtCases.map(c => (
                     <TableRow key={c.id}>
                       <TableCell>{c.case_number}</TableCell>
                       <TableCell>{c.status}</TableCell>
                       <TableCell><Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete('court_cases', c.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
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