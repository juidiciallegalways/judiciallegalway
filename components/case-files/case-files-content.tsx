"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookLawIcon } from "@/components/icons/legal-icons"
import { Search, Scale, Calendar, MapPin, Loader2 } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { toast } from "sonner"
import { CaseFile } from "@/lib/database.types"
import { fetchCaseFiles } from "@/lib/case-files-api"

interface CaseFilesContentProps {
  initialCaseFiles: CaseFile[]
}



const courts = [
  { id: "all", name: "All Courts" },
  { id: "supreme", name: "Supreme Court" },
  { id: "delhi-hc", name: "Delhi HC" },
  { id: "bombay-hc", name: "Bombay HC" },
  { id: "calcutta-hc", name: "Calcutta HC" },
  { id: "madras-hc", name: "Madras HC" },
]

const practiceAreas = [
  { id: "all", name: "All Areas" },
  { id: "criminal", name: "Criminal Law" },
  { id: "civil", name: "Civil Law" },
  { id: "constitutional", name: "Constitutional Law" },
  { id: "family", name: "Family Law" },
  { id: "corporate", name: "Corporate Law" },
  { id: "property", name: "Property Law" },
]

const dateRanges = [
  { id: "all", name: "All Time" },
  { id: "2024", name: "2024" },
  { id: "2023", name: "2023" },
  { id: "2022", name: "2022" },
  { id: "2021", name: "2021" },
  { id: "2020", name: "2020" },
]

const getCategoryColor = (category: string) => {
  // Single consistent color for all categories
  return "bg-slate-600 hover:bg-slate-700"
}

export function CaseFilesContent({ initialCaseFiles }: CaseFilesContentProps) {
  const { addItem } = useCart()
  const [caseFiles, setCaseFiles] = useState<CaseFile[]>(initialCaseFiles)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCourt, setSelectedCourt] = useState("all")
  const [selectedPracticeArea, setSelectedPracticeArea] = useState("all")
  const [selectedDateRange, setSelectedDateRange] = useState("all")

  // Fetch case files with filters
  const fetchCaseFilesData = async () => {
    setLoading(true)
    try {
      const data = await fetchCaseFiles({
        search: searchQuery || undefined,
        court: selectedCourt !== 'all' ? selectedCourt : undefined,
        category: selectedPracticeArea !== 'all' ? selectedPracticeArea : undefined,
        year: selectedDateRange !== 'all' ? selectedDateRange : undefined,
      })
      setCaseFiles(data.caseFiles)
    } catch (error) {
      console.error('Error fetching case files:', error)
      toast.error('Failed to fetch case files')
    } finally {
      setLoading(false)
    }
  }

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery || selectedCourt !== 'all' || selectedPracticeArea !== 'all' || selectedDateRange !== 'all') {
        fetchCaseFilesData()
      } else {
        setCaseFiles(initialCaseFiles)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, selectedCourt, selectedPracticeArea, selectedDateRange, initialCaseFiles])

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

  const filteredCaseFiles = caseFiles

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 lg:px-8 py-4 lg:py-8">
        
        {/* Desktop Search Row */}
        <div className="hidden lg:flex items-center gap-3 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white bg-white dark:bg-gray-800"
            />
          </div>
          
          <Select value={selectedCourt} onValueChange={setSelectedCourt}>
            <SelectTrigger className="h-10 w-40 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white bg-white dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              {courts.map((court) => (
                <SelectItem key={court.id} value={court.id} className="dark:text-white dark:hover:bg-gray-700">
                  {court.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPracticeArea} onValueChange={setSelectedPracticeArea}>
            <SelectTrigger className="h-10 w-40 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white bg-white dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              {practiceAreas.map((area) => (
                <SelectItem key={area.id} value={area.id} className="dark:text-white dark:hover:bg-gray-700">
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
            <SelectTrigger className="h-10 w-32 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white bg-white dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              {dateRanges.map((range) => (
                <SelectItem key={range.id} value={range.id} className="dark:text-white dark:hover:bg-gray-700">
                  {range.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            className="h-10 px-4 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={fetchCaseFilesData}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Searching...
              </>
            ) : (
              "Search Cases"
            )}
          </Button>
        </div>

        {/* Mobile Search Section */}
        <div className="lg:hidden mb-6">
          {/* Simple Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
            />
          </div>

          {/* Category Dropdown */}
          <Select value={selectedPracticeArea} onValueChange={setSelectedPracticeArea}>
            <SelectTrigger className="h-12 text-base bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl w-full">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              {practiceAreas.map((area) => (
                <SelectItem key={area.id} value={area.id} className="dark:text-white dark:hover:bg-gray-700">
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Section */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <span className="text-gray-600 dark:text-gray-300">Loading case files...</span>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredCaseFiles.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="mb-6 p-6 rounded-full bg-gray-100 dark:bg-gray-700">
                  <BookLawIcon className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {caseFiles.length === 0 ? "No case files available" : "No case files found"}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg max-w-md">
                  {caseFiles.length === 0 
                    ? "Case files are being added to the library. Please check back soon."
                    : "Try adjusting your search criteria to find relevant case files."
                  }
                </p>
              </motion.div>
            ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
            >
              {filteredCaseFiles.map((caseFile) => (
                <motion.div
                  key={caseFile.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col group hover:border-primary/20 dark:hover:border-primary/30 hover:-translate-y-1">
                    <CardContent className="p-6 flex-1 flex flex-col">
                      {/* Case Icon and Title */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg flex-shrink-0 group-hover:bg-primary/10 dark:group-hover:bg-primary/20 transition-colors duration-300">
                          <Scale className="h-5 w-5 text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors duration-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight line-clamp-2 group-hover:text-primary dark:group-hover:text-primary transition-colors duration-300">
                            {caseFile.title}
                          </h3>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-4 mb-4 flex-1">
                        {caseFile.description}
                      </p>

                      {/* Case Metadata */}
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <span>{caseFile.year}</span>
                        <span>•</span>
                        <span>{caseFile.court_name || "Supreme Court"}</span>
                      </div>

                      {/* Category Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <Badge 
                          className={`${getCategoryColor(caseFile.category)} text-white px-3 py-1 text-sm font-medium rounded-full group-hover:scale-105 transition-transform duration-300`}
                        >
                          {caseFile.category.charAt(0).toUpperCase() + caseFile.category.slice(1)}
                        </Badge>
                      </div>

                      {/* Tags */}
                      {caseFile.tags && caseFile.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {caseFile.tags.slice(0, 2).map((tag, index) => (
                            <Badge 
                              key={index}
                              variant="secondary" 
                              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 text-xs rounded-full group-hover:bg-primary/10 dark:group-hover:bg-primary/20 transition-colors duration-300"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Explore Button */}
                      <Button 
                        asChild
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-auto transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02]"
                      >
                        <Link href={`/case-files/${caseFile.id}`}>
                          Explore Now
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        )}
      </div>
    </div>
  )
}