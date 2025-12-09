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
import { Lock, BookOpen, ShoppingBag, ArrowLeft, IndianRupee, Calendar, MapPin, FileText, Tag, CheckCircle2, Eye, Download, Share2 } from "lucide-react"

export function CaseFileDetailContent({ caseFile }: { caseFile: any }) {
  const { addItem, items } = useCart()
  const [hasPurchased, setHasPurchased] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function checkPurchase() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('item_type', 'case_file')
        .eq('item_id', caseFile.id)
        .eq('payment_status', 'completed')
        .single()

      setHasPurchased(!!data || caseFile.price === 0)
    }
    checkPurchase()
  }, [caseFile.id, caseFile.price, supabase])

  const handleAddToCart = () => {
    addItem({
      id: caseFile.id,
      title: caseFile.title,
      price: caseFile.price,
      type: 'case_file'
    })
    toast.success("Added to Cart")
  }

  const inCart = items.some(item => item.id === caseFile.id && item.type === 'case_file')

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/case-files" className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Case Files
          </Link>
          <span>/</span>
          <span>{caseFile.category}</span>
          <span>/</span>
          <span className="text-foreground">{caseFile.title}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thumbnail Preview */}
            {caseFile.thumbnail_url && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative aspect-video w-full rounded-xl overflow-hidden bg-muted mb-6"
              >
                <img
                  src={caseFile.thumbnail_url}
                  alt={caseFile.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <Badge variant="secondary" className="mb-2">{caseFile.category}</Badge>
                    {caseFile.is_premium && (
                      <Badge className="bg-amber-500 text-white gap-1 ml-2">
                        <Lock className="h-3 w-3" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{caseFile.category}</Badge>
                {caseFile.is_premium && (
                  <Badge className="bg-amber-500 text-white gap-1">
                    <Lock className="h-3 w-3" />
                    Premium
                  </Badge>
                )}
              </div>
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-serif font-bold mb-2"
              >
                {caseFile.title}
              </motion.h1>
              <div className="flex items-center gap-4 text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span className="font-mono text-sm">{caseFile.case_number || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{caseFile.court_name || 'N/A'}</span>
                </div>
                {caseFile.year && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{caseFile.year}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-3">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {caseFile.description || 'No description available.'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Preview Section */}
            {hasPurchased && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Eye className="h-5 w-5 text-primary" />
                        Preview Available
                      </h3>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/reader/${caseFile.id}`}>
                          <BookOpen className="mr-2 h-4 w-4" />
                          Read Now
                        </Link>
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You have access to this case file. Click "Read Now" to view the full document with DRM protection.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Tags */}
            {caseFile.tags && caseFile.tags.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {caseFile.tags.map((tag: string, i: number) => (
                      <Badge key={i} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Details */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList>
                <TabsTrigger value="details">Case Details</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-4">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Case Number</p>
                        <p className="font-medium font-mono">{caseFile.case_number || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Court</p>
                        <p className="font-medium">{caseFile.court_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p className="font-medium capitalize">{caseFile.category}</p>
                      </div>
                      {caseFile.subcategory && (
                        <div>
                          <p className="text-sm text-muted-foreground">Subcategory</p>
                          <p className="font-medium">{caseFile.subcategory}</p>
                        </div>
                      )}
                      {caseFile.year && (
                        <div>
                          <p className="text-sm text-muted-foreground">Year</p>
                          <p className="font-medium">{caseFile.year}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">Pages</p>
                        <p className="font-medium">{caseFile.total_pages || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="summary" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {caseFile.description || 'No summary available.'}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Purchase */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Price</p>
                  <div className="flex items-baseline gap-2">
                    <IndianRupee className="h-6 w-6" />
                    <span className="text-4xl font-bold">{caseFile.price || 0}</span>
                  </div>
                  {caseFile.total_pages && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {caseFile.total_pages} pages
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {hasPurchased ? (
                    <Button size="lg" className="w-full gap-2" asChild>
                      <Link href={`/reader/${caseFile.id}`}>
                        <BookOpen className="h-5 w-5" />
                        Read Now
                      </Link>
                    </Button>
                  ) : caseFile.price > 0 ? (
                    <>
                      <Button 
                        size="lg" 
                        className="w-full gap-2" 
                        onClick={handleAddToCart}
                        disabled={inCart}
                      >
                        {inCart ? (
                          <>
                            <CheckCircle2 className="h-5 w-5" />
                            In Cart
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="h-5 w-5" />
                            Add to Cart
                          </>
                        )}
                      </Button>
                      <Button size="lg" variant="outline" className="w-full gap-2" asChild>
                        <Link href="/store/cart">
                          View Cart
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <Button size="lg" className="w-full gap-2" asChild>
                      <Link href={`/reader/${caseFile.id}`}>
                        <BookOpen className="h-5 w-5" />
                        Read Free
                      </Link>
                    </Button>
                  )}
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>DRM Protected</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Instant Access</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Lifetime Access</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
