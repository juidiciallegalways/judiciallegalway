"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { BookLawIcon } from "@/components/icons/legal-icons"
import { Search, Filter, BookOpen, Lock, ArrowRight, IndianRupee, ShoppingCart } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/contexts/cart-context"
import { toast } from "sonner"

export interface CaseFile {
  id: string
  title: string
  description: string | null
  case_number: string | null
  court_name: string | null
  category: string
  subcategory: string | null
  year: number | null
  thumbnail_url: string | null
  file_url: string
  is_premium: boolean
  price: number
  total_pages: number
  is_published: boolean
  tags: string[] | null
  judge_name: string | null
  petitioner: string | null
  respondent: string | null
  advocate_names: string[] | null
  case_summary: string | null
  key_points: string[] | null
  judgment_date: string | null
  bench: string | null
  state: string | null
  created_at: string
}

interface CaseFilesContentProps {
  initialCaseFiles: CaseFile[]
}

const categories = [
  { id: "criminal", name: "Criminal Law" },
  { id: "civil", name: "Civil Law" },
  { id: "family", name: "Family Law" },
  { id: "common", name: "Common Law" },
  { id: "property", name: "Property Law" },
  { id: "corporate", name: "Corporate Law" },
  { id: "statutory", name: "Statutory Law" },
]

