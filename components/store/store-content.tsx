"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, ShoppingBag, BookOpen, Star, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

// Matches your 'public.books' table schema
export interface Book {
  id: string
  title: string
  author: string
  description: string | null
  cover_url: string | null
  price: number
  original_price: number | null
  category: string | null
  isbn: string | null
  stock: number
  is_bundle: boolean
  pages: number | null
  publisher: string | null
}

interface StoreContentProps {
  initialBooks: Book[]
}

export function StoreContent({ initialBooks = [] }: StoreContentProps) {
  // 1. Initialize state with Server Data
  const [books] = useState<Book[]>(initialBooks)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // 2. Client-Side Filtering (Instant)
  const filteredBooks = books.filter((book) => {
    const searchLower = searchQuery.toLowerCase()
    
    const matchesSearch = 
      book.title.toLowerCase().includes(searchLower) ||
      book.author.toLowerCase().includes(searchLower) ||
      (book.publisher && book.publisher.toLowerCase().includes(searchLower))
    
    // Normalize category for robust matching
    const bookCategory = book.category?.toLowerCase() || ""
    const matchesCategory = categoryFilter === "all" || bookCategory === categoryFilter

    return matchesSearch && matchesCategory
  })

  const handleAddToCart = (bookTitle: string) => {
    toast.success(`Added "${bookTitle}" to Cart`, {
      description: "Proceed to checkout to complete purchase."
    })
  }

  return (
    <div className="space-y-8">
      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center bg-white p-4 rounded-xl border shadow-sm">
        <div className="w-full md:w-96 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by Title, Author, or Publisher..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[220px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Materials</SelectItem>
              <SelectItem value="law_notes">Law Notes</SelectItem>
              <SelectItem value="hybrid_study_material">Hybrid & Study Materials</SelectItem>
              <SelectItem value="judicial_exam_prep">Judicial Exam Prep</SelectItem>
              <SelectItem value="judiciary_syllabus">Judiciary Syllabus</SelectItem>
              <SelectItem value="bare_acts">Bare Acts</SelectItem>
              <SelectItem value="constitutional">Constitutional Law</SelectItem>
              <SelectItem value="criminal">Criminal Law</SelectItem>
              <SelectItem value="civil">Civil Law</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Book Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filteredBooks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="col-span-full text-center py-20"
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium text-foreground">No materials found</h3>
              <p className="text-muted-foreground mt-2">Try selecting a different category or search term.</p>
            </motion.div>
          ) : (
            filteredBooks.map((book) => (
              <motion.div
                key={book.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow overflow-hidden group border-slate-200">
                  {/* Book Cover Area */}
                  <div className="aspect-[3/4] bg-slate-100 relative overflow-hidden">
                    {book.cover_url ? (
                      <img 
                        src={book.cover_url} 
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                        <BookOpen className="h-12 w-12 mb-2" />
                        <span className="text-xs">No Cover</span>
                      </div>
                    )}
                    
                    {/* Floating Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                      {book.is_bundle && (
                        <Badge className="bg-purple-600 text-white hover:bg-purple-700">Bundle</Badge>
                      )}
                      {book.stock < 10 && book.stock > 0 && (
                        <Badge variant="destructive" className="animate-pulse">Low Stock</Badge>
                      )}
                      {book.stock === 0 && (
                        <Badge variant="secondary">Out of Stock</Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="outline" className="text-xs font-normal capitalize">
                        {book.category?.replace(/_/g, ' ') || "General"}
                      </Badge>
                      <div className="flex items-center text-amber-500 text-xs font-medium">
                        <Star className="h-3 w-3 fill-current mr-1" />
                        4.8
                      </div>
                    </div>

                    <h3 className="font-serif text-lg font-bold leading-tight mb-1 line-clamp-2" title={book.title}>
                      {book.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-1">by {book.author}</p>
                    
                    <div className="flex items-baseline gap-2 mt-auto">
                      <span className="text-xl font-bold">₹{book.price}</span>
                      {book.original_price && book.original_price > book.price && (
                        <>
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{book.original_price}
                          </span>
                          <span className="text-xs text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">
                            {Math.round(((book.original_price - book.price) / book.original_price) * 100)}% OFF
                          </span>
                        </>
                      )}
                    </div>
                    
                    {book.pages && (
                      <p className="text-xs text-muted-foreground mt-2">{book.pages} pages • {book.publisher}</p>
                    )}
                  </CardContent>

                  <CardFooter className="p-5 pt-0">
                    <div className="flex gap-2 w-full">
                      {/* READ BUTTON (For PDF Books) */}
                      <Button className="flex-1 gap-2" variant="default" asChild>
                        <Link href={`/store/read/${book.id}`}>
                          <BookOpen className="h-4 w-4" />
                          Read Now
                        </Link>
                      </Button>
                      
                      {/* BUY BUTTON (Mock) */}
                      <Button variant="outline" size="icon" onClick={() => handleAddToCart(book.title)}>
                         <ShoppingBag className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}