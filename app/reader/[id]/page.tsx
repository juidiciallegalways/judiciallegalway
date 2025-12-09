"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Document, Page, pdfjs } from "react-pdf"
import { Loader2, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

// Initialize Worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function ReaderPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const supabase = createClient()
  const [url, setUrl] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDoc() {
      console.log("Loading document...", id)
      
      // 1. Fetch Metadata (using file_url column)
      const { data: fileData, error } = await supabase
        .from('case_files')
        .select('file_url')
        .eq('id', id)
        .single()

      if (error || !fileData) {
        console.error("DB Error:", error)
        toast.error("Document not found in database")
        return
      }

      console.log("Found file path:", fileData.file_url)

      // 2. Generate Signed URL
      const { data: signed, error: signError } = await supabase
        .storage
        .from('protected_files')
        .createSignedUrl(fileData.file_url, 60)

      if (signError) {
        console.error("Sign Error:", signError)
        toast.error("Access Denied (DRM)")
        return
      }

      setUrl(signed.signedUrl)
      setLoading(false)
    }

    if (id) loadDoc()
  }, [id])

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-8">
      <div className="w-full max-w-4xl flex justify-between mb-4">
        <Button variant="ghost" className="text-white" onClick={() => router.back()}><ChevronLeft /> Back</Button>
        <span>Secure View</span>
      </div>
      
      {/* PDF View */}
      <Document file={url} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
        {Array.from(new Array(numPages), (_, index) => (
          <Page 
            key={`page_${index + 1}`} 
            pageNumber={index + 1} 
            renderTextLayer={false} // Disable Copy
            renderAnnotationLayer={false}
            className="mb-4 shadow-lg"
            width={800}
          />
        ))}
      </Document>
    </div>
  )
}