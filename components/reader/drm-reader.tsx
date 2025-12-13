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
  itemId: string
  itemType: 'case_file' | 'book'
}

export function DRMReader({ filePath, userEmail, itemId, itemType }: DRMReaderProps) {
  const [url, setUrl] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function verifyAccessAndLoadUrl() {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        // Check if user has purchased this item or if it's free
        const { data: itemData } = await supabase
          .from(itemType === 'case_file' ? 'case_files' : 'books')
          .select('price')
          .eq('id', itemId)
          .single()

        // If item is free (price = 0), allow access
        if (itemData?.price === 0) {
          setHasAccess(true)
        } else {
          // Check purchase
          const { data: purchaseData } = await supabase
            .from('purchases')
            .select('id')
            .eq('user_id', user.id)
            .eq('item_type', itemType)
            .eq('item_id', itemId)
            .eq('payment_status', 'completed')
            .single()

          setHasAccess(!!purchaseData)
        }

        if (hasAccess || itemData?.price === 0) {
          // Create a signed URL valid for only 60 seconds
          const { data, error } = await supabase.storage
            .from('protected_files')
            .createSignedUrl(filePath, 60)

          if (data) setUrl(data.signedUrl)
        }
      } catch (error) {
        console.error('Error verifying access:', error)
      } finally {
        setLoading(false)
      }
    }
    verifyAccessAndLoadUrl()
  }, [filePath, itemId, itemType, supabase, hasAccess])

  // Prevent Right Click
  useEffect(() => {
    const handleContext = (e: MouseEvent) => e.preventDefault()
    document.addEventListener('contextmenu', handleContext)
    return () => document.removeEventListener('contextmenu', handleContext)
  }, [])

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">You need to purchase this content to access it.</p>
        <button 
          onClick={() => window.history.back()} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Go Back
        </button>
      </div>
    )
  }

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