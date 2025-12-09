"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookLawIcon } from "@/components/icons/legal-icons"
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  IndianRupee,
  Package,
  Heart,
  Share2,
  CheckCircle2,
  BookOpen,
  FileText,
  Award,
  Eye,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useCart } from "@/contexts/cart-context"
import { toast } from "sonner"

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
}

const demoBook: Book = {
  id: "1",
  title: "Complete Guide to Indian Penal Code",
  author: "Dr. R.K. Sharma",
  description:
    "This comprehensive guide covers all 511 sections of the Indian Penal Code with detailed explanations, case laws, examples, and practice questions. Perfect for judiciary exam preparation, law students, and legal professionals.",
  price: 799,
  original_price: 999,
  cover_url: "/indian-penal-code-law-book.jpg",
  category: "Criminal Law",
  pages: 650,
  isbn: "978-1234567890",
  publisher: "Legal Publications India",
  is_bundle: false,
  bundle_items: [],
}

const features = [
  "Comprehensive coverage of all 511 sections",
  "500+ solved case studies",
  "Practice questions after each chapter",
  "Latest amendments included",
  "Supreme Court judgments references",
  "Easy-to-understand language",
]

const relatedBooks = [
  { id: "2", title: "Criminal Procedure Code Handbook", price: 649, cover: "/criminal-procedure-code-book.jpg" },
  { id: "3", title: "Evidence Act Simplified", price: 549, cover: "/evidence-act-law-book.jpg" },
  { id: "4", title: "Constitutional Law of India", price: 899, cover: "/constitutional-law-india-book.jpg" },
]

