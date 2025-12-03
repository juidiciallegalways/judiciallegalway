"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookLawIcon } from "@/components/icons/legal-icons"
import { Search, ShoppingCart, Star, IndianRupee, Package, Heart, Eye, TrendingUp, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Book {
  id: string
  title: string
  author: string
  description: string
  price: number
  original_price: number
  cover_url: string
  category: string
  pages: number
  isbn: string
  publisher: string
  is_bundle: boolean
  bundle_items: string[]
  stock: number
  is_published: boolean
}

const demoBooks: Book[] = [
  {
    id: "1",
    title: "Complete Guide to Indian Penal Code",
    author: "Dr. R.K. Sharma",
    description: "Comprehensive coverage of all 511 sections with case laws, examples, and practice questions.",
    price: 799,
    original_price: 999,
    cover_url: "/indian-penal-code-law-book.jpg",
    category: "Criminal Law",
    pages: 650,
    isbn: "978-1234567890",
    publisher: "Legal Publications India",
    is_bundle: false,
    bundle_items: [],
    stock: 50,
    is_published: true,
  },
  {
    id: "2",
    title: "Criminal Procedure Code Handbook",
    author: "Justice M.N. Reddy (Retd.)",
    description: "Step-by-step guide to criminal procedures with flowcharts and practical examples.",
    price: 649,
    original_price: 849,
    cover_url: "/criminal-procedure-code-book.jpg",
    category: "Criminal Law",
    pages: 480,
    isbn: "978-1234567891",
    publisher: "Legal Publications India",
    is_bundle: false,
    bundle_items: [],
    stock: 35,
    is_published: true,
  },
  {
    id: "3",
    title: "Judiciary Exam Complete Bundle",
    author: "Multiple Authors",
    description: "Complete set of 5 books covering IPC, CrPC, CPC, Evidence Act, and Constitutional Law.",
    price: 2499,
    original_price: 3999,
    cover_url: "/law-books-bundle-stack.jpg",
    category: "Bundle",
    pages: 2500,
    isbn: "978-1234567892",
    publisher: "Legal Publications India",
    is_bundle: true,
    bundle_items: ["IPC Guide", "CrPC Handbook", "CPC Manual", "Evidence Act", "Constitutional Law"],
    stock: 20,
    is_published: true,
  },
  {
    id: "4",
    title: "Evidence Act Simplified",
    author: "Adv. Priya Patel",
    description: "Easy-to-understand explanations of evidence law with landmark case studies.",
    price: 549,
    original_price: 699,
    cover_url: "/evidence-act-law-book.jpg",
    category: "Evidence Law",
    pages: 380,
    isbn: "978-1234567893",
    publisher: "Legal Publications India",
    is_bundle: false,
    bundle_items: [],
    stock: 45,
    is_published: true,
  },
  {
    id: "5",
    title: "Constitutional Law of India",
    author: "Prof. S.K. Verma",
    description: "In-depth analysis of Indian Constitution with latest amendments and interpretations.",
    price: 899,
    original_price: 1199,
    cover_url: "/constitutional-law-india-book.jpg",
    category: "Constitutional Law",
    pages: 720,
    isbn: "978-1234567894",
    publisher: "Legal Publications India",
    is_bundle: false,
    bundle_items: [],
    stock: 30,
    is_published: true,
  },
  {
    id: "6",
    title: "Civil Procedure Code Commentary",
    author: "Dr. A.K. Singh",
    description: "Detailed commentary on CPC with procedural aspects and case law references.",
    price: 749,
    original_price: 949,
    cover_url: "/civil-procedure-code-book.jpg",
    category: "Civil Law",
    pages: 550,
    isbn: "978-1234567895",
    publisher: "Legal Publications India",
    is_bundle: false,
    bundle_items: [],
    stock: 40,
    is_published: true,
  },
]

const categories = ["All", "Criminal Law", "Civil Law", "Constitutional Law", "Evidence Law", "Bundle"]

export function StoreContent() {
  const [books, setBooks] = useState<Book[]>(demoBooks)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("popular")
  const [cart, setCart] = useState<Map<string, number>>(new Map())
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchBooks() {
      const supabase = createClient()
      const { data } = await supabase.from("books").select("*").eq("is_published", true)

      if (data && data.length > 0) {
        setBooks(data)
      }
    }
    fetchBooks()
  }, [])

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === "All" ||
      book.category === selectedCategory ||
      (selectedCategory === "Bundle" && book.is_bundle)
    return matchesSearch && matchesCategory
  })

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price
    if (sortBy === "price-high") return b.price - a.price
    if (sortBy === "newest") return 0
    return 0
  })

  const addToCart = (bookId: string) => {
    setCart((prev) => {
      const next = new Map(prev)
      next.set(bookId, (next.get(bookId) || 0) + 1)
      return next
    })
  }

  const toggleWishlist = (bookId: string) => {
    setWishlist((prev) => {
      const next = new Set(prev)
      if (next.has(bookId)) {
        next.delete(bookId)
      } else {
        next.add(bookId)
      }
      return next
    })
  }

  const cartTotal = Array.from(cart.entries()).reduce((total, [bookId, qty]) => {
    const book = books.find((b) => b.id === bookId)
    return total + (book?.price || 0) * qty
  }, 0)

  const cartItemCount = Array.from(cart.values()).reduce((a, b) => a + b, 0)

  const BookCard = ({ book }: { book: Book }) => {
    const discount = Math.round((1 - book.price / book.original_price) * 100)
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

            {/* Stock Badge */}
            {book.stock < 10 && (
              <Badge variant="destructive" className="absolute bottom-3 left-3 shadow-lg">
                Only {book.stock} left!
              </Badge>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                className="text-white text-center px-4"
              >
                <Eye className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm font-medium">Quick View</p>
              </motion.div>
            </div>
          </div>

          <CardContent className="p-5 flex-1 flex flex-col">
            <Badge variant="outline" className="w-fit mb-2 text-xs">{book.category}</Badge>
            <p className="text-sm text-muted-foreground mb-1">{book.author}</p>
            <h3 className="font-serif font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {book.title}
            </h3>

            {book.is_bundle && (
              <div className="mb-3 p-2 rounded-lg bg-accent/5 border border-accent/20">
                <p className="text-xs font-medium text-accent mb-1">Bundle Includes:</p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {book.bundle_items.slice(0, 3).map((item, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-accent" />
                      {item}
                    </li>
                  ))}
                  {book.bundle_items.length > 3 && (
                    <li className="text-accent">+{book.bundle_items.length - 3} more items</li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-sm text-muted-foreground ml-1">(4.8)</span>
            </div>

            <div className="mt-auto pt-3 border-t">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <IndianRupee className="h-5 w-5 text-foreground" />
                  <span className="text-2xl font-bold text-foreground">{book.price}</span>
                </div>
                {book.original_price > book.price && (
                  <span className="text-sm text-muted-foreground line-through">₹{book.original_price}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{book.pages} pages • ISBN: {book.isbn}</p>
            </div>
          </CardContent>

          <CardFooter className="p-5 pt-0 flex gap-2">
            <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                className="w-full gap-2" 
                onClick={() => addToCart(book.id)}
                variant={inCart ? "secondary" : "default"}
              >
                {inCart ? (
                  <>
                    <Check className="h-4 w-4" />
                    In Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="outline" size="icon" asChild>
                <Link href={`/store/${book.id}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-primary">Showing {sortedBooks.length} books</span>
          </div>
        </div>

        {/* Cart Summary */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link href="/store/cart">
            <Button variant="outline" className="gap-2 bg-transparent relative">
              <ShoppingCart className="h-5 w-5" />
              Cart ({cartItemCount})
              {cartTotal > 0 && (
                <Badge variant="secondary" className="ml-1">₹{cartTotal}</Badge>
              )}
              {cartItemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground"
                >
                  {cartItemCount}
                </motion.span>
              )}
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Search and Filters */}
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
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
              {sortedBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      {/* People Also Buy Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-16"
      >
        <h2 className="font-serif text-2xl font-bold text-foreground mb-6">People Also Buy</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {books.slice(0, 4).map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="flex items-center gap-4 p-4 hover:shadow-lg transition-shadow">
                <img
                  src={book.cover_url || "/placeholder.svg"}
                  alt={book.title}
                  className="w-16 h-20 object-cover rounded shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm line-clamp-2">{book.title}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <IndianRupee className="h-3 w-3" />
                    <span className="font-bold">{book.price}</span>
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button size="sm" variant="outline" onClick={() => addToCart(book.id)}>
                    Add
                  </Button>
                </motion.div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  )
}
