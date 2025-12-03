"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ShieldCheckIcon, BookLawIcon } from "@/components/icons/legal-icons"
import { Search, Filter, BookOpen, Lock, CheckCircle, ArrowRight, IndianRupee } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

const categories = [
  { id: "ipc", name: "Indian Penal Code (IPC)", count: 45 },
  { id: "crpc", name: "Criminal Procedure Code (CrPC)", count: 38 },
  { id: "cpc", name: "Civil Procedure Code (CPC)", count: 32 },
  { id: "evidence", name: "Evidence Act", count: 28 },
  { id: "contracts", name: "Contract Law", count: 24 },
  { id: "constitution", name: "Constitutional Law", count: 35 },
  { id: "property", name: "Property Law", count: 20 },
  { id: "family", name: "Family Law", count: 18 },
  { id: "torts", name: "Law of Torts", count: 15 },
  { id: "jurisprudence", name: "Jurisprudence", count: 22 },
]

interface StudyMaterial {
  id: string
  title: string
  description: string
  category: string
  subcategory: string
  thumbnail_url: string
  is_premium: boolean
  price: number
  total_pages: number
  is_published: boolean
}

interface UserProgress {
  material_id: string
  current_page: number
  total_pages: number
}

interface Purchase {
  item_id: string
  item_type: string
  payment_status: string
}

export function StudyMaterialsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [materials, setMaterials] = useState<StudyMaterial[]>([])
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({})
  const [purchases, setPurchases] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category") ? [searchParams.get("category")!] : [],
  )
  const [sortBy, setSortBy] = useState("popular")
  const [showPremiumOnly, setShowPremiumOnly] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      // Fetch materials
      let query = supabase.from("study_materials").select("*").eq("is_published", true)

      if (selectedCategories.length > 0) {
        query = query.in("category", selectedCategories)
      }

      if (showPremiumOnly) {
        query = query.eq("is_premium", true)
      }

      const { data: materialsData } = await query
      setMaterials(materialsData || [])

      // Fetch user data
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        // Fetch progress
        const { data: progressData } = await supabase
          .from("user_progress")
          .select("material_id, current_page, total_pages")
          .eq("user_id", user.id)

        const progressMap: Record<string, UserProgress> = {}
        progressData?.forEach((p) => {
          progressMap[p.material_id] = p
        })
        setUserProgress(progressMap)

        // Fetch purchases
        const { data: purchasesData } = await supabase
          .from("purchases")
          .select("item_id, item_type, payment_status")
          .eq("user_id", user.id)
          .eq("item_type", "study_material")
          .eq("payment_status", "completed")

        const purchaseSet = new Set(purchasesData?.map((p) => p.item_id) || [])
        setPurchases(purchaseSet)
      }

      setLoading(false)
    }

    fetchData()
  }, [selectedCategories, showPremiumOnly])

  const filteredMaterials = materials.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    if (sortBy === "price-low") return (a.price || 0) - (b.price || 0)
    if (sortBy === "price-high") return (b.price || 0) - (a.price || 0)
    if (sortBy === "newest") return 0 // Would use created_at
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
        <h3 className="font-serif font-semibold text-foreground mb-4">Categories</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-3 cursor-pointer group">
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
            </label>
          ))}
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-serif font-semibold text-foreground mb-4">Content Type</h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox checked={showPremiumOnly} onCheckedChange={(checked) => setShowPremiumOnly(checked as boolean)} />
          <span className="text-sm text-foreground">Premium Content Only</span>
        </label>
      </div>

      <Button
        variant="outline"
        className="w-full bg-transparent"
        onClick={() => {
          setSelectedCategories([])
          setShowPremiumOnly(false)
        }}
      >
        Clear Filters
      </Button>
    </div>
  )

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-24 glass rounded-xl p-6">
          <FilterSidebar />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Search and Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search study materials..."
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

            {/* Mobile Filter Button */}
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

        {/* Active Filters */}
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedCategories.map((catId) => {
              const cat = categories.find((c) => c.id === catId)
              return (
                <Badge key={catId} variant="secondary" className="gap-2">
                  {cat?.name}
                  <button onClick={() => handleCategoryToggle(catId)} className="hover:text-destructive">
                    ×
                  </button>
                </Badge>
              )
            })}
          </div>
        )}

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-6">Showing {sortedMaterials.length} study materials</p>

        {/* Materials Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sortedMaterials.length === 0 ? (
          <div className="text-center py-16">
            <BookLawIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">No materials found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sortedMaterials.map((material) => {
              const progress = userProgress[material.id]
              const isPurchased = purchases.has(material.id) || !material.is_premium
              const progressPercent = progress ? Math.round((progress.current_page / progress.total_pages) * 100) : 0

              return (
                <Card key={material.id} className="group overflow-hidden transition-all hover:shadow-xl">
                  <div className="relative h-48 overflow-hidden bg-muted">
                    <img
                      src={
                        material.thumbnail_url ||
                        `/placeholder.svg?height=192&width=384&query=${encodeURIComponent(material.title)}`
                      }
                      alt={material.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {material.is_premium && (
                        <Badge className="bg-accent text-accent-foreground gap-1">
                          <Lock className="h-3 w-3" />
                          Premium
                        </Badge>
                      )}
                      <Badge variant="secondary" className="bg-primary/90 text-primary-foreground gap-1">
                        <ShieldCheckIcon className="h-3 w-3" />
                        DRM
                      </Badge>
                    </div>

                    {/* Category */}
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="outline" className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                        {categories.find((c) => c.id === material.category)?.name || material.category}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <h3 className="font-serif text-lg font-semibold text-foreground line-clamp-2 mb-2">
                      {material.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{material.description}</p>

                    {/* Progress Bar (if purchased and started) */}
                    {isPurchased && progress && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium text-primary">{progressPercent}%</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    )}

                    {/* Pricing */}
                    <div className="flex items-center justify-between">
                      {material.is_premium ? (
                        isPurchased ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Purchased</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <IndianRupee className="h-4 w-4 text-foreground" />
                            <span className="text-xl font-bold text-foreground">{material.price}</span>
                          </div>
                        )
                      ) : (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                          Free Access
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">{material.total_pages} pages</span>
                    </div>
                  </CardContent>

                  <CardFooter className="p-5 pt-0">
                    <Button className="w-full gap-2" variant={isPurchased ? "default" : "outline"} asChild>
                      <Link href={isPurchased ? `/reader/${material.id}` : `/study-materials/${material.id}`}>
                        {isPurchased ? (
                          <>
                            <BookOpen className="h-4 w-4" />
                            {progress ? "Continue Reading" : "Start Reading"}
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
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
