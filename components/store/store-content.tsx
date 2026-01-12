"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BookLawIcon } from "@/components/icons/legal-icons"
import { Search, ShoppingCart, IndianRupee, Star, Tag } from "lucide-react"
import { toast } from "sonner"
import { useCart } from "@/contexts/cart-context"

// Matches your 'public.books' table schema
export interface Book {
  id: string
  title: string
  author: string
  description: string | null
  price: number
  original_price: number | null
  cover_url: string | null
  preview_url: string | null
  file_url: string | null
  category: string | null
  pages: number | null
  isbn: string | null
  publisher: string | null
  is_bundle: boolean
  bundle_items: string[] | null
  stock: number
  is_published: boolean
  created_at: string
}

interface StoreContentProps {
  initialBooks: Book[]
}

export function StoreContent({ initialBooks = [] }: StoreContentProps) {
  const { items, addItem, cartTotal } = useCart()
  
  // Dummy data matching reference design
  const dummyBooks: Book[] = [
    {
      id: "1",
      title: "Criminal Law Complete Notes",
      author: "Legal Expert",
      description: "Comprehensive criminal law study material",
      price: 499,
      original_price: 999,
      cover_url: "/criminal-law-book.jpg",
      preview_url: null,
      file_url: null,
      category: "Criminal Law",
      pages: 350,
      isbn: null,
      publisher: "Legal Publications",
      is_bundle: false,
      bundle_items: null,
      stock: 50,
      is_published: true,
      created_at: "2023-01-01T00:00:00Z"
    },
    {
      id: "2", 
      title: "Constitutional Law Guide",
      author: "Constitutional Expert",
      description: "Complete guide to constitutional law",
      price: 399,
      original_price: 799,
      cover_url: "/constitutional-law-book.jpg",
      preview_url: null,
      file_url: null,
      category: "Constitutional Law",
      pages: 280,
      isbn: null,
      publisher: "Legal Publications",
      is_bundle: false,
      bundle_items: null,
      stock: 30,
      is_published: true,
      created_at: "2023-01-02T00:00:00Z"
    },
    {
      id: "3",
      title: "Case Files Bundle",
      author: "Legal Team",
      description: "Complete collection of important case files",
      price: 999,
      original_price: 1999,
      cover_url: "/case-files-bundle.jpg",
      preview_url: null,
      file_url: null,
      category: "Bundle",
      pages: 500,
      isbn: null,
      publisher: "Legal Publications",
      is_bundle: true,
      bundle_items: ["Criminal Cases", "Civil Cases", "Constitutional Cases"],
      stock: 25,
      is_published: true,
      created_at: "2023-01-03T00:00:00Z"
    }
  ]
  
  const [books] = useState<Book[]>(initialBooks.length > 0 ? initialBooks : dummyBooks)
  const [searchQuery, setSearchQuery] = useState("")

  const handleAddToCart = (book: Book) => {
    addItem({
      id: book.id,
      title: book.title,
      price: book.price,
      type: 'book',
      cover_url: book.cover_url || undefined
    })
    toast.success("Added to cart")
  }

  const filteredBooks = books.filter((book) => {
    return book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           book.author.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const cartItemCount = items.length

  // Generate star rating
  const generateStars = (rating: number, reviews: number) => (
    <div className="flex items-center gap-2 mb-2">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : star - 0.5 <= rating
                ? "fill-yellow-400/50 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {rating} ({reviews})
      </span>
    </div>
  )

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 lg:px-8 py-4 lg:py-8">
        
        {/* Featured Banner */}
        <div className="bg-slate-800 dark:bg-slate-700 rounded-2xl p-6 lg:p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Tag className="h-6 w-6 text-orange-400" />
                <h2 className="text-2xl lg:text-3xl font-bold">
                  Judicial Service Exam Prep Bundle
                </h2>
              </div>
              <p className="text-white/80 text-base lg:text-lg mb-4 max-w-2xl">
                Complete preparation package with all subjects, mock tests, and case files. Limited time offer!
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <IndianRupee className="h-6 w-6 text-orange-400" />
                  <span className="text-3xl font-bold text-orange-400">1,499</span>
                </div>
                <span className="text-lg text-white/60 line-through">₹2,999</span>
              </div>
            </div>
            <div className="hidden lg:block">
              <Button 
                className="bg-orange-400 hover:bg-orange-500 text-white px-8 py-3 text-lg font-medium"
                onClick={() => handleAddToCart({
                  id: "bundle-1",
                  title: "Judicial Service Exam Prep Bundle",
                  author: "Legal Team",
                  description: "Complete preparation package",
                  price: 1499,
                  original_price: 2999,
                  cover_url: null,
                  preview_url: null,
                  file_url: null,
                  category: "Bundle",
                  pages: 1000,
                  isbn: null,
                  publisher: "Legal Publications",
                  is_bundle: true,
                  bundle_items: ["All Subjects", "Mock Tests", "Case Files"],
                  stock: 100,
                  is_published: true,
                  created_at: "2023-01-01T00:00:00Z"
                })}
              >
                Add to Cart
              </Button>
            </div>
          </div>
          {/* Mobile Add to Cart Button */}
          <div className="lg:hidden mt-6">
            <Button 
              className="w-full bg-orange-400 hover:bg-orange-500 text-white py-3 text-lg font-medium"
              onClick={() => handleAddToCart({
                id: "bundle-1",
                title: "Judicial Service Exam Prep Bundle",
                author: "Legal Team",
                description: "Complete preparation package",
                price: 1499,
                original_price: 2999,
                cover_url: null,
                preview_url: null,
                file_url: null,
                category: "Bundle",
                pages: 1000,
                isbn: null,
                publisher: "Legal Publications",
                is_bundle: true,
                bundle_items: ["All Subjects", "Mock Tests", "Case Files"],
                stock: 100,
                is_published: true,
                created_at: "2023-01-01T00:00:00Z"
              })}
            >
              Add to Cart
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search materials, books, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
            />
          </div>
          <Button 
            className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            asChild
          >
            <Link href="/store/cart">
              <ShoppingCart className="h-5 w-5" />
              ({cartItemCount})
            </Link>
          </Button>
        </div>

        {/* Products Grid */}
        <AnimatePresence mode="popLayout">
          {filteredBooks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="mb-6 p-6 rounded-full bg-gray-100 dark:bg-gray-700">
                <BookLawIcon className="h-16 w-16 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">No books found</h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg max-w-md">
                Try adjusting your search criteria to find relevant materials.
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
              {filteredBooks.map((book, index) => {
                const inCart = items.some(item => item.id === book.id && item.type === 'book')
                const rating = 4.0 + (index * 0.2) // Generate different ratings
                const reviews = 85 + (index * 15) // Generate different review counts
                
                return (
                  <motion.div
                    key={book.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                  >
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col group">
                      <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                        <img
                          src={book.cover_url || "/placeholder.svg?height=192&width=384"}
                          alt={book.title}
                          className="h-full w-full object-cover"
                        />
                        {book.original_price && book.original_price > book.price && (
                          <Badge className="absolute top-3 right-3 bg-red-500 text-white">
                            {Math.round((1 - book.price / book.original_price) * 100)}% OFF
                          </Badge>
                        )}
                      </div>

                      <CardContent className="p-6 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight line-clamp-2">
                          {book.title}
                        </h3>
                        
                        {generateStars(rating, reviews)}

                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center">
                            <IndianRupee className="h-5 w-5 text-orange-500" />
                            <span className="text-2xl font-bold text-orange-500">{book.price}</span>
                          </div>
                          {book.original_price && book.original_price > book.price && (
                            <span className="text-sm text-gray-500 line-through">₹{book.original_price}</span>
                          )}
                        </div>

                        <Button 
                          className="w-full mt-auto bg-slate-700 hover:bg-slate-800 text-white"
                          onClick={() => handleAddToCart(book)}
                          disabled={inCart}
                        >
                          {inCart ? "In Cart" : "Add to Cart"}
                        </Button>
                      </CardContent>
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