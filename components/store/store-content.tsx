"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookLawIcon } from "@/components/icons/legal-icons"
import { Search, ShoppingCart, Star, IndianRupee, Package, Heart, Eye, TrendingUp, Check, BookOpen } from "lucide-react"
import { toast } from "sonner"

// Matches your 'public.books' table schema
export interface Book {
  id: string
  title: string
  author: string
  description: string | null
  price: number
  original_price: number | null
  cover_url: string | null
  category: string | null
  pages: number | null
  isbn: string | null
  publisher: string | null
  is_bundle: boolean
  bundle_items: string[] | null
  stock: number
  is_published: boolean
}

interface StoreContentProps {
  initialBooks: Book[]
}

const categories = ["All", "Criminal Law", "Civil Law", "Constitutional Law", "Evidence Law", "Bundle"]

export function StoreContent({ initialBooks = [] }: StoreContentProps) {
  // 1. Initialize with Server Data
  const [books] = useState<Book[]>(initialBooks)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("popular")
  const [cart, setCart] = useState<Map<string, number>>(new Map())
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())

  // 2. Filter Logic
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Normalize category matching
    const bookCat = book.category || "General"
    const matchesCategory =
      selectedCategory === "All" ||
      bookCat.toLowerCase() === selectedCategory.toLowerCase() ||
      (selectedCategory === "Bundle" && book.is_bundle)

    return matchesSearch && matchesCategory
  })

  // 3. Sort Logic
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price
    if (sortBy === "price-high") return b.price - a.price
    if (sortBy === "newest") return 0 // Assuming default sort is by date
    return 0
  })

  // 4. Cart & Wishlist Handlers
  const addToCart = (bookId: string, title: string) => {
    setCart((prev) => {
      const next = new Map(prev)
      next.set(bookId, (next.get(bookId) || 0) + 1)
      return next
    })
    toast.success(`Added "${title}" to Cart`)
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

  const cartTotal = Array.from(cart.entries()).reduce((total, [bookId, qty]) => {
    const book = books.find((b) => b.id === bookId)
    return total + (book?.price || 0) * qty
  }, 0)

  const cartItemCount = Array.from(cart.values()).reduce((a, b) => a + b, 0)

  // 5. Book Card Component
  const BookCard = ({ book }: { book: Book }) => {
    const discount = book.original_price ? Math.round((1 - book.price / book.original_price) * 100) : 0
    const inCart = cart.has(book.id)

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
                onClick={() => addToCart(book.id, book.title)}
                disabled={book.stock === 0}
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
    <div className="container mx-auto px-4 py-8 lg:px-8">
      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-primary">Showing {sortedBooks.length} materials</span>
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="outline" className="gap-2 bg-transparent relative">
            <ShoppingCart className="h-5 w-5" />
            Cart ({cartItemCount})
            {cartTotal > 0 && <Badge variant="secondary" className="ml-1">₹{cartTotal}</Badge>}
          </Button>
        </motion.div>
      </motion.div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search books by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Tabs */}
      <Tabs defaultValue="All" value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-2">
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat}>
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-0">
          {sortedBooks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="p-12 text-center">
                <BookLawIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">No books found</h3>
                <p className="text-muted-foreground">We couldn't find any materials matching your criteria.</p>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
        </TabsContent>
      </Tabs>
    </div>
  )
}