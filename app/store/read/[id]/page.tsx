"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Document, Page, pdfjs } from "react-pdf"
import { Loader2, AlertTriangle, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

// Set worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function BookReaderPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const supabase = createClient()
  
  const [url, setUrl] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>("")
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState(1.0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function initReader() {
      // 1. Check Auth
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Please login to read this book")
        router.push("/auth/login")
        return
      }
      setUserEmail(user.email || "User")

      // 2. Fetch BOOK Metadata (Not Case File)
      const { data: bookData, error: dbError } = await supabase
        .from('books')
        .select('file_path')
        .eq('id', id)
        .single()

      if (dbError || !bookData || !bookData.file_path) {
        console.error(dbError)
        toast.error("Book not found or file missing")
        return
      }

      // 3. Create Signed URL from 'protected_files'
      const { data: signedData, error: storageError } = await supabase
        .storage
        .from('protected_files')
        .createSignedUrl(bookData.file_path, 60)

      if (storageError) {
        toast.error("Failed to load secure document")
        return
      }

      setUrl(signedData.signedUrl)
      setLoading(false)
    }

    initReader()
  }, [id, router, supabase])

  // Prevent Right Click
  useEffect(() => {
    const handleContext = (e: MouseEvent) => e.preventDefault()
    document.addEventListener('contextmenu', handleContext)
    return () => document.removeEventListener('contextmenu', handleContext)
  }, [])

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-white">
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <p>Opening Secure Book Reader...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center relative overflow-hidden select-none">
      {/* Header */}
      <div className="w-full bg-zinc-950 border-b border-zinc-800 p-4 flex items-center justify-between sticky top-0 z-50">
        <Button variant="ghost" onClick={() => router.back()} className="text-zinc-400 hover:text-white">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Store
        </Button>
        <div className="flex items-center gap-4">
          <span className="text-zinc-400 text-sm">Page {pageNumber} of {numPages}</span>
          <div className="flex items-center gap-1 bg-zinc-900 rounded-md border border-zinc-800 p-1">
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}><ZoomOut className="h-4 w-4" /></Button>
             <span className="text-xs w-12 text-center">{(scale * 100).toFixed(0)}%</span>
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale(s => Math.min(2.0, s + 0.1))}><ZoomIn className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="w-20" />
      </div>

      {/* PDF Canvas */}
      <div className="flex-1 w-full overflow-auto flex justify-center p-8 relative">
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden opacity-[0.03]">
           <div className="rotate-[-30deg] whitespace-nowrap text-[8vw] font-black text-white/50 select-none">
             {userEmail} • {userEmail}
           </div>
        </div>
        <Document file={url} onLoadSuccess={({ numPages }) => setNumPages(numPages)} loading={<div className="text-white">Loading...</div>}>
          <Page pageNumber={pageNumber} scale={scale} renderTextLayer={false} renderAnnotationLayer={false} className="mb-4 shadow-2xl" />
        </Document>
      </div>

      {/* Controls */}
      <div className="fixed bottom-8 flex gap-4 z-50">
        <Button variant="secondary" disabled={pageNumber <= 1} onClick={() => setPageNumber(p => p - 1)}><ChevronLeft className="mr-2 h-4 w-4" /> Prev</Button>
        <Button variant="secondary" disabled={pageNumber >= numPages} onClick={() => setPageNumber(p => p + 1)}>Next <ChevronRight className="ml-2 h-4 w-4" /></Button>
      </div>
    </div>
  )
}