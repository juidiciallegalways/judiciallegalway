"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { BookLawIcon } from "@/components/icons/legal-icons"
import { Search, Filter, BookOpen, Lock, CheckCircle, ArrowRight, IndianRupee, X, TrendingUp, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

const categories = [
  { id: "criminal", name: "Criminal Law", count: 85 },
  { id: "civil", name: "Civil Law", count: 72 },
  { id: "constitutional", name: "Constitutional Law", count: 65 },
  { id: "family", name: "Family Law", count: 48 },
  { id: "property", name: "Property Law", count: 54 },
  { id: "corporate", name: "Corporate Law", count: 42 },
  { id: "tax", name: "Tax Law", count: 38 },
  { id: "labor", name: "Labor Law", count: 35 },
  { id: "ipr", name: "Intellectual Property", count: 28 },
  { id: "environmental", name: "Environmental Law", count: 25 },
]

export interface CaseFile {
  id: string
  title: string
  description: string
  case_number: string
  court_name: string
  category: string
  subcategory: string
  year: number
  thumbnail_url: string
  file_url: string
  is_premium: boolean
  price: number
  total_pages: number
  is_published: boolean
  tags: string[]
  created_at?: string
}

interface UserProgress {
  case_file_id: string
  current_page: number
  total_pages: number
}

// Fallback data in case server data is empty
const mockCaseFiles: CaseFile[] = [
  {
    id: "1",
    title: "Kesavananda Bharati v. State of Kerala",
    description: "Landmark judgment that established the basic structure doctrine of the Indian Constitution.",
    case_number: "AIR 1973 SC 1461",
    court_name: "Supreme Court of India",
    category: "constitutional",
    subcategory: "Fundamental Rights",
    year: 1973,
    thumbnail_url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800",
    file_url: "/files/kesavananda-bharati.pdf",
    is_premium: false,
    price: 0,
    total_pages: 700,
    is_published: true,
    tags: ["Basic Structure", "Constitutional Amendment", "Fundamental Rights", "Landmark"],
  },
]

interface CaseFilesContentProps {
  initialCaseFiles: CaseFile[]
}

export function CaseFilesContent({ initialCaseFiles }: CaseFilesContentProps) {
  const searchParams = useSearchParams()
  
  // 1. Initialize with Server Data (Instant Load)
  const [caseFiles] = useState<CaseFile[]>(
    initialCaseFiles.length > 0 ? initialCaseFiles : mockCaseFiles
  )

  // 2. User specific state (fetched in background)
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({})
  const [purchases, setPurchases] = useState<Set<string>>(new Set())
  
  // 3. UI States
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category") ? [searchParams.get("category")!] : [],
  )
  const [sortBy, setSortBy] = useState("popular")
  const [showPremiumOnly, setShowPremiumOnly] = useState(false)

  // 4. Fetch User Data (Progress & Purchases) silently
  useEffect(() => {
    async function fetchUserData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Run requests in parallel for speed
        const [progressRes, purchasesRes] = await Promise.all([
          supabase
            .from("case_file_progress")
            .select("case_file_id, current_page, total_pages")
            .eq("user_id", user.id),
          supabase
            .from("purchases")
            .select("item_id")
            .eq("user_id", user.id)
            .eq("item_type", "case_file")
            .eq("payment_status", "completed")
        ])

        if (progressRes.data) {
          const progressMap: Record<string, UserProgress> = {}
          progressRes.data.forEach((p) => {
            progressMap[p.case_file_id] = p
          })
          setUserProgress(progressMap)
        }

        if (purchasesRes.data) {
          const purchaseSet = new Set(purchasesRes.data.map((p) => p.item_id))
          setPurchases(purchaseSet)
        }
      }
    }
    fetchUserData()
  }, [])

  // 5. Client-Side Filtering (Instant interactions)
  const filteredCaseFiles = caseFiles.filter((c) => {
    // Search Query
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.case_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.court_name?.toLowerCase().includes(searchQuery.toLowerCase())

    // Category Filter
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(c.category)
    
    // Premium Filter
    const matchesPremium = !showPremiumOnly || c.is_premium

    return matchesSearch && matchesCategory && matchesPremium
  })

  // 6. Sorting Logic
  const sortedCaseFiles = [...filteredCaseFiles].sort((a, b) => {
    if (sortBy === "price-low") return (a.price || 0) - (b.price || 0)
    if (sortBy === "price-high") return (b.price || 0) - (a.price || 0)
    if (sortBy === "newest") return (b.year || 0) - (a.year || 0)
    return 0
  })

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId],
    )
  }

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-semibold text-foreground">Categories</h3>
          {selectedCategories.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedCategories.length} selected
            </Badge>
          )}
        </div>
        <div className="space-y-2">
          {categories.map((category) => (
            <motion.label
              key={category.id}
              className="flex items-center gap-3 cursor-pointer group rounded-lg p-2 hover:bg-muted/50 transition-colors"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <Checkbox
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => handleCategoryToggle(category.id)}
              />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors flex-1">
                {category.name}
              </span>
              <Badge variant="secondary" className="text-xs">
                {category.count}
              </Badge>
            </motion.label>
          ))}
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-serif font-semibold text-foreground mb-4">Content Type</h3>
        <label className="flex items-center gap-3 cursor-pointer rounded-lg p-2 hover:bg-muted/50 transition-colors">
          <Checkbox checked={showPremiumOnly} onCheckedChange={(checked) => setShowPremiumOnly(checked as boolean)} />
          <div className="flex-1">
            <span className="text-sm font-medium text-foreground">Premium Content Only</span>
            <p className="text-xs text-muted-foreground">DRM-protected materials</p>
          </div>
        </label>
      </div>

      {(selectedCategories.length > 0 || showPremiumOnly) && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <Button
            variant="outline"
            className="w-full bg-transparent gap-2"
            onClick={() => {
              setSelectedCategories([])
              setShowPremiumOnly(false)
            }}
          >
            <X className="h-4 w-4" />
            Clear All Filters
          </Button>
        </motion.div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-24 glass rounded-xl p-6">
          <FilterSidebar />
        </div>
      </aside>

      <div className="flex-1">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search case files by title, case number, or court..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <AnimatePresence>
          {selectedCategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 mb-6"
            >
              {selectedCategories.map((catId) => {
                const cat = categories.find((c) => c.id === catId)
                return (
                  <motion.div key={catId} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.2 }}>
                    <Badge variant="secondary" className="gap-2 pr-1">
                      {cat?.name}
                      <button
                        onClick={() => handleCategoryToggle(catId)}
                        className="ml-1 rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Showing <span className="font-semibold text-foreground">{sortedCaseFiles.length}</span> case files
          </p>
          {sortedCaseFiles.length > 0 && (
            <Badge variant="outline" className="gap-1">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              Top Rated
            </Badge>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {sortedCaseFiles.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-16"
            >
              <BookLawIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">No case files found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search query</p>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05
                  }
                }
              }}
            >
              {sortedCaseFiles.map((caseFile) => {
                const progress = userProgress[caseFile.id]
                const isPurchased = purchases.has(caseFile.id) || !caseFile.is_premium
                const progressPercent = progress ? Math.round((progress.current_page / progress.total_pages) * 100) : 0

                return (
                  <motion.div
                    key={caseFile.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card className="group overflow-hidden transition-all hover:shadow-xl h-full flex flex-col">
                      <div className="relative h-48 overflow-hidden bg-muted">
                        <img
                          src={caseFile.thumbnail_url || `/placeholder.svg?height=192&width=384`}
                          alt={caseFile.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        
                        <div className="absolute top-3 right-3 flex gap-2">
                          {caseFile.is_premium && (
                            <Badge className="bg-amber-500 text-white gap-1">
                              <Lock className="h-3 w-3" />
                              Premium
                            </Badge>
                          )}
                          <Badge className="bg-slate-700 text-white">
                            {caseFile.year}
                          </Badge>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3">
                          <Badge variant="outline" className="bg-white/90 text-slate-900 border-0 mb-2">
                            {categories.find((c) => c.id === caseFile.category)?.name}
                          </Badge>
                          <p className="text-white text-xs font-medium truncate">
                            {caseFile.court_name}
                          </p>
                        </div>
                      </div>

                      <CardContent className="p-5 flex-1 flex flex-col">
                        <Badge variant="secondary" className="w-fit mb-3 text-xs font-mono">
                          {caseFile.case_number}
                        </Badge>
                        
                        <h3 className="font-serif text-lg font-semibold text-foreground line-clamp-2 mb-2">
                          {caseFile.title}
                        </h3>
                        
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                          {caseFile.description}
                        </p>

                        {isPurchased && progress && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-semibold text-primary">{progressPercent}%</span>
                            </div>
                            <Progress value={progressPercent} className="h-2" />
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t">
                          {caseFile.is_premium ? (
                            isPurchased ? (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">Purchased</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <IndianRupee className="h-5 w-5" />
                                <span className="text-2xl font-bold">{caseFile.price}</span>
                              </div>
                            )
                          ) : (
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                              Free Access
                            </Badge>
                          )}
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            <span>{caseFile.total_pages}p</span>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="p-5 pt-0">
                        <Button className="w-full gap-2" variant={isPurchased ? "default" : "outline"} asChild>
                          <Link href={`/case-files/${caseFile.id}`}>
                            {isPurchased ? (
                              <>
                                <BookOpen className="h-4 w-4" />
                                {progress ? "Continue Reading" : "View Case File"}
                              </>
                            ) : (
                              <>
                                View Details
                                <ArrowRight className="h-4 w-4" />
                              </>
                            )}
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}