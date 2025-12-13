"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useCart } from "@/contexts/cart-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { BookLawIcon } from "@/components/icons/legal-icons"
import { 
  BookOpen, ArrowLeft, IndianRupee, Star, 
  CheckCircle2, Eye, Package, User, Calendar, Hash,
  Building, FileText, ShoppingCart, Heart, Share2, Award
} from "lucide-react"

interface Book {
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
  file_url: string | null
  created_at: string
}

interface BookDetailContentProps {
  book: Book
  relatedBooks: Book[]
}

export function BookDetailContent({ book, relatedBooks }: BookDetailContentProps) {
  const { addItem, items } = useCart()
  const [hasPurchased, setHasPurchased] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function checkPurchase() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('item_type', 'book')
        .eq('item_id', book.id)
        .eq('payment_status', 'completed')
        .single()

      setHasPurchased(!!data || book.price === 0)
    }
    checkPurchase()
  }, [book.id, book.price, supabase])

  const handleAddToCart = () => {
    addItem({
      id: book.id,
      title: book.title,
      price: book.price,
      type: 'book',
      cover_url: book.cover_url || undefined
    })
    toast.success("Added to Cart")
  }

  const inCart = items.some(item => item.id === book.id && item.type === 'book')
  const discount = book.original_price ? Math.round((1 - book.price / book.original_price) * 100) : 0
  
  const features = [
    "Instant Digital Access",
    "Lifetime Access",
    "Mobile & Desktop Compatible",
    "Downloadable PDF",
    "Regular Updates",
    "24/7 Support"
  ]

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
          <span>{book.category || 'Books'}</span>
          <span>/</span>
          <span className="text-foreground">{book.title}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Book Cover */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted shadow-lg">
                  <img
                    src={book.cover_url || "/placeholder.svg"}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                  {discount > 0 && (
                    <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
                      {discount}% OFF
                    </Badge>
                  )}
                  {book.is_bundle && (
                    <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground gap-1">
                      <Package className="h-3 w-3" />
                      Bundle
                    </Badge>
                  )}
                </div>
              </motion.div>

              {/* Book Info */}
              <div className="space-y-4">
                <div>
                  <Badge variant="outline" className="mb-2">{book.category || 'General'}</Badge>
                  <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-serif font-bold mb-2"
                  >
                    {book.title}
                  </motion.h1>
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{book.author}</span>
                  </div>
                </div>

                {/* Book Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {book.isbn && (
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span>ISBN: {book.isbn}</span>
                    </div>
                  )}
                  {book.pages && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{book.pages} pages</span>
                    </div>
                  )}
                  {book.publisher && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{book.publisher}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(book.created_at).getFullYear()}</span>
                  </div>
                </div>

                {/* Stock Info */}
                <div className="flex items-center gap-2">
                  {book.stock > 10 ? (
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      In Stock
                    </Badge>
                  ) : book.stock > 0 ? (
                    <Badge variant="outline" className="text-orange-600">
                      Only {book.stock} left
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-600">
                      Out of Stock
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Purchase Card */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                    ))}
                  </div>
                  <span className="font-medium">4.8</span>
                  <span className="text-muted-foreground text-sm">(234 reviews)</span>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <div className="flex items-center">
                      <IndianRupee className="h-6 w-6 text-foreground" />
                      <span className="text-4xl font-bold text-foreground">{book.price}</span>
                    </div>
                    {book.original_price && book.original_price > book.price && (
                      <>
                        <span className="text-xl text-muted-foreground line-through">₹{book.original_price}</span>
                        <Badge variant="destructive">Save ₹{book.original_price - book.price}</Badge>
                      </>
                    )}
                  </div>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <BookOpen className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="text-xl font-bold text-foreground">{book.pages || 0}</p>
                    <p className="text-xs text-muted-foreground">Pages</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <FileText className="h-5 w-5 mx-auto text-accent mb-1" />
                    <p className="text-xl font-bold text-foreground">PDF</p>
                    <p className="text-xs text-muted-foreground">Format</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Award className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="text-xl font-bold text-foreground">4.8</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                </div>

                {/* Quantity & Actions */}
                <div className="space-y-4">
                  {!hasPurchased && book.stock > 0 && (
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">Quantity:</span>
                      <div className="flex items-center border rounded-lg">
                        <button className="px-3 py-2 hover:bg-muted" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                          -
                        </button>
                        <span className="px-4 py-2 border-x">{quantity}</span>
                        <button className="px-3 py-2 hover:bg-muted" onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}>
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {hasPurchased ? (
                      <Button size="lg" className="w-full gap-2" asChild>
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
                          onClick={() => setIsWishlisted(!isWishlisted)}
                        >
                          <Heart className={`h-5 w-5 ${isWishlisted ? "fill-destructive text-destructive" : ""}`} />
                        </Button>
                      </>
                    )}
                  </div>

                  {!hasPurchased && inCart && (
                    <Button size="lg" variant="secondary" className="w-full" asChild>
                      <Link href="/store/cart">View Cart</Link>
                    </Button>
                  )}
                </div>

                {/* Features */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-foreground mb-3">What's Included:</h3>
                  <ul className="space-y-2">
                    {features.map((feature: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
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
                      src={relBook.cover_url || "/placeholder.svg"}
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
