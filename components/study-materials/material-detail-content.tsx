"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShieldCheckIcon, BookLawIcon } from "@/components/icons/legal-icons"
import {
  BookOpen,
  Lock,
  CheckCircle,
  IndianRupee,
  Clock,
  FileText,
  ArrowLeft,
  ShoppingCart,
  Play,
  Users,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Material {
  id: string
  title: string
  description: string
  category: string
  subcategory: string
  thumbnail_url: string
  is_premium: boolean
  price: number
  total_pages: number
}

export function MaterialDetailContent({ material }: { material: Material }) {
  const router = useRouter()
  const [isPurchased, setIsPurchased] = useState(!material.is_premium)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)

  useEffect(() => {
    async function checkPurchase() {
      const supabase = createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        setUser({ id: authUser.id, email: authUser.email || "" })

        const { data: purchase } = await supabase
          .from("purchases")
          .select("id")
          .eq("user_id", authUser.id)
          .eq("item_id", material.id)
          .eq("item_type", "study_material")
          .eq("payment_status", "completed")
          .single()

        if (purchase) {
          setIsPurchased(true)
        }
      }
    }
    checkPurchase()
  }, [material.id])

  const handlePurchase = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    setIsLoading(true)
    // In production, integrate with Razorpay here
    const supabase = createClient()

    const { error } = await supabase.from("purchases").insert({
      user_id: user.id,
      item_id: material.id,
      item_type: "study_material",
      amount: material.price,
      payment_status: "completed",
      payment_id: `demo_${Date.now()}`,
    })

    if (!error) {
      setIsPurchased(true)
    }
    setIsLoading(false)
  }

  const tableOfContents = [
    { title: "Introduction", pages: "1-10" },
    { title: "Chapter 1: Fundamentals", pages: "11-45" },
    { title: "Chapter 2: Key Concepts", pages: "46-90" },
    { title: "Chapter 3: Case Studies", pages: "91-140" },
    { title: "Chapter 4: Practice Questions", pages: "141-180" },
    { title: "Summary & Revision Notes", pages: "181-200" },
  ]

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      {/* Back Button */}
      <Button variant="ghost" className="mb-6 gap-2" asChild>
        <Link href="/study-materials">
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Hero Section */}
          <div className="relative rounded-2xl overflow-hidden mb-8">
            <img
              src={
                material.thumbnail_url ||
                `/placeholder.svg?height=400&width=800&query=${encodeURIComponent(material.title)}`
              }
              alt={material.title}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {material.is_premium && (
                  <Badge className="bg-accent text-accent-foreground gap-1">
                    <Lock className="h-3 w-3" />
                    Premium
                  </Badge>
                )}
                <Badge className="bg-primary/90 text-primary-foreground gap-1">
                  <ShieldCheckIcon className="h-3 w-3" />
                  DRM Protected
                </Badge>
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2">{material.title}</h1>
              <p className="text-white/80 line-clamp-2">{material.description}</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="contents">Contents</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-serif text-xl font-semibold mb-4">About This Material</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {material.description ||
                      "Comprehensive study material covering all essential topics for judiciary exam preparation. Includes detailed explanations, case laws, and practice questions."}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                    <div className="text-center">
                      <FileText className="h-8 w-8 mx-auto text-primary mb-2" />
                      <p className="text-2xl font-bold text-foreground">{material.total_pages}</p>
                      <p className="text-sm text-muted-foreground">Pages</p>
                    </div>
                    <div className="text-center">
                      <Clock className="h-8 w-8 mx-auto text-primary mb-2" />
                      <p className="text-2xl font-bold text-foreground">~{Math.ceil(material.total_pages / 20)}h</p>
                      <p className="text-sm text-muted-foreground">Reading Time</p>
                    </div>
                    <div className="text-center">
                      <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                      <p className="text-2xl font-bold text-foreground">2.5k+</p>
                      <p className="text-sm text-muted-foreground">Students</p>
                    </div>
                    <div className="text-center">
                      <BookLawIcon className="h-8 w-8 mx-auto text-primary mb-2" />
                      <p className="text-2xl font-bold text-foreground">2024</p>
                      <p className="text-sm text-muted-foreground">Updated</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="font-serif text-xl font-semibold mb-4">Key Features</h2>
                  <ul className="space-y-3">
                    {[
                      "Comprehensive coverage of all exam topics",
                      "Real case laws with detailed analysis",
                      "Practice questions after each chapter",
                      "Revision notes and summaries",
                      "Mobile-friendly reading experience",
                      "DRM-protected secure content",
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contents">
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-serif text-xl font-semibold mb-4">Table of Contents</h2>
                  <div className="space-y-3">
                    {tableOfContents.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                            {i + 1}
                          </span>
                          <span className="font-medium text-foreground">{item.title}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Pages {item.pages}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardContent className="p-6 text-center py-12">
                  <p className="text-muted-foreground">Reviews coming soon</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6">
              {/* Price */}
              {material.is_premium && !isPurchased && (
                <div className="flex items-center gap-2 mb-6">
                  <IndianRupee className="h-6 w-6 text-foreground" />
                  <span className="text-4xl font-bold text-foreground">{material.price}</span>
                </div>
              )}

              {isPurchased ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">You have access to this material</span>
                  </div>
                  <Button className="w-full gap-2" size="lg" asChild>
                    <Link href={`/reader/${material.id}`}>
                      <BookOpen className="h-5 w-5" />
                      Start Reading
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button className="w-full gap-2" size="lg" onClick={handlePurchase} disabled={isLoading}>
                    <ShoppingCart className="h-5 w-5" />
                    {isLoading ? "Processing..." : "Buy Now"}
                  </Button>
                  <Button variant="outline" className="w-full gap-2 bg-transparent" size="lg">
                    <Play className="h-5 w-5" />
                    Preview Sample
                  </Button>
                </div>
              )}

              {/* Security Info */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <ShieldCheckIcon className="h-5 w-5 text-primary" />
                  <span>DRM protected with watermarks and device tracking</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
