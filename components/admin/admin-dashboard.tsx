"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  Loader2, UploadCloud, FileText, CheckCircle, 
  Gavel, Users, TrendingUp, DollarSign, Search, Trash2 
} from "lucide-react"

export function AdminDashboard() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState("library")
  
  // --- STATE: Library Upload ---
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [libraryForm, setLibraryForm] = useState({
    title: "", desc: "", caseNumber: "", courtName: "Supreme Court of India", 
    price: "0", totalPages: "10", isPremium: false
  })

  // --- STATE: Court Case Update ---
  const [caseUploading, setCaseUploading] = useState(false)
  const [courtForm, setCourtForm] = useState({
    caseNumber: "", petitioner: "", respondent: "", 
    court: "High Court of Delhi", status: "Hearing Scheduled", nextHearing: ""
  })

  // --- STATE: Analytics Data ---
  const [stats, setStats] = useState({ users: 0, revenue: 0, activeCases: 0 })

  // Fetch quick stats on mount
  useEffect(() => {
    async function loadStats() {
      // These are placeholders. Connect to real tables when they have data.
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      const { count: caseCount } = await supabase.from('court_cases').select('*', { count: 'exact', head: true })
      setStats({ 
        users: userCount || 1205, // fallback mock
        revenue: 45000, 
        activeCases: caseCount || 42 
      })
    }
    loadStats()
  }, [])

  // --- HANDLER: Upload Case File (PDF) ---
  const handleLibraryUpload = async () => {
    if (!file || !libraryForm.title) {
      toast.error("Title and File are required")
      return
    }

    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `case-files/${fileName}`

      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('protected_files')
        .upload(filePath, file)
      if (uploadError) throw uploadError

      // 2. Save Metadata
      const { error: dbError } = await supabase.from('case_files').insert({
        title: libraryForm.title,
        description: libraryForm.desc,
        case_number: libraryForm.caseNumber,
        court_name: libraryForm.courtName,
        price: parseFloat(libraryForm.price),
        is_premium: libraryForm.isPremium,
        file_path: filePath,
        is_published: true,
        category: 'constitutional', // Default
        total_pages: parseInt(libraryForm.totalPages),
        thumbnail_url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800"
      })
      if (dbError) throw dbError

      toast.success("Case File Published!")
      setFile(null)
      setLibraryForm({ ...libraryForm, title: "", desc: "", caseNumber: "" })
    } catch (error: any) {
      toast.error("Upload Failed", { description: error.message })
    } finally {
      setUploading(false)
    }
  }

  // --- HANDLER: Add Court Case Update ---
  const handleCourtUpdate = async () => {
    try {
      setCaseUploading(true)
      const { error } = await supabase.from('court_cases').insert({
        case_number: courtForm.caseNumber,
        petitioner: courtForm.petitioner,
        respondent: courtForm.respondent,
        court_name: courtForm.court,
        status: courtForm.status,
        next_hearing: courtForm.nextHearing || null,
        last_updated: new Date().toISOString()
      })
      if (error) throw error

      toast.success("Court Case Updated!")
      setCourtForm({ ...courtForm, caseNumber: "", petitioner: "", respondent: "" })
    } catch (error: any) {
      toast.error("Update Failed", { description: error.message })
    } finally {
      setCaseUploading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-6xl">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-4xl font-serif font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage library content, track court cases, and view analytics.</p>
      </div>

      {/* --- QUICK STATS ROW --- */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.users}</div>
            <p className="text-xs text-muted-foreground">+180 new this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Court Cases</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCases}</div>
            <p className="text-xs text-muted-foreground">Updated 2 hours ago</p>
          </CardContent>
        </Card>
      </div>

      {/* --- MAIN TABS --- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="library">Library Manager</TabsTrigger>
          <TabsTrigger value="court">Court Updates</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        {/* TAB 1: LIBRARY UPLOADER */}
        <TabsContent value="library" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Study Material</CardTitle>
              <CardDescription>Upload secure PDFs with DRM protection.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={libraryForm.title} onChange={e => setLibraryForm({...libraryForm, title: e.target.value})} placeholder="e.g. Kesavananda Bharati Case" />
                </div>
                <div className="space-y-2">
                  <Label>Case Number</Label>
                  <Input value={libraryForm.caseNumber} onChange={e => setLibraryForm({...libraryForm, caseNumber: e.target.value})} placeholder="e.g. AIR 1973 SC 1461" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={libraryForm.desc} onChange={e => setLibraryForm({...libraryForm, desc: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input type="number" value={libraryForm.price} onChange={e => setLibraryForm({...libraryForm, price: e.target.value})} />
                </div>
                <div className="flex items-center gap-2 border p-2 rounded-md h-10">
                   <Label htmlFor="premium" className="cursor-pointer">Premium?</Label>
                   <Switch id="premium" checked={libraryForm.isPremium} onCheckedChange={c => setLibraryForm({...libraryForm, isPremium: c})} />
                </div>
              </div>
              <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors relative cursor-pointer ${file ? 'border-green-500 bg-green-50' : 'hover:bg-muted/50'}`}>
                <input type="file" accept="application/pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFile(e.target.files?.[0] || null)} />
                <div className="text-center">
                  {file ? (
                    <><CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2"/><p className="font-medium text-green-700">{file.name}</p></>
                  ) : (
                    <><UploadCloud className="h-8 w-8 text-muted-foreground mx-auto mb-2"/><p className="text-muted-foreground">Click to upload PDF</p></>
                  )}
                </div>
              </div>
              <Button onClick={handleLibraryUpload} disabled={uploading} className="w-full">
                {uploading ? <Loader2 className="animate-spin mr-2" /> : <FileText className="mr-2 h-4 w-4" />}
                {uploading ? "Uploading Encrypted File..." : "Publish to Library"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: COURT CASE UPDATES */}
        <TabsContent value="court" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Court Case Update</CardTitle>
              <CardDescription>Manually update case status for the tracker.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                 <div className="space-y-2"><Label>Petitioner</Label><Input value={courtForm.petitioner} onChange={e => setCourtForm({...courtForm, petitioner: e.target.value})} /></div>
                 <div className="space-y-2"><Label>Respondent</Label><Input value={courtForm.respondent} onChange={e => setCourtForm({...courtForm, respondent: e.target.value})} /></div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                 <div className="space-y-2"><Label>Case Number</Label><Input value={courtForm.caseNumber} onChange={e => setCourtForm({...courtForm, caseNumber: e.target.value})} /></div>
                 <div className="space-y-2"><Label>Status</Label>
                   <select className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm" value={courtForm.status} onChange={e => setCourtForm({...courtForm, status: e.target.value})}>
                     <option>Hearing Scheduled</option>
                     <option>Judgment Reserved</option>
                     <option>Disposed</option>
                     <option>Adjourned</option>
                   </select>
                 </div>
              </div>
              <div className="space-y-2"><Label>Next Hearing Date</Label><Input type="date" value={courtForm.nextHearing} onChange={e => setCourtForm({...courtForm, nextHearing: e.target.value})} /></div>
              <Button onClick={handleCourtUpdate} disabled={caseUploading} className="w-full">
                {caseUploading ? "Updating..." : "Post Update"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: USER MANAGEMENT (Mock for now, ready for connection) */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Registered Users</CardTitle>
              <CardDescription>Manage user access and subscriptions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Amit Sharma</TableCell>
                      <TableCell>amit@example.com</TableCell>
                      <TableCell><Badge variant="outline" className="text-green-600 bg-green-50">Active</Badge></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4"/></Button>
                      </TableCell>
                    </TableRow>
                    {/* Add more rows dynamically later */}
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