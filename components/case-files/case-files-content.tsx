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

interface CaseFile {
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
}

interface UserProgress {
  case_file_id: string
  current_page: number
  total_pages: number
}

// Mock data for display
const mockCaseFiles: CaseFile[] = [
  {
    id: "1",
    title: "Kesavananda Bharati v. State of Kerala",
    description: "Landmark judgment that established the basic structure doctrine of the Indian Constitution. This case is fundamental to understanding constitutional law in India.",
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
  {
    id: "2",
    title: "Maneka Gandhi v. Union of India",
    description: "Revolutionary judgment that expanded the scope of Article 21 (Right to Life and Personal Liberty). Established that procedure must be just, fair and reasonable.",
    case_number: "AIR 1978 SC 597",
    court_name: "Supreme Court of India",
    category: "constitutional",
    subcategory: "Personal Liberty",
    year: 1978,
    thumbnail_url: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800",
    file_url: "/files/maneka-gandhi.pdf",
    is_premium: false,
    price: 0,
    total_pages: 250,
    is_published: true,
    tags: ["Article 21", "Personal Liberty", "Passport", "Landmark"],
  },
  {
    id: "3",
    title: "Vishaka v. State of Rajasthan",
    description: "Landmark case on sexual harassment at workplace. Led to the creation of Vishaka Guidelines which were later codified in the Sexual Harassment Act, 2013.",
    case_number: "AIR 1997 SC 3011",
    court_name: "Supreme Court of India",
    category: "criminal",
    subcategory: "Sexual Harassment",
    year: 1997,
    thumbnail_url: "https://images.unsplash.com/photo-1589391886645-d51941baf7fb?w=800",
    file_url: "/files/vishaka.pdf",
    is_premium: true,
    price: 299,
    total_pages: 180,
    is_published: true,
    tags: ["Sexual Harassment", "Workplace", "Women Rights", "PIL"],
  },
  {
    id: "4",
    title: "State of Maharashtra v. Madhukar Narayan",
    description: "Important case dealing with Section 304B IPC (Dowry Death). Discusses the ingredients required to prove dowry death and the presumption under Section 113B of Evidence Act.",
    case_number: "(1991) 1 SCC 57",
    court_name: "Supreme Court of India",
    category: "criminal",
    subcategory: "Dowry Death",
    year: 1991,
    thumbnail_url: "https://images.unsplash.com/photo-1436450412740-6b988f486c6b?w=800",
    file_url: "/files/madhukar-narayan.pdf",
    is_premium: true,
    price: 199,
    total_pages: 120,
    is_published: true,
    tags: ["Dowry Death", "Section 304B", "Evidence Act", "Criminal Law"],
  },
  {
    id: "5",
    title: "M.C. Mehta v. Union of India (Oleum Gas Leak)",
    description: "Established the principle of absolute liability in cases of hazardous activities. Expanded the scope of Article 21 to include right to a healthy environment.",
    case_number: "AIR 1987 SC 1086",
    court_name: "Supreme Court of India",
    category: "environmental",
    subcategory: "Tort Law",
    year: 1987,
    thumbnail_url: "https://images.unsplash.com/photo-1532619187608-e5375cab36aa?w=800",
    file_url: "/files/mc-mehta-oleum.pdf",
    is_premium: false,
    price: 0,
    total_pages: 200,
    is_published: true,
    tags: ["Absolute Liability", "Environment", "Article 21", "PIL"],
  },
  {
    id: "6",
    title: "Mohori Bibee v. Dharmodas Ghose",
    description: "Classic case on the Indian Contract Act dealing with minors agreements. Established that a minor's agreement is void ab initio.",
    case_number: "(1903) 30 Cal 539",
    court_name: "Privy Council",
    category: "civil",
    subcategory: "Contract Law",
    year: 1903,
    thumbnail_url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800",
    file_url: "/files/mohori-bibee.pdf",
    is_premium: true,
    price: 149,
    total_pages: 85,
    is_published: true,
    tags: ["Contract Act", "Minor", "Void Agreement", "Classic Case"],
  },
  {
    id: "7",
    title: "Mohd. Ahmed Khan v. Shah Bano Begum",
    description: "Controversial case dealing with maintenance rights of divorced Muslim women under Section 125 CrPC. Led to the enactment of Muslim Women Act, 1986.",
    case_number: "AIR 1985 SC 945",
    court_name: "Supreme Court of India",
    category: "family",
    subcategory: "Maintenance",
    year: 1985,
    thumbnail_url: "https://images.unsplash.com/photo-1491336477066-31156b5e4f35?w=800",
    file_url: "/files/shah-bano.pdf",
    is_premium: false,
    price: 0,
    total_pages: 175,
    is_published: true,
    tags: ["Maintenance", "Muslim Law", "Section 125 CrPC", "Landmark"],
  },
  {
    id: "8",
    title: "Sarla Mudgal v. Union of India",
    description: "Important case on bigamy and conversion. Held that a Hindu husband cannot contract a second marriage by converting to Islam while the first marriage is subsisting.",
    case_number: "AIR 1995 SC 1531",
    court_name: "Supreme Court of India",
    category: "family",
    subcategory: "Marriage",
    year: 1995,
    thumbnail_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
    file_url: "/files/sarla-mudgal.pdf",
    is_premium: true,
    price: 179,
    total_pages: 140,
    is_published: true,
    tags: ["Bigamy", "Conversion", "Hindu Marriage Act", "Personal Law"],
  },
  {
    id: "9",
    title: "Salomon v. Salomon & Co Ltd",
    description: "Foundational case establishing the principle of separate legal entity and limited liability of companies. Essential for understanding company law.",
    case_number: "[1897] AC 22",
    court_name: "House of Lords",
    category: "corporate",
    subcategory: "Company Law",
    year: 1897,
    thumbnail_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
    file_url: "/files/salomon.pdf",
    is_premium: false,
    price: 0,
    total_pages: 120,
    is_published: true,
    tags: ["Separate Legal Entity", "Limited Liability", "Corporate Veil", "Classic"],
  },
  {
    id: "10",
    title: "Tulsiram v. Ratan Lal",
    description: "Important case on adverse possession under the Limitation Act. Discusses the requirements of continuous, open, and hostile possession.",
    case_number: "AIR 1976 SC 1982",
    court_name: "Supreme Court of India",
    category: "property",
    subcategory: "Adverse Possession",
    year: 1976,
    thumbnail_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
    file_url: "/files/tulsiram.pdf",
    is_premium: true,
    price: 249,
    total_pages: 150,
    is_published: true,
    tags: ["Adverse Possession", "Limitation Act", "Property Rights"],
  },
  {
    id: "11",
    title: "Bangalore Water Supply v. A. Rajappa",
    description: "Important case that expanded the definition of 'industry' under the Industrial Disputes Act. Discusses the triple test for determining industry.",
    case_number: "AIR 1978 SC 548",
    court_name: "Supreme Court of India",
    category: "labor",
    subcategory: "Industrial Disputes",
    year: 1978,
    thumbnail_url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800",
    file_url: "/files/rajappa.pdf",
    is_premium: true,
    price: 229,
    total_pages: 190,
    is_published: true,
    tags: ["Industry", "Industrial Disputes Act", "Labor Law", "Triple Test"],
  },
  {
    id: "12",
    title: "Novartis AG v. Union of India",
    description: "Landmark patent case dealing with Section 3(d) of the Patents Act. Rejected patent for Glivec on grounds of lack of enhanced efficacy.",
    case_number: "Civil Appeal No. 2706-2716 of 2013",
    court_name: "Supreme Court of India",
    category: "ipr",
    subcategory: "Patent Law",
    year: 2013,
    thumbnail_url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800",
    file_url: "/files/novartis.pdf",
    is_premium: true,
    price: 349,
    total_pages: 280,
    is_published: true,
    tags: ["Patent", "Section 3(d)", "Pharmaceutical", "TRIPS"],
  },
]

export function CaseFilesContent() {
  const searchParams = useSearchParams()
  const [caseFiles, setCaseFiles] = useState<CaseFile[]>([])
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
      let query = supabase.from("case_files").select("*").eq("is_published", true)

      if (selectedCategories.length > 0) {
        query = query.in("category", selectedCategories)
      }

      if (showPremiumOnly) {
        query = query.eq("is_premium", true)
      }

      const { data: caseFilesData } = await query.order("created_at", { ascending: false })
      
      if (!caseFilesData || caseFilesData.length === 0) {
        let filteredMockData = mockCaseFiles
        
        if (selectedCategories.length > 0) {
          filteredMockData = mockCaseFiles.filter((cf) => selectedCategories.includes(cf.category))
        }
        
        if (showPremiumOnly) {
          filteredMockData = filteredMockData.filter((cf) => cf.is_premium)
        }
        
        setCaseFiles(filteredMockData)
      } else {
        setCaseFiles(caseFilesData)
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: progressData } = await supabase
          .from("case_file_progress")
          .select("case_file_id, current_page, total_pages")
          .eq("user_id", user.id)

        const progressMap: Record<string, UserProgress> = {}
        progressData?.forEach((p) => {
          progressMap[p.case_file_id] = p
        })
        setUserProgress(progressMap)

        const { data: purchasesData } = await supabase
          .from("purchases")
          .select("item_id, item_type, payment_status")
          .eq("user_id", user.id)
          .eq("item_type", "case_file")
          .eq("payment_status", "completed")

        const purchaseSet = new Set(purchasesData?.map((p) => p.item_id) || [])
        setPurchases(purchaseSet)
      }

      setLoading(false)
    }

    fetchData()
  }, [selectedCategories, showPremiumOnly])

  const filteredCaseFiles = caseFiles.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.case_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.court_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
          {!loading && sortedCaseFiles.length > 0 && (
            <Badge variant="outline" className="gap-1">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              Top Rated
            </Badge>
          )}
        </div>

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
        ) : sortedCaseFiles.length === 0 ? (
          <div className="text-center py-16">
            <BookLawIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">No case files found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <motion.div
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
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
      </div>
    </div>
  )
}
