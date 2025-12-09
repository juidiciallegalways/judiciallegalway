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

// Get user IP (simplified - in production use server-side)
async function getUserInfo() {
  try {
    const res = await fetch('https://api.ipify.org?format=json')
    const data = await res.json()
    return data.ip || 'unknown'
  } catch {
    return 'unknown'
  }
}

export default function ReaderPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const supabase = createClient()
  const [url, setUrl] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string>("")
  const [userIp, setUserIp] = useState<string>("")
  const [userId, setUserId] = useState<string>("")

  useEffect(() => {
    async function loadDoc() {
      console.log("Loading document...", id)
      
      // 1. Check if user has purchased this case file
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Please login to access this document")
        router.push("/auth/login?next=/reader/" + id)
        return
      }

      // 2. Check purchase
      const { data: purchase } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('item_type', 'case_file')
        .eq('item_id', id)
        .eq('payment_status', 'completed')
        .single()

      if (!purchase && id) {
        // Check if it's free (price = 0)
        const { data: caseFile } = await supabase
          .from('case_files')
          .select('price, is_premium')
          .eq('id', id)
          .single()
        
        if (caseFile && caseFile.price > 0) {
          toast.error("Please purchase this case file to access")
          router.push("/case-files/" + id)
          return
        }
      }

      // 3. Fetch Metadata (using file_path column)
      const { data: fileData, error } = await supabase
        .from('case_files')
        .select('file_path')
        .eq('id', id)
        .single()

      if (error || !fileData || !fileData.file_path) {
        console.error("DB Error:", error)
        toast.error("Document not found in database")
        return
      }

      console.log("Found file path:", fileData.file_path)

      // 4. Generate Signed URL
      const { data: signed, error: signError } = await supabase
        .storage
        .from('protected_files')
        .createSignedUrl(fileData.file_path, 60)

      if (signError) {
        console.error("Sign Error:", signError)
        toast.error("Access Denied (DRM)")
        return
      }

      setUrl(signed.signedUrl)
      
      // Get user info for watermark (user already fetched above)
      if (user) {
        setUserEmail(user.email || "User")
        setUserId(user.id.substring(0, 8))
        const ip = await getUserInfo()
        setUserIp(ip)
        
        // Log access
        await supabase.from('activity_logs').insert({
          user_id: user.id,
          action: 'viewed_case_file',
          details: { case_file_id: id },
          ip_address: ip,
          device_info: navigator.userAgent
        })
      }
      
      setLoading(false)
    }

    if (id) loadDoc()
  }, [id, router, supabase])

  // Prevent right-click, copy, print
  useEffect(() => {
    const preventContext = (e: MouseEvent) => e.preventDefault()
    const preventCopy = (e: ClipboardEvent) => e.preventDefault()
    const preventPrint = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') e.preventDefault()
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'a')) e.preventDefault()
    }
    const preventSelect = () => window.getSelection()?.removeAllRanges()
    
    document.addEventListener('contextmenu', preventContext)
    document.addEventListener('copy', preventCopy)
    document.addEventListener('keydown', preventPrint)
    document.addEventListener('selectstart', preventSelect)
    
    return () => {
      document.removeEventListener('contextmenu', preventContext)
      document.removeEventListener('copy', preventCopy)
      document.removeEventListener('keydown', preventPrint)
      document.removeEventListener('selectstart', preventSelect)
    }
  }, [])

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>

  const watermarkText = `${userEmail} • ${userId} • ${new Date().toISOString().split('T')[0]} • ${userIp}`

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-8 relative select-none">
      {/* Dynamic Watermark Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden opacity-[0.04]">
        <div className="rotate-[-30deg] whitespace-nowrap text-[6vw] font-black text-white select-none">
          {watermarkText} • {watermarkText} • {watermarkText}
        </div>
      </div>

      <div className="w-full max-w-4xl flex justify-between mb-4 relative z-10">
        <Button variant="ghost" className="text-white" onClick={() => router.back()}><ChevronLeft /> Back</Button>
        <span className="text-xs bg-red-500/20 px-3 py-1 rounded-full border border-red-500/50">
          DRM Protected • IP: {userIp}
        </span>
      </div>
      
      {/* PDF View */}
      <div className="relative z-10">
        <Document file={url} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
          {Array.from(new Array(numPages), (_, index) => (
            <div key={`page_${index + 1}`} className="relative mb-4 shadow-lg">
              <Page 
                pageNumber={index + 1} 
                renderTextLayer={false} // Disable Copy
                renderAnnotationLayer={false}
                className="mb-4"
                width={800}
              />
              {/* Per-page watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                <p className="text-lg font-bold text-white -rotate-45">{userEmail} • {userId}</p>
              </div>
            </div>
          ))}
        </Document>
      </div>
    </div>
  )
}