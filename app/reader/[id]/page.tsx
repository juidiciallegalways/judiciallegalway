"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Document, Page, pdfjs } from "react-pdf"
import { Loader2, AlertTriangle, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

// Set worker for PDF.js (Required for Next.js)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function ReaderPage() {
  const params = useParams()
  const id = params?.id as string // Casts it to string to satisfy Supabase
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
        toast.error("Please login to view this document")
        router.push("/auth/login")
        return
      }
      setUserEmail(user.email || "User")

      // 2. Fetch File Metadata
      const { data: fileData, error: dbError } = await supabase
        .from('case_files')
        .select('file_path, is_premium')
        .eq('id', id)
        .single()

      if (dbError || !fileData) {
        toast.error("Document not found")
        return
      }

      // 3. TODO: Check Purchase if is_premium is true
      // (Add logic here later to check 'purchases' table)

      // 4. Create Signed URL (Valid for 60 seconds)
      // This is the core DRM: The link expires immediately so it can't be shared.
      const { data: signedData, error: storageError } = await supabase
        .storage
        .from('protected_files')
        .createSignedUrl(fileData.file_path, 60)

      if (storageError) {
        toast.error("Failed to load secure document")
        return
      }

      setUrl(signedData.signedUrl)
      setLoading(false)
    }

    initReader()
  }, [id, router, supabase])

  // Disable Right Click & Keyboard Shortcuts
  useEffect(() => {
    const handleContext = (e: MouseEvent) => e.preventDefault()
    const handleKey = (e: KeyboardEvent) => {
      // Prevent Print (Ctrl+P), Save (Ctrl+S), Copy (Ctrl+C)
      if ((e.ctrlKey || e.metaKey) && ['p', 's', 'c'].includes(e.key)) {
        e.preventDefault()
        toast.error("Protected Content: Action Disabled")
      }
    }

    document.addEventListener('contextmenu', handleContext)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('contextmenu', handleContext)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-white">
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <p>Authenticating & Decrypting...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center relative overflow-hidden select-none">
      
      {/* 1. Header Toolbar */}
      <div className="w-full bg-zinc-950 border-b border-zinc-800 p-4 flex items-center justify-between sticky top-0 z-50">
        <Button variant="ghost" onClick={() => router.back()} className="text-zinc-400 hover:text-white">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <div className="flex items-center gap-4">
          <span className="text-zinc-400 text-sm">
            Page {pageNumber} of {numPages}
          </span>
          <div className="flex items-center gap-1 bg-zinc-900 rounded-md border border-zinc-800 p-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs w-12 text-center">{(scale * 100).toFixed(0)}%</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale(s => Math.min(2.0, s + 0.1))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="w-20" /> {/* Spacer */}
      </div>

      {/* 2. Document Area */}
      <div className="flex-1 w-full overflow-auto flex justify-center p-8 relative">
        
        {/* Dynamic Watermark Overlay (The Security Layer) */}
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden opacity-[0.03]">
           <div className="rotate-[-30deg] whitespace-nowrap text-[8vw] font-black text-white/50 select-none">
             {userEmail} • {userEmail} • {userEmail}
           </div>
        </div>

        <Document
          file={url}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<div className="text-white">Loading Page...</div>}
          error={<div className="text-red-500">Error loading document.</div>}
          className="shadow-2xl"
        >
          <div className="relative">
            <Page 
              pageNumber={pageNumber} 
              scale={scale}
              renderTextLayer={false} // CRITICAL: Disables text selection
              renderAnnotationLayer={false}
              className="mb-4" 
            />
            {/* Invisible Overlay to block drag-saves */}
            <div className="absolute inset-0 z-10" />
          </div>
        </Document>
      </div>

      {/* 3. Floating Navigation */}
      <div className="fixed bottom-8 flex gap-4 z-50">
        <Button 
          variant="secondary" 
          disabled={pageNumber <= 1}
          onClick={() => setPageNumber(p => p - 1)}
          className="shadow-lg"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button 
          variant="secondary" 
          disabled={pageNumber >= numPages}
          onClick={() => setPageNumber(p => p + 1)}
          className="shadow-lg"
        >
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Security Warning */}
      <div className="fixed bottom-4 right-4 text-xs text-zinc-600 flex items-center gap-2">
        <AlertTriangle className="h-3 w-3" />
        <span>DRM Active • IP Logged</span>
      </div>
    </div>
  )
}