export function CaseFilesContent({ initialCaseFiles }: CaseFilesContentProps) {
  const { addItem } = useCart()
  
  // Initialize with Server Data
  const [caseFiles] = useState<CaseFile[]>(initialCaseFiles)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("popular")
  const [showPremiumOnly, setShowPremiumOnly] = useState(false)

  const handleAddToCart = (caseFile: CaseFile) => {
    addItem({
      id: caseFile.id,
      title: caseFile.title,
      price: caseFile.price,
      type: 'case_file',
      cover_url: caseFile.thumbnail_url || undefined
    })
    toast.success("Added to cart")
  }

  const filteredCaseFiles = caseFiles.filter((c) => {
    const matchesSearch = 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.case_number?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(c.category)
    const matchesPremium = !showPremiumOnly || c.is_premium

    return matchesSearch && matchesCategory && matchesPremium
  })

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
        <h3 className="font-serif font-semibold text-white mb-6 text-lg">Categories</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <motion.label
              key={category.id}
              className="flex items-center gap-3 cursor-pointer group p-3 hover:bg-white/10 transition-colors rounded-lg"
            >
              <Checkbox
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => handleCategoryToggle(category.id)}
                className="border-white/30 data-[state=checked]:bg-white data-[state=checked]:border-white"
              />
              <span className="text-sm text-white/90 group-hover:text-white transition-colors">{category.name}</span>
            </motion.label>
          ))}
        </div>
      </div>
      <div className="border-t border-white/20 pt-6">
        <h3 className="font-serif font-semibold text-white mb-4">Content Type</h3>
        <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-white/10 transition-colors rounded-lg">
          <Checkbox 
            checked={showPremiumOnly} 
            onCheckedChange={(checked) => setShowPremiumOnly(checked as boolean)}
            className="border-white/30 data-[state=checked]:bg-white data-[state=checked]:border-white"
          />
          <div className="flex-1">
            <span className="text-sm font-medium text-white/90">Premium Content Only</span>
          </div>
        </label>
      </div>
    </div>
  )

  return (
    <div className="flex">
      {/* Dark Sidebar - Desktop */}
      <aside className="hidden lg:block w-80 bg-slate-900 dark:bg-slate-800 backdrop-blur-sm rounded-3xl m-4">
        <div className="sticky top-0 h-screen overflow-y-auto p-8">
          <FilterSidebar />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 bg-background w-full">
        <div className="container mx-auto px-0 py-0 lg:px-8 lg:py-4">
          {/* Search and Sort Bar - Mobile Responsive */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 px-4 sm:px-6 pt-4 sm:pt-6 w-full">
            <div className="relative flex-1 order-1 sm:order-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-border rounded-lg h-11 sm:h-10 w-full text-sm"
              />
            </div>
            <div className="flex gap-2 order-2 sm:order-none flex-1 sm:flex-none">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex-1 sm:w-[140px] bg-muted/50 border-border rounded-lg h-11 sm:h-10 text-sm">
                  <SelectValue placeholder="Sort" />
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
                  <Button variant="outline" size="icon" className="flex-1 sm:flex-none h-11 sm:h-10 sm:w-10 rounded-lg">
                    <Filter className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 bg-slate-900 dark:bg-slate-800 backdrop-blur-sm border-slate-700">
                  <SheetHeader>
                    <SheetTitle className="text-white">Categories</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4 sm:mb-6 px-4 sm:px-6 w-full">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{sortedCaseFiles.length}</span> case files
            </p>
          </div>

          {/* Content Grid - Mobile Responsive */}
          <div className="px-4 sm:px-6 pb-2 w-full">
            <AnimatePresence mode="popLayout">
              {sortedCaseFiles.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 sm:py-20 text-center w-full bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 min-h-[300px] sm:min-h-[400px]"
                >
                  <div className="mb-6 p-6 rounded-full bg-gray-100 dark:bg-slate-700">
                    <BookLawIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-600 dark:text-white" />
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4">No case files found.</h3>
                  <p className="text-gray-600 dark:text-white/70 text-base sm:text-lg px-6 max-w-md">
                    Try adjusting your search criteria or browse different categories to find relevant case files.
                  </p>
                </motion.div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 sm:p-6">
                  <motion.div
                    className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 w-full"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.05 }
                      }
                    }}
                  >
                    {sortedCaseFiles.map((caseFile) => (
                      <motion.div
                        key={caseFile.id}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0 }
                        }}
                      >
                        <Card className="group overflow-hidden transition-all hover:shadow-xl h-full flex flex-col bg-card border-border">
                          <div className="relative h-40 sm:h-48 overflow-hidden bg-muted">
                            <img
                              src={caseFile.thumbnail_url || `/placeholder.svg?height=192&width=384`}
                              alt={caseFile.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-2">
                              {caseFile.is_premium && (
                                <Badge className="bg-amber-500 text-white gap-1 text-xs">
                                  <Lock className="h-3 w-3" />
                                  Premium
                                </Badge>
                              )}
                            </div>
                          </div>

                          <CardContent className="p-4 sm:p-5 flex-1 flex flex-col">
                            <Badge variant="secondary" className="w-fit mb-2 sm:mb-3 text-xs font-mono">
                              {caseFile.case_number}
                            </Badge>
                            <h3 className="font-serif text-base sm:text-lg font-semibold text-foreground line-clamp-2 mb-2">
                              {caseFile.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-3 sm:mb-4 flex-1">
                              {caseFile.description}
                            </p>
                            <div className="flex items-center justify-between pt-3 sm:pt-4 border-t">
                              <div className="flex items-center gap-1">
                                 <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5" />
                                 <span className="text-xl sm:text-2xl font-bold">{caseFile.price}</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <BookOpen className="h-4 w-4" />
                                <span>{caseFile.total_pages}p</span>
                              </div>
                            </div>
                          </CardContent>

                          <CardFooter className="p-4 sm:p-5 pt-0 flex flex-col sm:flex-row gap-2">
                            <Button className="flex-1 gap-2 text-sm" asChild>
                              <Link href={`/case-files/${caseFile.id}`}>
                                 View Details <ArrowRight className="h-4 w-4" />
                              </Link>
                            </Button>
                            {caseFile.price > 0 && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleAddToCart(caseFile)}
                                className="gap-2 sm:w-auto w-full"
                              >
                                <ShoppingCart className="h-4 w-4" />
                                <span className="sm:hidden">Add to Cart</span>
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}