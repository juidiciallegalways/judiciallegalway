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
import { Loader2, UploadCloud, FileText, Trash2, RefreshCw, BookOpen } from "lucide-react"

export function AdminDashboard() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState("library")
  
  // Data State
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
    price: "0", totalPages: "10", isPremium: false
  })
  
  const [bookForm, setBookForm] = useState({
    title: "", author: "", desc: "", price: "0", stock: "100", category: "law_notes"
  })

  const [courtForm, setCourtForm] = useState({
    caseNumber: "", petitioner: "", respondent: "", 
    court: "High Court of Delhi", status: "Hearing Scheduled", nextHearing: ""
  })

  // 1. FETCH REAL DATA
  const fetchData = async () => {
    setIsLoadingData(true)
    
    // Fetch Library
    const { data: files } = await supabase.from('case_files').select('*').order('created_at', { ascending: false })
    if (files) setCaseFiles(files)

    // Fetch Books
    const { data: booksData } = await supabase.from('books').select('*').order('created_at', { ascending: false })
    if (booksData) setBooks(booksData)

    // Fetch Court Cases
    const { data: cases } = await supabase.from('court_cases').select('*').order('last_updated', { ascending: false })
    if (cases) setCourtCases(cases)
    
    setIsLoadingData(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 2. GENERIC FILE UPLOADER HELPER
  const uploadFileToStorage = async (file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `protected/${fileName}` // Store in 'protected' folder

    const { error: uploadError } = await supabase.storage
      .from('protected_files')
      .upload(filePath, file)

    if (uploadError) throw uploadError
    return filePath
  }

  // 3. HANDLER: Upload Case File
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
        category: 'constitutional',
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

  // 4. HANDLER: Upload Book
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
        file_path: filePath, // Stores the PDF location
        is_published: true,
        cover_url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800" // Default cover
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

  // 5. HANDLER: Court Update
  const handleCourtUpdate = async () => {
    try {
      setUploading(true)
      const { error } = await supabase.from('court_cases').insert({
        case_number: courtForm.caseNumber,
        petitioner: courtForm.petitioner,
        respondent: courtForm.respondent,
        court_name: courtForm.court,
        status: courtForm.status,
        next_hearing: courtForm.nextHearing || null,
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
              <Input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
              <Button onClick={handleLibraryUpload} disabled={uploading} className="w-full">
                {uploading ? <Loader2 className="animate-spin mr-2" /> : <FileText className="mr-2 h-4 w-4" />}
                Upload Case File
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 2: BOOK STORE (NEW) --- */}
        <TabsContent value="books" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Upload Book / Notes</CardTitle><CardDescription>Upload PDF notes or books for the store.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} placeholder="Book Title" />
                <Input value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value})} placeholder="Author Name" />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <Input type="number" value={bookForm.price} onChange={e => setBookForm({...bookForm, price: e.target.value})} placeholder="Price (₹)" />
                <Input type="number" value={bookForm.stock} onChange={e => setBookForm({...bookForm, stock: e.target.value})} placeholder="Stock" />
                <select className="border rounded px-3" value={bookForm.category} onChange={e => setBookForm({...bookForm, category: e.target.value})}>
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
                <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {books.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>{b.title}</TableCell>
                      <TableCell>{b.category}</TableCell>
                      <TableCell>₹{b.price}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete('books', b.id)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 3: COURT UPDATES --- */}
        <TabsContent value="court" className="space-y-6">
           {/* (Keep the same court update logic as before) */}
           <Card>
            <CardHeader><CardTitle>Add Case Update</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                 <Input placeholder="Case Number" value={courtForm.caseNumber} onChange={e => setCourtForm({...courtForm, caseNumber: e.target.value})} />
                 <Input placeholder="Petitioner" value={courtForm.petitioner} onChange={e => setCourtForm({...courtForm, petitioner: e.target.value})} />
                 <Input placeholder="Respondent" value={courtForm.respondent} onChange={e => setCourtForm({...courtForm, respondent: e.target.value})} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                 <select className="border rounded p-2" value={courtForm.status} onChange={e => setCourtForm({...courtForm, status: e.target.value})}>
                   <option>Hearing Scheduled</option><option>Disposed</option><option>Adjourned</option>
                 </select>
                 <Input type="date" value={courtForm.nextHearing} onChange={e => setCourtForm({...courtForm, nextHearing: e.target.value})} />
              </div>
              <Button onClick={handleCourtUpdate} disabled={uploading}>Post Update</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}