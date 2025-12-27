"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookLawIcon } from "@/components/icons/legal-icons"
import { Search, ShoppingCart, IndianRupee, Package, Heart, Check, BookOpen } from "lucide-react"
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

const categories = [
  { id: "all", name: "All" },
  { id: "criminal", name: "Criminal Law" },
  { id: "civil", name: "Civil Law" },
  { id: "constitutional", name: "Constitutional Law" },
  { id: "evidence", name: "Evidence Law" },
  { id: "bundle", name: "Bundle" },
]

export function StoreContent({ initialBooks = [] }: StoreContentProps) {
  const router = useRouter()
  const { items, addItem, cartTotal } = useCart()
  
  // Initialize with Server Data
  const [books] = useState<Book[]>(initialBooks)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("popular")
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())

  // Filter Logic
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
    
    const bookCat = book.category || "General"
    const matchesCategory =
      selectedCategory === "all" ||
      bookCat.toLowerCase() === selectedCategory.toLowerCase() ||
      (selectedCategory === "bundle" && book.is_bundle)

    return matchesSearch && matchesCategory
  })

  // Sort Logic
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price
    if (sortBy === "price-high") return b.price - a.price
    if (sortBy === "newest") return 0
    return 0
  })

  // Cart & Wishlist Handlers
  const handleAddToCart = (book: Book) => {
    addItem({
      id: book.id,
      title: book.title,
      price: book.price,
      type: 'book',
      cover_url: book.cover_url || undefined
    })
  }

  const toggleWishlist = (bookId: string) => {
    setWishlist((prev) => {
      const next = new Set(prev)
      if (next.has(bookId)) {
        next.delete(bookId)
        toast("Removed from wishlist")
      } else {
        next.add(bookId)
        toast("Added to wishlist")
      }
      return next
    })
  }

  const cartItemCount = items.length

  // Book Card Component
  const BookCard = ({ book }: { book: Book }) => {
    const discount = book.original_price ? Math.round((1 - book.price / book.original_price) * 100) : 0
    const inCart = items.some(item => item.id === book.id && item.type === 'book')

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -8 }}
      >
        <Card className="group overflow-hidden hover:shadow-xl transition-all h-full flex flex-col rounded-xl">
          <div className="relative aspect-[3/4] overflow-hidden bg-muted">
            <motion.img
              src={book.cover_url || "/placeholder.svg"}
              alt={book.title}
              className="h-full w-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
            {discount > 0 && (
              <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground shadow-lg">
                {discount}% OFF
              </Badge>
            )}
            {book.is_bundle && (
              <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground gap-1 shadow-lg">
                <Package className="h-3 w-3" />
                Bundle
              </Badge>
            )}
            <motion.div
              className="absolute top-3 right-3"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white shadow-lg"
                onClick={() => toggleWishlist(book.id)}
              >
                <Heart className={`h-5 w-5 ${wishlist.has(book.id) ? "fill-destructive text-destructive" : ""}`} />
              </Button>
            </motion.div>

            {book.stock < 10 && book.stock > 0 && (
              <Badge variant="destructive" className="absolute bottom-3 left-3 shadow-lg">
                Only {book.stock} left!
              </Badge>
            )}
            {book.stock === 0 && (
              <Badge variant="secondary" className="absolute bottom-3 left-3 shadow-lg">
                Out of Stock
              </Badge>
            )}

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                className="text-white text-center px-4"
              >
                <Button variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-black" asChild>
                  <Link href={`/store/read/${book.id}`}>
                    <BookOpen className="mr-2 h-4 w-4" /> Read Preview
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>

          <CardContent className="p-5 flex-1 flex flex-col">
            <Badge variant="outline" className="w-fit mb-2 text-xs">{book.category || "General"}</Badge>
            <p className="text-sm text-muted-foreground mb-1">{book.author}</p>
            <h3 className="font-serif font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors" title={book.title}>
              {book.title}
            </h3>

            {book.is_bundle && book.bundle_items && (
              <div className="mb-3 p-2 rounded-lg bg-accent/5 border border-accent/20">
                <p className="text-xs font-medium text-accent mb-1">Bundle Includes:</p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {book.bundle_items.slice(0, 3).map((item, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-auto pt-3 border-t">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <IndianRupee className="h-5 w-5 text-foreground" />
                  <span className="text-2xl font-bold text-foreground">{book.price}</span>
                </div>
                {book.original_price && book.original_price > book.price && (
                  <span className="text-sm text-muted-foreground line-through">₹{book.original_price}</span>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-5 pt-0 flex gap-2">
            <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                className="w-full gap-2" 
                onClick={() => handleAddToCart(book)}
                disabled={book.stock === 0 || inCart}
                variant={inCart ? "secondary" : "default"}
              >
                {inCart ? (
                  <>
                    <Check className="h-4 w-4" /> In Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" /> {book.stock === 0 ? "Sold Out" : "Add to Cart"}
                  </>
                )}
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="bg-background w-full">
      {/* Search Bar and Controls - Mobile Responsive */}
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
          {/* Book Type Filter - Mobile Only */}
          <div className="sm:hidden flex-1">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-muted/50 border-border rounded-lg h-11 text-sm">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Cart Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none">
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-3 sm:px-4 h-11 sm:h-10 text-sm font-medium w-full sm:w-auto" asChild>
              <Link href="/store/cart">
                <ShoppingCart className="h-4 w-4" />
                ({cartItemCount})
              </Link>
            </Button>
          </motion.div>
          
          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="flex-1 sm:w-[120px] bg-muted/50 border-border rounded-lg h-11 sm:h-10 text-sm">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low">Low to High</SelectItem>
              <SelectItem value="price-high">High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category Badges - Desktop Only */}
      <div className="hidden sm:flex flex-wrap gap-2 mb-4 sm:mb-6 px-4 sm:px-6 w-full">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === category.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category.name}
          </motion.button>
        ))}
      </div>

      {/* Results Count */}
      <div className="mb-4 sm:mb-6 px-4 sm:px-6 w-full">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{sortedBooks.length}</span> materials
        </p>
      </div>

      {/* Content Grid */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 w-full">
        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 sm:p-6">
          <AnimatePresence mode="popLayout">
            {sortedBooks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 sm:py-20 text-center w-full min-h-[300px] sm:min-h-[400px]"
              >
                <div className="mb-6 p-6 rounded-full bg-gray-100 dark:bg-slate-700">
                  <BookLawIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-600 dark:text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4">No books found</h3>
                <p className="text-gray-600 dark:text-white/70 text-base sm:text-lg px-6 max-w-md">
                  We couldn't find any materials matching your criteria.
                </p>
              </motion.div>
            ) : (
              <motion.div
                className="grid gap-4 sm:gap-6 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 w-full"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
              >
                {sortedBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}