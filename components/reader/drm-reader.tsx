"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ShieldCheckIcon } from "@/components/icons/legal-icons"
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  List,
  Settings,
  Home,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface Material {
  id: string
  title: string
  total_pages: number
}

interface Progress {
  current_page: number
  bookmarks: number[]
  highlights: { page: number; text: string; color: string }[]
}

interface DRMReaderProps {
  material: Material
  userEmail: string
  initialProgress: Progress | null
}

// Sample content for demonstration
const generatePageContent = (page: number, title: string) => {
  const sections = [
    {
      heading: "Introduction to Legal Concepts",
      content: `This chapter provides a comprehensive overview of the fundamental legal principles that form the basis of ${title}. Understanding these concepts is crucial for any law student preparing for judiciary examinations.`,
    },
    {
      heading: "Key Definitions",
      content:
        "The following definitions are essential for understanding the legal framework discussed in this material. Each term has been carefully explained with relevant case law references.",
    },
    {
      heading: "Landmark Cases",
      content:
        "This section covers significant judicial precedents that have shaped the interpretation and application of law in Indian courts. Special emphasis has been given to Supreme Court judgments.",
    },
    {
      heading: "Practice Questions",
      content:
        "Test your understanding with these carefully curated questions based on previous judiciary examination patterns. Detailed answers are provided in the appendix.",
    },
  ]

  const sectionIndex = page % sections.length
  return sections[sectionIndex]
}