export function BookDetailContent({ bookId }: { bookId: string }) {
  const router = useRouter()
  const { addItem, items } = useCart()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchBook() {
      const { data, error } = await supabase.from("books").select("*").eq("id", bookId).single()
      if (error) {
        toast.error("Book not found")
        router.push("/store")
        return
      }
      if (data) {
        setBook(data)
        
        // Check if user has purchased
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: purchase } = await supabase
            .from('purchases')
            .select('*')
            .eq('user_id', user.id)
            .eq('item_type', 'book')
            .eq('item_id', bookId)
            .eq('payment_status', 'completed')
            .single()
          setHasPurchased(!!purchase || data.price === 0)
        }
      }
      setLoading(false)
    }
    fetchBook()
  }, [bookId, router, supabase])

  if (loading || !book) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const discount = book.original_price ? Math.round((1 - book.price / book.original_price) * 100) : 0
  const inCart = items.some(item => item.id === book.id && item.type === 'book')

  const handleAddToCart = () => {
    addItem({
      id: book.id,
      title: book.title,
      price: book.price,
      type: 'book',
      cover_url: book.cover_url || undefined
    })
    toast.success("Added to cart")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/store" className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Store
          </Link>
          <span>/</span>
          <span>{book.category}</span>
          <span>/</span>
          <span className="text-foreground">{book.title}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Book Image */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden group">
                <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                  <img
                    src={book.cover_url || "/placeholder.svg?height=600&width=450&query=law+book+cover"}
                    alt={book.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {discount > 0 && (
                    <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-lg px-3 py-1 z-10">
                      {discount}% OFF
                    </Badge>
                  )}
                  {book.is_bundle && (
                    <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground gap-1 z-10">
                      <Package className="h-4 w-4" />
                      Bundle
                    </Badge>
                  )}
                  {/* Preview Overlay */}
                  {hasPurchased && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="outline" className="bg-white text-black hover:bg-white/90" asChild>
                        <Link href={`/store/read/${book.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Preview Images */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-lg overflow-hidden border cursor-pointer hover:border-primary"
                >
                  <img
                    src={`/book-page-.jpg?height=150&width=112&query=book+page+${i}`}
                    alt={`Preview ${i}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Book Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">
                {book.category}
              </Badge>
              <h1 className="font-serif text-3xl font-bold text-foreground mb-2">{book.title}</h1>
              <p className="text-lg text-muted-foreground">by {book.author}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                ))}
              </div>
              <span className="font-medium">4.8</span>
              <span className="text-muted-foreground">(234 reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <div className="flex items-center">
                <IndianRupee className="h-6 w-6 text-foreground" />
                <span className="text-4xl font-bold text-foreground">{book.price}</span>
              </div>
              {book.original_price > book.price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">₹{book.original_price}</span>
                  <Badge variant="destructive">Save ₹{book.original_price - book.price}</Badge>
                </>
              )}
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <BookOpen className="h-6 w-6 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold text-foreground">{book.pages}</p>
                <p className="text-sm text-muted-foreground">Pages</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <FileText className="h-6 w-6 mx-auto text-accent mb-1" />
                <p className="text-2xl font-bold text-foreground">511</p>
                <p className="text-sm text-muted-foreground">Sections</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Award className="h-6 w-6 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold text-foreground">500+</p>
                <p className="text-sm text-muted-foreground">Cases</p>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <button className="px-3 py-2 hover:bg-muted" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    -
                  </button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <button className="px-3 py-2 hover:bg-muted" onClick={() => setQuantity(quantity + 1)}>
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                {hasPurchased ? (
                  <Button size="lg" className="flex-1 gap-2" asChild>
                    <Link href={`/store/read/${book.id}`}>
                      <BookOpen className="h-5 w-5" />
                      Read Now
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button 
                      size="lg" 
                      className="flex-1 gap-2" 
                      onClick={handleAddToCart}
                      disabled={inCart || book.stock === 0}
                    >
                      {inCart ? (
                        <>
                          <CheckCircle2 className="h-5 w-5" />
                          In Cart
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-5 w-5" />
                          {book.stock === 0 ? "Sold Out" : "Add to Cart"}
                        </>
                      )}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2 bg-transparent"
                      onClick={() => setIsWishlisted(!isWishlisted)}
                    >
                      <Heart className={`h-5 w-5 ${isWishlisted ? "fill-destructive text-destructive" : ""}`} />
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/store/cart">
                        <Share2 className="h-5 w-5" />
                      </Link>
                    </Button>
                  </>
                )}
              </div>

              {!hasPurchased && book.stock > 0 && (
                <Button size="lg" variant="secondary" className="w-full" asChild>
                  <Link href="/store/cart">View Cart</Link>
                </Button>
              )}
            </div>

            {/* Features */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-3">What's Included:</h3>
                <ul className="space-y-2">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="description" className="mt-12">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="contents">Table of Contents</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="author">About Author</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6 prose prose-slate dark:prose-invert max-w-none">
                <p>{book.description}</p>
                <h3>Book Details</h3>
                <ul>
                  <li>
                    <strong>ISBN:</strong> {book.isbn}
                  </li>
                  <li>
                    <strong>Publisher:</strong> {book.publisher}
                  </li>
                  <li>
                    <strong>Pages:</strong> {book.pages}
                  </li>
                  <li>
                    <strong>Category:</strong> {book.category}
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contents" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Table of Contents</h3>
                <div className="space-y-2">
                  {[
                    "Introduction to IPC",
                    "General Exceptions",
                    "Offences Against State",
                    "Offences Against Public",
                    "Offences Against Body",
                    "Offences Against Property",
                    "Criminal Breach of Trust",
                    "Defamation",
                    "Criminal Intimidation",
                  ].map((chapter, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                      <span>
                        Chapter {i + 1}: {chapter}
                      </span>
                      <Badge variant="secondary">50+ pages</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border-b pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                          ))}
                        </div>
                        <span className="font-medium">Verified Purchase</span>
                      </div>
                      <p className="text-muted-foreground">
                        Excellent book for judiciary preparation. The explanations are clear and case laws are well
                        referenced.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">- Student, {i} month ago</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="author" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                    <BookLawIcon className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{book.author}</h3>
                    <p className="text-muted-foreground">Senior Legal Expert & Author</p>
                    <p className="mt-2">
                      Dr. R.K. Sharma is a renowned legal expert with over 30 years of experience in criminal law. He
                      has authored multiple bestselling law books and has trained thousands of successful judiciary exam
                      candidates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Books */}
        <section className="mt-12">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-6">People Also Buy</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedBooks.map((relBook) => (
              <Link key={relBook.id} href={`/store/${relBook.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-[3/4] bg-muted">
                    <img
                      src={relBook.cover || "/placeholder.svg"}
                      alt={relBook.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-foreground line-clamp-2 mb-2">{relBook.title}</h3>
                    <div className="flex items-center">
                      <IndianRupee className="h-4 w-4" />
                      <span className="font-bold">{relBook.price}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
