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
import { Search, Filter, BookOpen, Lock, ArrowRight, IndianRupee, X, TrendingUp, Star } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

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
}

interface CaseFilesContentProps {
  initialCaseFiles: CaseFile[]
}

const categories = [
  { id: "criminal", name: "Criminal Law" },
  { id: "civil", name: "Civil Law" },
  { id: "constitutional", name: "Constitutional Law" },
  { id: "family", name: "Family Law" },
]

export function CaseFilesContent({ initialCaseFiles }: CaseFilesContentProps) {
  // Initialize with Server Data
  const [caseFiles] = useState<CaseFile[]>(initialCaseFiles)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("popular")
  const [showPremiumOnly, setShowPremiumOnly] = useState(false)

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
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-semibold text-foreground">Categories</h3>
        </div>
        <div className="space-y-2">
          {categories.map((category) => (
            <motion.label
              key={category.id}
              className="flex items-center gap-3 cursor-pointer group rounded-lg p-2 hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => handleCategoryToggle(category.id)}
              />
              <span className="text-sm text-foreground">{category.name}</span>
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
          </div>
        </label>
      </div>
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
              placeholder="Search case files..."
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

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Showing <span className="font-semibold text-foreground">{sortedCaseFiles.length}</span> case files
          </p>
        </div>

        <AnimatePresence mode="popLayout">
          {sortedCaseFiles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <BookLawIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">No case files found</h3>
            </motion.div>
          ) : (
            <motion.div
              className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
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
                  <Card className="group overflow-hidden transition-all hover:shadow-xl h-full flex flex-col">
                    <div className="relative h-48 overflow-hidden bg-muted">
                      <img
                        src={caseFile.thumbnail_url || `/placeholder.svg?height=192&width=384`}
                        alt={caseFile.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        {caseFile.is_premium && (
                          <Badge className="bg-amber-500 text-white gap-1">
                            <Lock className="h-3 w-3" />
                            Premium
                          </Badge>
                        )}
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
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-1">
                           <IndianRupee className="h-5 w-5" />
                           <span className="text-2xl font-bold">{caseFile.price}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <BookOpen className="h-4 w-4" />
                          <span>{caseFile.total_pages}p</span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-5 pt-0">
                      <Button className="w-full gap-2" asChild>
                        <Link href={`/reader/${caseFile.id}`}>
                           View Details <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}