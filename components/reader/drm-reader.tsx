"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Document, Page, pdfjs } from "react-pdf"
import { Loader2, AlertTriangle, FileText, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// Configure PDF.js worker
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString()
}

interface DRMReaderProps {
  filePath: string
  userEmail: string
  itemId: string
  itemType: 'case_file' | 'book'
  itemTitle?: string
  itemData?: any
}

interface UserInfo {
  email: string
  fullName: string
  userId: string
  phone: string
  ipAddress: string
  timestamp: string
  deviceInfo: string
  sessionId: string
  realIP: string
}

export function DRMReader({ filePath, userEmail, itemId, itemType, itemTitle, itemData }: DRMReaderProps) {
  const router = useRouter()
  const [url, setUrl] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [riskScore, setRiskScore] = useState(0)
  const [watermarkIntensity, setWatermarkIntensity] = useState(0.08)
  const [showWarningToast, setShowWarningToast] = useState(true)
  const [pageOffset, setPageOffset] = useState(0)
  const [isRecordingDetected, setIsRecordingDetected] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [showPageCounter, setShowPageCounter] = useState(false)
  const [renderScale] = useState(1.5) // Fixed render scale for quality
  const supabase = createClient()
  
  // Use ref for timeout to avoid dependency issues
  const pageCounterTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Smooth zoom handler - uses CSS transform instead of re-rendering
  const handleZoom = (newScale: number) => {
    setScale(newScale)
  }
  
  // Calculate CSS transform scale based on user zoom
  const getTransformScale = () => {
    return scale / renderScale
  }

  // Generate session-specific randomization
  const [sessionRandoms] = useState(() => ({
    rotation: Math.random() * 15 + 30, // 30-45 degrees
    tileSpacing: Math.random() * 50 + 150, // 150-200px spacing
    backgroundOffset: Math.random() * 100
  }))

  // Get comprehensive user information for watermarking
  const getUserInfo = async (user: any): Promise<UserInfo> => {
    // Get user profile with phone number
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('id', user.id)
      .single()

    // Generate session ID
    const sessionId = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    // Get full email (no masking for maximum deterrent)
    const email = user.email || userEmail
    
    // Get device and browser info
    const userAgent = navigator.userAgent
    const browser = userAgent.includes('Chrome') ? 'Chrome' : 
                   userAgent.includes('Firefox') ? 'Firefox' : 
                   userAgent.includes('Safari') ? 'Safari' : 'Browser'
    const os = userAgent.includes('Windows') ? 'Windows' : 
              userAgent.includes('Mac') ? 'macOS' : 
              userAgent.includes('Linux') ? 'Linux' : 'OS'
    const deviceInfo = `${browser}/${os}`
    
    // Get real IP address (in production, this would come from server)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const mockIP = `192.168.1.${Math.floor(Math.random() * 254) + 1}` // Mock dynamic IP
    
    // Generate user license key
    const licenseKey = `JLW-${user.id.slice(0, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`
    
    return {
      email: email,
      fullName: profile?.full_name || 'Unknown User',
      userId: licenseKey,
      phone: profile?.phone || '+91-XXXXXXXXXX',
      ipAddress: timezone,
      realIP: mockIP,
      timestamp: new Date().toLocaleString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      deviceInfo: deviceInfo,
      sessionId: sessionId
    }
  }

  // Risk scoring system
  const updateRiskScore = (action: string, points: number) => {
    const newScore = Math.min(riskScore + points, 100)
    setRiskScore(newScore)
    
    // Adjust watermark intensity based on risk
    if (newScore > 60) {
      setWatermarkIntensity(0.20)
    } else if (newScore > 30) {
      setWatermarkIntensity(0.12)
    }
    
    // Log risk event
    if (userInfo) {
      supabase.from('activity_logs').insert({
        user_id: userInfo.userId,
        action: `Risk Event: ${action}`,
        details: {
          risk_action: action,
          risk_points: points,
          total_risk_score: newScore,
          item_type: itemType,
          item_id: itemId,
          session_id: userInfo.sessionId,
          timestamp: new Date().toISOString()
        }
      })
    }
  }

  useEffect(() => {
    async function verifyAccessAndLoadUrl() {
      try {
        // Get current user with longer timeout
        const userPromise = supabase.auth.getUser()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 10000) // Increased to 10 seconds
        )
        
        const { data: { user } } = await Promise.race([userPromise, timeoutPromise]) as any
        if (!user) {
          console.log('No user found, redirecting to login')
          setLoading(false)
          return
        }

        // Get comprehensive user info for watermarking
        const userInfoData = await getUserInfo(user)
        setUserInfo(userInfoData)

        // Log access attempt for security tracking with enhanced details
        try {
          await supabase.from('activity_logs').insert({
            user_id: user.id,
            action: `Accessed ${itemType}: ${itemId}`,
            details: {
              item_type: itemType,
              item_id: itemId,
              file_path: filePath,
              device_info: userInfoData.deviceInfo,
              timestamp: userInfoData.timestamp,
              session_id: userInfoData.sessionId,
              user_email: userInfoData.email,
              user_phone: userInfoData.phone,
              user_license: userInfoData.userId,
              ip_address: userInfoData.realIP,
              page_access_time: new Date().toISOString()
            }
          })
        } catch (logError) {
          console.warn('Failed to log access attempt:', logError)
          // Continue execution even if logging fails
        }

        // Check item data with longer timeout
        const tableName = itemType === 'case_file' ? 'case_files' : 'books'
        
        const itemPromise = supabase
          .from(tableName)
          .select('price, file_url, is_published')
          .eq('id', itemId)
          .single()
        
        const itemTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Item query timeout')), 8000) // Increased to 8 seconds
        )
        
        const { data: itemData, error: itemError } = await Promise.race([itemPromise, itemTimeoutPromise]) as any
        
        if (itemError) {
          console.error('Item query error:', itemError)
          setLoading(false)
          return
        }

        // If item is free (price = 0), allow access
        let hasAccessNow = false
        
        if (itemData?.price === 0) {
          hasAccessNow = true
          setHasAccess(true)
        } else {
          // Check purchase with longer timeout
          const purchasePromise = supabase
            .from('purchases')
            .select('id')
            .eq('user_id', user.id)
            .eq('item_type', itemType)
            .eq('item_id', itemId)
            .eq('payment_status', 'completed')
            .single()
          
          const purchaseTimeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Purchase query timeout')), 8000) // Increased to 8 seconds
          )
          
          const { data: purchaseResult } = await Promise.race([purchasePromise, purchaseTimeoutPromise]) as any
          
          hasAccessNow = !!purchaseResult
          setHasAccess(hasAccessNow)
        }
        
        if (hasAccessNow) {
          // Try to create a signed URL from protected_files first
          let urlData = null
          let urlError = null
          
          try {
            const { data, error } = await supabase.storage
              .from('protected_files')
              .createSignedUrl(filePath, 60)
            urlData = data
            urlError = error
          } catch (error) {
            console.warn('Protected files storage failed:', error)
            urlError = error
          }
          
          // If protected_files fails, try public bucket
          if (urlError || !urlData?.signedUrl) {
            try {
              const { data } = supabase.storage
                .from('public')
                .getPublicUrl(filePath)
              urlData = { signedUrl: data.publicUrl }
              urlError = null
            } catch (error) {
              console.error('Public bucket also failed:', error)
              urlError = error
            }
          }
          
          if (urlData?.signedUrl) {
            setUrl(urlData.signedUrl)
          } else {
            console.error('Failed to get file URL')
          }
        }
      } catch (error: any) {
        console.error('Error verifying access:', error)
        if (error?.message === 'Auth timeout') {
          setAuthError('Authentication timed out. Please refresh the page and try again.')
        } else {
          setAuthError('Failed to verify access. Please check your connection and try again.')
        }
        setLoading(false)
        return
      } finally {
        setLoading(false)
      }
    }
    verifyAccessAndLoadUrl()
  }, [filePath, itemId, itemType])

  // Show page counter when zoom changes
  useEffect(() => {
    setShowPageCounter(true)
    if (pageCounterTimeoutRef.current) clearTimeout(pageCounterTimeoutRef.current)
    pageCounterTimeoutRef.current = setTimeout(() => setShowPageCounter(false), 2000)
    
    return () => {
      if (pageCounterTimeoutRef.current) clearTimeout(pageCounterTimeoutRef.current)
    }
  }, [scale])

  // Enhanced Security Measures with Better UX
  useEffect(() => {
    // Hide warning toast after 5 seconds
    const toastTimer = setTimeout(() => {
      setShowWarningToast(false)
    }, 5000)

    // Screen recording detection (less intrusive)
    const detectScreenRecording = () => {
      const mediaDevices = navigator.mediaDevices
      if (mediaDevices && mediaDevices.getDisplayMedia) {
        const originalGetDisplayMedia = mediaDevices.getDisplayMedia
        mediaDevices.getDisplayMedia = function(...args) {
          setIsRecordingDetected(true)
          updateRiskScore('Screen recording detected', 50)
          // Less aggressive response - just increase watermarks
          setWatermarkIntensity(0.25)
          setTimeout(() => {
            setIsRecordingDetected(false)
            setWatermarkIntensity(0.08)
          }, 10000) // 10 seconds instead of permanent
          return originalGetDisplayMedia.apply(this, args)
        }
      }
    }

    // Subtle watermark movement (every 15 seconds)
    const moveWatermark = () => {
      // Dynamic page offset for tiled watermarks
      setPageOffset(Math.random() * 40 - 20) // -20 to +20 pixels
    }

    // Prevent right-click context menu
    const handleContext = (e: MouseEvent) => e.preventDefault()
    
    // Prevent copy-related keyboard shortcuts and add zoom shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && ['s', 'p', 'c', 'a'].includes(e.key.toLowerCase())) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) ||
        e.key === 'PrintScreen'
      ) {
        e.preventDefault()
        updateRiskScore('Blocked shortcut attempt', 5)
      }
      
      // Zoom shortcuts
      if (e.ctrlKey && e.key === '=') {
        e.preventDefault()
        handleZoom(Math.min(3.0, scale + 0.25))
      }
      if (e.ctrlKey && e.key === '-') {
        e.preventDefault()
        handleZoom(Math.max(0.5, scale - 0.25))
      }
      if (e.ctrlKey && e.key === '0') {
        e.preventDefault()
        handleZoom(1.0)
      }
    }

    // Prevent drag and drop
    const handleDragStart = (e: DragEvent) => e.preventDefault()
    
    // Detect developer tools (non-blocking)
    const detectDevTools = () => {
      const threshold = 160
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        updateRiskScore('Developer tools detected', 10)
        setWatermarkIntensity(Math.min(watermarkIntensity + 0.02, 0.2))
      }
    }

    // Detect rapid scrolling
    let scrollCount = 0
    const detectRapidScroll = () => {
      scrollCount++
      if (scrollCount > 30) {
        updateRiskScore('Rapid scrolling detected', 15)
        scrollCount = 0
      }
    }

    // Track current page based on scroll position
    const updateCurrentPage = () => {
      const pages = document.querySelectorAll('[id^="page-"]')
      const viewportHeight = window.innerHeight
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement
        const rect = page.getBoundingClientRect()
        
        // Check if page is in viewport (at least 50% visible)
        if (rect.top <= viewportHeight * 0.5 && rect.bottom >= viewportHeight * 0.5) {
          setCurrentPage(i + 1)
          break
        }
      }
      
      // Show page counter on scroll
      setShowPageCounter(true)
      if (pageCounterTimeoutRef.current) clearTimeout(pageCounterTimeoutRef.current)
      pageCounterTimeoutRef.current = setTimeout(() => setShowPageCounter(false), 2000)
    }

    const scrollResetInterval = setInterval(() => { scrollCount = 0 }, 10000)

    // Set up intervals
    const moveInterval = setInterval(moveWatermark, 15000) // Move every 15 seconds
    const devToolsInterval = setInterval(detectDevTools, 3000)
    
    // Initialize screen recording detection
    detectScreenRecording()

    // Initial page update after a short delay to ensure DOM is ready
    setTimeout(updateCurrentPage, 1000)

    // Add event listeners
    document.addEventListener('contextmenu', handleContext)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('dragstart', handleDragStart)
    document.addEventListener('selectstart', (e) => e.preventDefault())
    document.addEventListener('scroll', detectRapidScroll)
    document.addEventListener('scroll', updateCurrentPage)
    window.addEventListener('resize', updateCurrentPage)
    
    // Tab switching detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateRiskScore('Tab switched', 3)
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('contextmenu', handleContext)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('dragstart', handleDragStart)
      document.removeEventListener('selectstart', (e) => e.preventDefault())
      document.removeEventListener('scroll', detectRapidScroll)
      document.removeEventListener('scroll', updateCurrentPage)
      window.removeEventListener('resize', updateCurrentPage)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(devToolsInterval)
      clearInterval(scrollResetInterval)
      clearInterval(moveInterval)
      clearTimeout(toastTimer)
    }
  }, [userInfo, itemType, itemId, riskScore, watermarkIntensity, scale])

  if (loading) return (
    <div className="flex flex-col justify-center items-center p-20 text-center">
      <Loader2 className="animate-spin w-8 h-8 mb-4" />
      <p className="text-muted-foreground">Loading document...</p>
      <p className="text-xs text-muted-foreground mt-2">Verifying access permissions</p>
    </div>
  )

  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Authentication Error</h2>
        <p className="text-muted-foreground mb-4">{authError}</p>
        <div className="flex gap-4">
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Refresh Page
          </button>
          <button 
            onClick={() => router.push('/profile?tab=purchases')} 
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">
          {itemType === 'book' 
            ? "You need to purchase this book to access it." 
            : "You need to purchase this content to access it."
          }
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Item Type: {itemType} | Item ID: {itemId}
        </p>
        <button 
          onClick={() => router.push('/profile?tab=purchases')} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Go Back
        </button>
      </div>
    )
  }

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">
          {itemType === 'book' ? 'Book not found or file missing' : 'File not found'}
        </h2>
        <p className="text-muted-foreground mb-4">
          The {itemType === 'book' ? 'book' : 'file'} could not be loaded. Please check if the file exists.
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          File Path: {filePath} | Item Type: {itemType}
        </p>
        <button 
          onClick={() => router.push('/profile?tab=purchases')} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative">
      
      {/* 🚨 Screen Recording Alert */}
      {isRecordingDetected && (
        <div className="fixed top-4 right-4 z-[9999] bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg animate-pulse">
          <div className="text-sm font-medium">Recording Detected - Enhanced Protection Active</div>
        </div>
      )}

      {/* 🍞 Toast Warning (Fades after 5 seconds) */}
      {showWarningToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-accent text-accent-foreground px-6 py-3 rounded-lg shadow-lg transition-opacity duration-500">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Protected Content - Licensed to {userInfo?.fullName}</span>
          </div>
        </div>
      )}

      {/* 📖 Sticky Header Bar - Website Colors (Navy Blue & Gold) */}
      <div className="sticky top-0 z-50 bg-[#22334A] dark:bg-card text-primary-foreground dark:text-foreground px-4 sm:px-6 py-4 flex items-center justify-between border-b border-primary/20 dark:border-border shadow-md">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Back Button for Mobile */}
          <button
            onClick={() => router.push('/profile?tab=purchases')}
            className="lg:hidden p-2 hover:bg-accent/20 dark:hover:bg-muted rounded transition-colors shrink-0"
            title="Go Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          
          {/* Document Name with Ellipsis */}
          <h1 className="font-semibold text-base sm:text-lg truncate">
            {itemTitle || (itemType === 'book' ? 'Legal Book' : 'Case File')}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-primary/10 dark:bg-muted/50 rounded-lg p-1 border border-accent/20 dark:border-border">
            <button 
              onClick={() => handleZoom(Math.max(0.5, scale - 0.25))}
              className="p-2 hover:bg-accent/20 dark:hover:bg-muted rounded transition-colors" 
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-sm font-medium min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button 
              onClick={() => handleZoom(Math.min(3.0, scale + 0.25))}
              className="p-2 hover:bg-accent/20 dark:hover:bg-muted rounded transition-colors" 
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleZoom(1.0)}
              className="p-2 hover:bg-accent/20 dark:hover:bg-muted rounded transition-colors" 
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 🔒 Content Protection Warning Bar - NOT Sticky */}
      <div className="bg-accent/10 dark:bg-accent/20 border-l-4 border-accent px-4 sm:px-6 py-3 border-b border-accent/30 dark:border-accent/40">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground dark:text-accent-foreground">Content Protected</span>
        </div>
        <p className="text-xs text-muted-foreground dark:text-accent-foreground/80 mt-1">
          This document is protected and monitored. Screenshots are prohibited.
        </p>
      </div>

      {/* 🔒 Clean Diagonal Background Watermark (Full Screen) */}
      <div 
        className="fixed inset-0 pointer-events-none z-5"
        style={{
          opacity: watermarkIntensity * 0.1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='500' height='250' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' font-family='Inter,sans-serif' font-size='14' font-weight='500' fill='%23718096' text-anchor='middle' transform='rotate(-45 250 125)'%3EJUDICIALLY LEGAL WAYS • ${userInfo?.fullName?.replace(/[^a-zA-Z0-9\s]/g, '')} • ${userInfo?.email?.replace(/[^a-zA-Z0-9@.]/g, '')}%3C/text%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundPosition: `${pageOffset}px ${pageOffset}px`
        }}
      />

      {/* 📄 Main Content Area - Centered */}
      <div className="relative z-20 w-full px-4 py-8 flex justify-center">
        <div 
          style={{ 
            transform: `scale(${getTransformScale()})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease-out'
          }}
        >
          <Document
          file={url}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
          }
          error={
            <div className="text-destructive p-6 bg-destructive/10 rounded-lg text-center">
              Failed to load document
            </div>
          }
        >
          <div className="flex flex-col items-center">
            {Array.from(new Array(numPages), (_, index) => (
              <div 
                key={`page_${index + 1}`} 
                className="relative mb-8 bg-card shadow-lg overflow-hidden"
                id={`page-${index + 1}`}
              >
                <Page 
                  pageNumber={index + 1} 
                  renderTextLayer={false}
                  renderAnnotationLayer={false} 
                  scale={renderScale}
                  className="block mx-auto"
                  loading={
                    <div className="flex items-center justify-center min-h-[600px] bg-muted/20">
                      <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
                    </div>
                  }
                />
                
                {/* 🔒 Clean Diagonal Watermarks Pattern - Better Spacing */}
                <div className="absolute inset-0 pointer-events-none z-10">
                  
                  {/* Row 1 - Top Section */}
                  <div 
                    className="absolute top-[10%] left-[5%] text-base font-medium text-muted-foreground/20"
                    style={{ transform: `rotate(-45deg)` }}
                  >
                    JUDICIALLY LEGAL WAYS
                  </div>
                  
                  <div 
                    className="absolute top-[10%] right-[15%] text-base font-medium text-muted-foreground/20"
                    style={{ transform: `rotate(-45deg)` }}
                  >
                    {userInfo?.fullName}
                  </div>
                  
                  {/* Row 2 */}
                  <div 
                    className="absolute top-[25%] left-[15%] text-base font-medium text-muted-foreground/20"
                    style={{ transform: `rotate(-45deg)` }}
                  >
                    {userInfo?.email}
                  </div>
                  
                  <div 
                    className="absolute top-[25%] right-[5%] text-base font-medium text-muted-foreground/20"
                    style={{ transform: `rotate(-45deg)` }}
                  >
                    PROTECTED CONTENT
                  </div>
                  
                  {/* Row 3 - Middle */}
                  <div 
                    className="absolute top-[40%] left-[5%] text-base font-medium text-muted-foreground/20"
                    style={{ transform: `rotate(-45deg)` }}
                  >
                    {userInfo?.phone}
                  </div>
                  
                  <div 
                    className="absolute top-[40%] right-[15%] text-base font-medium text-muted-foreground/20"
                    style={{ transform: `rotate(-45deg)` }}
                  >
                    JUDICIALLY LEGAL WAYS
                  </div>
                  
                  {/* Row 4 */}
                  <div 
                    className="absolute top-[55%] left-[15%] text-base font-medium text-muted-foreground/20"
                    style={{ transform: `rotate(-45deg)` }}
                  >
                    IP: {userInfo?.realIP}
                  </div>
                  
                  <div 
                    className="absolute top-[55%] right-[5%] text-base font-medium text-muted-foreground/20"
                    style={{ transform: `rotate(-45deg)` }}
                  >
                    {userInfo?.userId}
                  </div>
                  
                  {/* Row 5 - Bottom */}
                  <div 
                    className="absolute top-[70%] left-[5%] text-base font-medium text-muted-foreground/20"
                    style={{ transform: `rotate(-45deg)` }}
                  >
                    JUDICIALLY LEGAL WAYS
                  </div>
                  
                  <div 
                    className="absolute top-[70%] right-[15%] text-base font-medium text-muted-foreground/20"
                    style={{ transform: `rotate(-45deg)` }}
                  >
                    Session: {userInfo?.sessionId}
                  </div>
                  
                  {/* Row 6 */}
                  <div 
                    className="absolute top-[85%] left-[15%] text-base font-medium text-muted-foreground/20"
                    style={{ transform: `rotate(-45deg)` }}
                  >
                    {userInfo?.timestamp?.split(' ')[0]}
                  </div>
                  
                  <div 
                    className="absolute top-[85%] right-[5%] text-base font-medium text-muted-foreground/20"
                    style={{ transform: `rotate(-45deg)` }}
                  >
                    PROTECTED
                  </div>

                  {/* 🔍 Forensic Corner Markers (Nearly Invisible) */}
                  <div className="absolute top-1 left-1 pointer-events-none opacity-[0.03] text-[6px] text-muted-foreground">
                    {userInfo?.userId?.slice(0, 4)}
                  </div>
                  <div className="absolute top-1 right-1 pointer-events-none opacity-[0.03] text-[6px] text-muted-foreground">
                    P{index + 1}
                  </div>
                  <div className="absolute bottom-1 left-1 pointer-events-none opacity-[0.03] text-[6px] text-muted-foreground">
                    {userInfo?.sessionId?.slice(0, 3)}
                  </div>
                  <div className="absolute bottom-1 right-1 pointer-events-none opacity-[0.03] text-[6px] text-muted-foreground">
                    {userInfo?.timestamp?.split(' ')[0]?.slice(-2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Document>
        </div>
      </div>

      {/* 📊 Page Counter (Bottom Center) - Auto-hide, No User Name */}
      <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30 transition-opacity duration-300 ${showPageCounter ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="bg-[#22334A] dark:bg-card text-primary-foreground dark:text-foreground px-4 py-2 rounded-full shadow-lg border border-accent/20 dark:border-border flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">
            Page {currentPage} of {numPages}
          </span>
        </div>
      </div>

      {/* 🔒 Invisible Forensic Data */}
      <div 
        style={{ display: 'none' }}
        data-user-email={userInfo?.email}
        data-user-phone={userInfo?.phone}
        data-license-key={userInfo?.userId}
        data-ip-address={userInfo?.realIP}
        data-session={userInfo?.sessionId}
        data-timestamp={userInfo?.timestamp}
        data-item={itemId}
        data-risk-score={riskScore}
      />
    </div>
  )
}