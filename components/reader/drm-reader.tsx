"use client"

import { useState, useEffect } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { Loader2, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// Worker for PDF.js (Essential for Next.js)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface DRMReaderProps {
  filePath: string
  userEmail: string
}

export function DRMReader({ filePath, userEmail }: DRMReaderProps) {
  const [url, setUrl] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadSecureUrl() {
      // Create a signed URL valid for only 60 seconds
      // This prevents users from sharing the link
      const { data, error } = await supabase.storage
        .from('protected_files')
        .createSignedUrl(filePath, 60) 

      if (data) setUrl(data.signedUrl)
      setLoading(false)
    }
    loadSecureUrl()
  }, [filePath])

  // Prevent Right Click
  useEffect(() => {
    const handleContext = (e: MouseEvent) => e.preventDefault()
    document.addEventListener('contextmenu', handleContext)
    return () => document.removeEventListener('contextmenu', handleContext)
  }, [])

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-slate-50 min-h-screen select-none print:hidden">
      
      {/* Dynamic Watermark Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center opacity-[0.03] overflow-hidden">
        <div className="rotate-45 transform text-9xl font-bold text-black whitespace-nowrap">
           {userEmail} {userEmail} {userEmail}
        </div>
      </div>

      <div className="flex flex-col items-center py-8 gap-4">
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<Loader2 className="animate-spin" />}
          error={<div className="text-red-500">Failed to load secure document.</div>}
        >
          {Array.from(new Array(numPages), (el, index) => (
            <div key={`page_${index + 1}`} className="relative mb-4 shadow-lg">
              <Page 
                pageNumber={index + 1} 
                renderTextLayer={false} // Disable text selection
                renderAnnotationLayer={false} 
                width={800}
              />
              {/* Individual Page Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                <p className="text-lg font-bold text-slate-900 -rotate-45">{userEmail}</p>
              </div>
            </div>
          ))}
        </Document>
      </div>

      {/* Screen Capture Warning (Visual Deterrent) */}
      <div className="fixed bottom-4 right-4 bg-red-500/10 text-red-600 px-3 py-1 text-xs rounded-full border border-red-200 backdrop-blur-md">
        <AlertTriangle className="inline w-3 h-3 mr-1" />
        DRM Protected • IP Logged
      </div>
    </div>
  )
}