export function DRMReader({ material, userEmail, initialProgress }: DRMReaderProps) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(initialProgress?.current_page || 1)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const [bookmarks, setBookmarks] = useState<number[]>(initialProgress?.bookmarks || [])
  const [showTOC, setShowTOC] = useState(false)
  const [securityWarning, setSecurityWarning] = useState<string | null>(null)

  const isBookmarked = bookmarks.includes(currentPage)
  const pageContent = generatePageContent(currentPage, material.title)

  // DRM: Disable right-click
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      setSecurityWarning("Right-click is disabled for content protection")
      setTimeout(() => setSecurityWarning(null), 3000)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable screenshot shortcuts
      if (
        (e.ctrlKey && e.key === "p") || // Print
        (e.ctrlKey && e.key === "s") || // Save
        (e.ctrlKey && e.shiftKey && e.key === "s") || // Screenshot
        e.key === "PrintScreen"
      ) {
        e.preventDefault()
        setSecurityWarning("This action is disabled for content protection")
        setTimeout(() => setSecurityWarning(null), 3000)
      }
    }

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      setSecurityWarning("Copying is disabled for content protection")
      setTimeout(() => setSecurityWarning(null), 3000)
    }

    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("copy", handleCopy)

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("copy", handleCopy)
    }
  }, [])

  // Save progress
  const saveProgress = useCallback(async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await supabase.from("user_progress").upsert(
        {
          user_id: user.id,
          material_id: material.id,
          current_page: currentPage,
          total_pages: material.total_pages,
          bookmarks: bookmarks,
          highlights: [],
          last_accessed: new Date().toISOString(),
        },
        {
          onConflict: "user_id,material_id",
        },
      )
    }
  }, [currentPage, bookmarks, material.id, material.total_pages])

  useEffect(() => {
    const timer = setTimeout(() => {
      saveProgress()
    }, 2000)
    return () => clearTimeout(timer)
  }, [currentPage, saveProgress])

  const goToPage = (page: number) => {
    if (page >= 1 && page <= material.total_pages) {
      setCurrentPage(page)
    }
  }

  const toggleBookmark = () => {
    setBookmarks((prev) =>
      prev.includes(currentPage) ? prev.filter((p) => p !== currentPage) : [...prev, currentPage],
    )
  }

  const currentTime = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col select-none",
        isDarkMode ? "bg-[#0B1017] text-gray-100" : "bg-[#F8F9FB] text-gray-900",
      )}
    >
      {/* Security Warning Toast */}
      {securityWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <ShieldCheckIcon className="h-4 w-4" />
          {securityWarning}
        </div>
      )}

      {/* Top Bar */}
      <header
        className={cn(
          "sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b",
          isDarkMode ? "bg-[#0B1017]/95 border-gray-800" : "bg-white/95 border-gray-200",
          "backdrop-blur-sm",
        )}
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/study-materials")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="hidden sm:block">
            <h1 className="font-medium text-sm line-clamp-1">{material.title}</h1>
            <p className="text-xs text-muted-foreground">
              Page {currentPage} of {material.total_pages}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Bookmark Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleBookmark}>
            {isBookmarked ? <BookmarkCheck className="h-5 w-5 text-accent" /> : <Bookmark className="h-5 w-5" />}
          </Button>

          {/* Table of Contents */}
          <Sheet open={showTOC} onOpenChange={setShowTOC}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <List className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className={isDarkMode ? "bg-[#0B1017] border-gray-800" : ""}>
              <SheetHeader>
                <SheetTitle>Table of Contents</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-2">
                {Array.from({ length: Math.ceil(material.total_pages / 20) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      goToPage(i * 20 + 1)
                      setShowTOC(false)
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg transition-colors",
                      isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100",
                    )}
                  >
                    <p className="font-medium">Chapter {i + 1}</p>
                    <p className="text-sm text-muted-foreground">
                      Pages {i * 20 + 1}-{Math.min((i + 1) * 20, material.total_pages)}
                    </p>
                  </button>
                ))}
              </div>

              {bookmarks.length > 0 && (
                <>
                  <h3 className="font-semibold mt-8 mb-4">Bookmarks</h3>
                  <div className="space-y-2">
                    {bookmarks
                      .sort((a, b) => a - b)
                      .map((page) => (
                        <button
                          key={page}
                          onClick={() => {
                            goToPage(page)
                            setShowTOC(false)
                          }}
                          className={cn(
                            "w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2",
                            isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100",
                          )}
                        >
                          <BookmarkCheck className="h-4 w-4 text-accent" />
                          <span>Page {page}</span>
                        </button>
                      ))}
                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>

          {/* Settings */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="p-3">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Dark Mode</span>
                  <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Font Size</span>
                    <span className="text-sm text-muted-foreground">{fontSize}px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent"
                      onClick={() => setFontSize((prev) => Math.max(12, prev - 2))}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Slider
                      value={[fontSize]}
                      onValueChange={([v]) => setFontSize(v)}
                      min={12}
                      max={24}
                      step={2}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent"
                      onClick={() => setFontSize((prev) => Math.min(24, prev + 2))}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/")}>
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center px-4 py-8 relative">
        {/* DRM Watermark Overlay */}
        <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center opacity-[0.03]">
          <div className="text-center transform -rotate-45">
            <p className="text-2xl font-bold">{userEmail}</p>
            <p className="text-lg">{currentTime}</p>
            <p className="text-sm">Judicially Legal Ways - Protected Content</p>
          </div>
        </div>

        {/* Page Content */}
        <article
          className={cn(
            "max-w-3xl w-full rounded-xl shadow-lg p-8 md:p-12 relative",
            isDarkMode ? "bg-gray-900/50" : "bg-white",
          )}
          style={{ fontSize: `${fontSize}px` }}
        >
          {/* DRM Security Badge */}
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="gap-1 text-xs">
              <ShieldCheckIcon className="h-3 w-3" />
              DRM Protected
            </Badge>
          </div>

          {/* Page Number */}
          <div className="text-center text-sm text-muted-foreground mb-8">Page {currentPage}</div>

          {/* Content */}
          <h2 className="font-serif text-2xl font-bold mb-6" style={{ fontSize: `${fontSize + 8}px` }}>
            {pageContent.heading}
          </h2>

          <div className="space-y-4 leading-relaxed">
            <p>{pageContent.content}</p>
            <p>
              Section {currentPage}.1 - This material is protected by Digital Rights Management (DRM) technology.
              Unauthorized copying, sharing, or distribution is strictly prohibited and may result in legal action.
            </p>
            <p>
              Section {currentPage}.2 - The content has been carefully curated by legal experts and is regularly updated
              to reflect the latest amendments and judicial interpretations. Each topic includes relevant case laws from
              the Supreme Court and various High Courts.
            </p>
            <p>
              Section {currentPage}.3 - Students are advised to read each section carefully and make notes for revision.
              The bookmark feature allows you to mark important pages for quick reference during your examination
              preparation.
            </p>
          </div>

          {/* Page Footer */}
          <div className="mt-12 pt-6 border-t text-center text-xs text-muted-foreground">
            <p>
              © Judicially Legal Ways | {material.title} | Page {currentPage}
            </p>
          </div>
        </article>
      </main>

      {/* Bottom Navigation */}
      <footer
        className={cn(
          "sticky bottom-0 z-40 flex items-center justify-between px-4 h-16 border-t",
          isDarkMode ? "bg-[#0B1017]/95 border-gray-800" : "bg-white/95 border-gray-200",
          "backdrop-blur-sm",
        )}
      >
        <Button
          variant="outline"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <div className="flex items-center gap-4">
          <input
            type="number"
            value={currentPage}
            onChange={(e) => goToPage(Number.parseInt(e.target.value) || 1)}
            className={cn(
              "w-16 text-center rounded-lg border py-1",
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-200",
            )}
            min={1}
            max={material.total_pages}
          />
          <span className="text-sm text-muted-foreground">of {material.total_pages}</span>
        </div>

        <Button
          variant="outline"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= material.total_pages}
          className="gap-2"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </footer>
    </div>
  )
}
