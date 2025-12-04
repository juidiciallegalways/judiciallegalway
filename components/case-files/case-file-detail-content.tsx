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
  Scale,
  Calendar,
  Building2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface CaseFile {
  id: string
  title: string
  description: string
  case_number: string
  court_name: string
  category: string
  subcategory: string
  year: number
  thumbnail_url: string
  is_premium: boolean
  price: number
  total_pages: number
  tags: string[]
}

export function CaseFileDetailContent({ caseFile }: { caseFile: CaseFile }) {
  const router = useRouter()
  const [isPurchased, setIsPurchased] = useState(!caseFile.is_premium)
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
          .eq("item_id", caseFile.id)
          .eq("item_type", "case_file")
          .eq("payment_status", "completed")
          .single()

        if (purchase) {
          setIsPurchased(true)
        }
      }
    }
    checkPurchase()
  }, [caseFile.id])

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
      item_id: caseFile.id,
      item_type: "case_file",
      amount: caseFile.price,
      payment_status: "completed",
      payment_id: `demo_${Date.now()}`,
    })

    if (!error) {
      setIsPurchased(true)
    }
    setIsLoading(false)
  }

  const caseDetails = [
    { label: "Case Number", value: caseFile.case_number, icon: FileText },
    { label: "Court", value: caseFile.court_name, icon: Building2 },
    { label: "Year", value: caseFile.year?.toString(), icon: Calendar },
    { label: "Category", value: caseFile.category, icon: Scale },
  ]

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      {/* Back Button */}
      <Button variant="ghost" className="mb-6 gap-2" asChild>
        <Link href="/case-files">
          <ArrowLeft className="h-4 w-4" />
          Back to Case Files
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Hero Section */}
          <div className="relative rounded-2xl overflow-hidden mb-8">
            <img
              src={
                caseFile.thumbnail_url ||
                `/placeholder.svg?height=400&width=800&query=${encodeURIComponent(caseFile.title)}`
              }
              alt={caseFile.title}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {caseFile.is_premium && (
                  <Badge className="bg-accent text-accent-foreground gap-1">
                    <Lock className="h-3 w-3" />
                    Premium
                  </Badge>
                )}
                <Badge className="bg-primary/90 text-primary-foreground gap-1">
                  <ShieldCheckIcon className="h-3 w-3" />
                  DRM Protected
                </Badge>
                {caseFile.case_number && (
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 font-mono">
                    {caseFile.case_number}
                  </Badge>
                )}
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2">{caseFile.title}</h1>
              <p className="text-white/80 line-clamp-2">{caseFile.description}</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Case Details</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-serif text-xl font-semibold mb-4">About This Case</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {caseFile.description ||
                      "Landmark judgment with detailed analysis and legal principles. Essential reading for judiciary exam preparation and legal research."}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                    <div className="text-center">
                      <FileText className="h-8 w-8 mx-auto text-primary mb-2" />
                      <p className="text-2xl font-bold text-foreground">{caseFile.total_pages}</p>
                      <p className="text-sm text-muted-foreground">Pages</p>
                    </div>
                    <div className="text-center">
                      <Clock className="h-8 w-8 mx-auto text-primary mb-2" />
                      <p className="text-2xl font-bold text-foreground">~{Math.ceil(caseFile.total_pages / 15)}h</p>
                      <p className="text-sm text-muted-foreground">Reading Time</p>
                    </div>
                    <div className="text-center">
                      <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                      <p className="text-2xl font-bold text-foreground">1.8k+</p>
                      <p className="text-sm text-muted-foreground">Readers</p>
                    </div>
                    <div className="text-center">
                      <BookLawIcon className="h-8 w-8 mx-auto text-primary mb-2" />
                      <p className="text-2xl font-bold text-foreground">{caseFile.year}</p>
                      <p className="text-sm text-muted-foreground">Year</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="font-serif text-xl font-semibold mb-4">Key Features</h2>
                  <ul className="space-y-3">
                    {[
                      "Complete judgment with detailed reasoning",
                      "Legal principles and precedents cited",
                      "Headnotes and case summary",
                      "Relevant sections and statutes",
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

              {caseFile.tags && caseFile.tags.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="font-serif text-xl font-semibold mb-4">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {caseFile.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="details">
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-serif text-xl font-semibold mb-4">Case Information</h2>
                  <div className="space-y-4">
                    {caseDetails.map((detail, i) => {
                      const Icon = detail.icon
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">{detail.label}</p>
                            <p className="font-medium text-foreground">{detail.value || "N/A"}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {caseFile.subcategory && (
                    <div className="mt-6 pt-6 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Subcategory</p>
                      <Badge variant="outline" className="text-base">
                        {caseFile.subcategory}
                      </Badge>
                    </div>
                  )}
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
              {caseFile.is_premium && !isPurchased && (
                <div className="flex items-center gap-2 mb-6">
                  <IndianRupee className="h-6 w-6 text-foreground" />
                  <span className="text-4xl font-bold text-foreground">{caseFile.price}</span>
                </div>
              )}

              {isPurchased ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">You have access to this case file</span>
                  </div>
                  <Button className="w-full gap-2" size="lg" asChild>
                    <Link href={`/reader/${caseFile.id}`}>
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
