"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import {
  User,
  ShoppingBag,
  Bookmark,
  Activity,
  Settings,
  LogOut,
  Edit2,
  Save,
  X,
  BookOpen,
  FileText,
  Clock,
  TrendingUp,
  Award,
  Target,
  Scale,
  Gavel,
} from "lucide-react"

interface Profile {
  id: string
  full_name: string
  email: string
  phone: string
  avatar_url: string
  role: string
}

export function ProfileContent() {
  const router = useRouter()
  const { user, profile: authProfile, refreshProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [purchases, setPurchases] = useState<any[]>([])
  const [savedCases, setSavedCases] = useState<any[]>([])
  const [progress, setProgress] = useState<any[]>([])
  const [activityLogs, setActivityLogs] = useState<any[]>([])
  const [subscription, setSubscription] = useState<any>(null)
  const [purchasedItems, setPurchasedItems] = useState<any[]>([])
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    avatar_url: "",
  })
  const supabase = createClient()

  useEffect(() => {
    if (authProfile) {
      setFormData({
        full_name: authProfile.full_name || "",
        phone: authProfile.phone || "",
        avatar_url: authProfile.avatar_url || "",
      })
    }
  }, [authProfile])

  useEffect(() => {
    if (!user) {
      console.log('No user found in auth context')
      return
    }
    
    console.log('User authenticated:', user.id, user.email)
    
    async function fetchUserData() {
      const supabase = createClient()
      const userId = user.id

      const [purchasesRes, savedRes, caseProgressRes, bookProgressRes, logsRes, subRes] = await Promise.all([
        supabase
          .from("purchases")
          .select("*")
          .eq("user_id", userId)
          .eq("payment_status", "completed")
          .order("created_at", { ascending: false }),
        supabase.from("saved_cases").select("*").eq("user_id", userId),
        supabase.from("case_file_progress").select("*").eq("user_id", userId),
        supabase.from("book_progress").select("*").eq("user_id", userId),
        supabase
          .from("activity_logs")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase.from("subscriptions").select("*").eq("user_id", userId).eq("status", "active").single(),
      ])

      // Log errors if any
      if (purchasesRes.error) console.error('Purchases error:', purchasesRes.error)
      if (savedRes.error) console.error('Saved cases error:', savedRes.error)
      if (caseProgressRes.error) console.error('Case progress error:', caseProgressRes.error)
      if (bookProgressRes.error) console.error('Book progress error:', bookProgressRes.error)
      if (logsRes.error) console.error('Activity logs error:', logsRes.error)
      if (subRes.error && subRes.error.code !== 'PGRST116') console.error('Subscription error:', subRes.error)

      console.log('Profile data fetched:', {
        userId: userId,
        purchases: purchasesRes.data?.length || 0,
        savedCases: savedRes.data?.length || 0,
        caseProgress: caseProgressRes.data?.length || 0,
        bookProgress: bookProgressRes.data?.length || 0,
        activityLogs: logsRes.data?.length || 0,
        subscription: subRes.data
      })

      setPurchases(purchasesRes.data || [])
      setSavedCases(savedRes.data || [])
      
      // Combine case file and book progress
      const allProgress = [
        ...(caseProgressRes.data || []).map(p => ({ ...p, material_id: p.case_file_id })),
        ...(bookProgressRes.data || []).map(p => ({ ...p, material_id: p.book_id }))
      ]
      setProgress(allProgress)
      setActivityLogs(logsRes.data || [])
      setSubscription(subRes.data)

      // Fetch purchased items details
      if (purchasesRes.data && purchasesRes.data.length > 0) {
        const items: { id: string; title: string; type: string; link: string }[] = []
        
        for (const purchase of purchasesRes.data) {
          if (purchase.item_type === 'book') {
            const { data: book } = await supabase
              .from('books')
              .select('id, title')
              .eq('id', purchase.item_id)
              .single()
            if (book) {
              items.push({ id: book.id, title: book.title, type: 'book', link: `/store/read/${book.id}` })
            }
          } else if (purchase.item_type === 'case_file') {
            const { data: caseFile } = await supabase
              .from('case_files')
              .select('id, title')
              .eq('id', purchase.item_id)
              .single()
            if (caseFile) {
              items.push({ id: caseFile.id, title: caseFile.title, type: 'case_file', link: `/reader/${caseFile.id}` })
            }
          }
        }
        
        setPurchasedItems(items)
      }
    }
    
    fetchUserData()
  }, [user])

  const handleSave = async () => {
    if (!user) return
    
    const supabase = createClient()
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      ...formData,
      email: user.email,
      updated_at: new Date().toISOString(),
    })
    if (error) {
      toast.error("Failed to update profile")
    } else {
      setIsEditing(false)
      toast.success("Profile updated successfully")
      refreshProfile()
    }
  }

  const handleSignOut = async () => {
    if (!user) return
    
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const totalProgress =
    progress.reduce((acc, p) => {
      return acc + Math.round((p.current_page / p.total_pages) * 100)
    }, 0) / (progress.length || 1)

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4 sm:py-8 lg:px-8 overflow-hidden">
      <div className="grid gap-4 sm:gap-8 lg:grid-cols-3 w-full">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 mx-auto mb-3 sm:mb-4 border-4 border-accent">
                  <AvatarImage src={authProfile?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl sm:text-2xl">
                    {(authProfile?.full_name || user?.email || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-foreground">{authProfile?.full_name || "User"}</h2>
                <p className="text-sm sm:text-base text-muted-foreground truncate px-2">{user?.email}</p>
                <Badge variant="secondary" className="mt-2">
                  {authProfile?.role === "admin" ? "Administrator" : authProfile?.role === "lawyer" ? "Lawyer" : "Student"}
                </Badge>
              </div>

              {/* Subscription Status */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg bg-muted/50">
                {subscription ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground text-sm sm:text-base">Premium Plan</span>
                      <Badge className="bg-green-500 text-xs">Active</Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Expires: {new Date(subscription.end_date).toLocaleDateString()}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-foreground mb-2 text-sm sm:text-base">Free Plan</p>
                    <Button size="sm" className="w-full text-xs sm:text-sm" asChild>
                      <Link href="/pricing">Upgrade to Premium</Link>
                    </Button>
                  </>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                <div className="text-center p-2 sm:p-3 rounded-lg bg-muted/50">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-primary mb-1" />
                  <p className="text-lg sm:text-xl font-bold text-foreground">{purchases.length}</p>
                  <p className="text-xs text-muted-foreground">Purchased</p>
                </div>
                <div className="text-center p-2 sm:p-3 rounded-lg bg-muted/50">
                  <Bookmark className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-accent mb-1" />
                  <p className="text-lg sm:text-xl font-bold text-foreground">{savedCases.length}</p>
                  <p className="text-xs text-muted-foreground">Saved Cases</p>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4 sm:mt-6 gap-2 bg-transparent text-sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 min-w-0 w-full">
          <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6 w-full">
            <div className="w-full overflow-hidden pb-2 sm:overflow-visible">
              <TabsList className="grid w-full grid-cols-5 sm:flex sm:w-full sm:justify-start p-1 bg-muted rounded-lg h-auto">
                <TabsTrigger value="overview" className="text-xs sm:text-sm px-1 sm:px-3 py-1.5 sm:py-2">
                  <span className="hidden sm:inline">Overview</span>
                  <span className="sm:hidden">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="purchases" className="text-xs sm:text-sm px-1 sm:px-3 py-1.5 sm:py-2">
                  <span className="hidden sm:inline">Purchases</span>
                  <span className="sm:hidden">Purchases</span>
                </TabsTrigger>
                <TabsTrigger value="saved" className="text-xs sm:text-sm px-1 sm:px-3 py-1.5 sm:py-2">
                  <span className="hidden sm:inline">Saved Cases</span>
                  <span className="sm:hidden">Saved</span>
                </TabsTrigger>
                <TabsTrigger value="activity" className="text-xs sm:text-sm px-1 sm:px-3 py-1.5 sm:py-2">
                  <span className="hidden sm:inline">Activity</span>
                  <span className="sm:hidden">Activity</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs sm:text-sm px-1 sm:px-3 py-1.5 sm:py-2">
                  <span className="hidden sm:inline">Settings</span>
                  <span className="sm:hidden">Settings</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-4 sm:space-y-6 w-full">
              {/* Learning Progress */}
              <Card className="w-full">
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                    Learning Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 w-full">
                  <div className="w-full mb-4">
                    <div className="w-full">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Progress</span>
                        <span className="font-medium">{Math.round(totalProgress)}%</span>
                      </div>
                      <Progress value={totalProgress} className="w-full" />
                    </div>
                  </div>

                  {progress.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Start reading to track your progress</p>
                  ) : (
                    <div className="space-y-3">
                      {progress.slice(0, 3).map((p) => (
                        <div key={p.material_id} className="flex items-center gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-medium">Material</p>
                            <Progress value={(p.current_page / p.total_pages) * 100} className="h-2 mt-1" />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {p.current_page}/{p.total_pages} pages
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full">
                <Card className="hover:shadow-md transition-shadow w-full">
                  <Link href="/case-files">
                    <CardContent className="p-3 sm:p-4 flex items-center gap-3 w-full">
                      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                        <Scale className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm truncate">Case Files</p>
                        <p className="text-xs text-muted-foreground truncate">Continue learning</p>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
                <Card className="hover:shadow-md transition-shadow w-full">
                  <Link href="/court-tracker">
                    <CardContent className="p-3 sm:p-4 flex items-center gap-3 w-full">
                      <div className="p-2 rounded-lg bg-accent/10 shrink-0">
                        <Gavel className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm truncate">Court Tracker</p>
                        <p className="text-xs text-muted-foreground truncate">{savedCases.length} saved cases</p>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
                <Card className="hover:shadow-md transition-shadow w-full sm:col-span-2 lg:col-span-1">
                  <Link href="/store">
                    <CardContent className="p-3 sm:p-4 flex items-center gap-3 w-full">
                      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm truncate">Book Store</p>
                        <p className="text-xs text-muted-foreground truncate">Browse books</p>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="purchases">
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-base sm:text-lg">My Library</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {purchasedItems.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground mb-4">No purchased items yet</p>
                      <Button variant="outline" asChild>
                        <Link href="/store">Browse Store</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {purchasedItems.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              {item.type === 'book' ? (
                                <BookOpen className="h-4 w-4 text-primary shrink-0" />
                              ) : (
                                <FileText className="h-4 w-4 text-accent shrink-0" />
                              )}
                              <p className="font-medium text-foreground text-sm sm:text-base truncate">{item.title}</p>
                              <Badge variant="outline" className="text-xs capitalize shrink-0">
                                {item.type.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Purchased on {new Date(purchases.find(p => p.item_id === item.id)?.created_at || '').toLocaleDateString()}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm" asChild>
                            <Link href={item.link}>
                              <BookOpen className="h-4 w-4 mr-2" />
                              Read
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="saved">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  {savedCases.length === 0 ? (
                    <div className="text-center py-8">
                      <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No saved cases</p>
                      <Button variant="outline" className="mt-4 bg-transparent" asChild>
                        <Link href="/court-tracker">Browse Cases</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {savedCases.map((sc) => (
                        <div key={sc.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                          <span className="font-medium">Case ID: {sc.case_id.slice(0, 8)}...</span>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href="/court-tracker">View</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  {activityLogs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No activity yet</p>
                  ) : (
                    <div className="space-y-3">
                      {activityLogs.map((log) => (
                        <div key={log.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm text-foreground">{log.action}</p>
                            <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-base sm:text-lg">Account Settings</span>
                    {!isEditing ? (
                      <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm" onClick={() => setIsEditing(true)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <Button size="sm" className="w-full sm:w-auto text-xs sm:text-sm" onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 pt-0">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.full_name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}