"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { BookLawIcon, ScalesIcon } from "@/components/icons/legal-icons"
import { BookOpen, Bookmark, Clock, LogOut, Edit2, Save, Award, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { toast } from "sonner"

interface Profile {
  id: string
  full_name: string
  email: string
  phone: string
  avatar_url: string
  role: string
}

interface ProfileContentProps {
  user: SupabaseUser
  profile: Profile | null
}

export function ProfileContent({ user, profile }: ProfileContentProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
  })
  const [purchases, setPurchases] = useState<{ id: string; item_type: string; item_id: string; amount: number; created_at: string }[]>(
    [],
  )
  const [purchasedItems, setPurchasedItems] = useState<{ id: string; title: string; type: string; link: string }[]>([])
  const [savedCases, setSavedCases] = useState<{ id: string; case_id: string }[]>([])
  const [progress, setProgress] = useState<{ material_id: string; current_page: number; total_pages: number }[]>([])
  const [activityLogs, setActivityLogs] = useState<{ id: string; action: string; created_at: string }[]>([])
  const [subscription, setSubscription] = useState<{ plan_type: string; status: string; end_date: string } | null>(null)

  useEffect(() => {
    async function fetchUserData() {
      const supabase = createClient()

      const [purchasesRes, savedRes, progressRes, logsRes, subRes] = await Promise.all([
        supabase
          .from("purchases")
          .select("*")
          .eq("user_id", user.id)
          .eq("payment_status", "completed")
          .order("created_at", { ascending: false }),
        supabase.from("saved_cases").select("*").eq("user_id", user.id),
        supabase.from("user_progress").select("*").eq("user_id", user.id),
        supabase
          .from("activity_logs")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase.from("subscriptions").select("*").eq("user_id", user.id).eq("status", "active").single(),
      ])

      setPurchases(purchasesRes.data || [])
      setSavedCases(savedRes.data || [])
      setProgress(progressRes.data || [])
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
  }, [user.id])

  const handleSave = async () => {
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
      // Don't refresh - just update local state
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const totalProgress =
    progress.reduce((acc, p) => {
      return acc + Math.round((p.current_page / p.total_pages) * 100)
    }, 0) / (progress.length || 1)

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-accent">
                  <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {(profile?.full_name || user.email || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="font-serif text-xl font-bold text-foreground">{profile?.full_name || "User"}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <Badge variant="secondary" className="mt-2">
                  {profile?.role === "admin" ? "Administrator" : "Student"}
                </Badge>
              </div>

              {/* Subscription Status */}
              <div className="mt-6 p-4 rounded-lg bg-muted/50">
                {subscription ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">Premium Plan</span>
                      <Badge className="bg-green-500">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Expires: {new Date(subscription.end_date).toLocaleDateString()}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-foreground mb-2">Free Plan</p>
                    <Button size="sm" className="w-full" asChild>
                      <Link href="/pricing">Upgrade to Premium</Link>
                    </Button>
                  </>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <BookOpen className="h-6 w-6 mx-auto text-primary mb-1" />
                  <p className="text-xl font-bold text-foreground">{purchases.length}</p>
                  <p className="text-xs text-muted-foreground">Purchased</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <Bookmark className="h-6 w-6 mx-auto text-accent mb-1" />
                  <p className="text-xl font-bold text-foreground">{savedCases.length}</p>
                  <p className="text-xs text-muted-foreground">Saved Cases</p>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-6 gap-2 bg-transparent" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="purchases">Purchases</TabsTrigger>
              <TabsTrigger value="saved">Saved Cases</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Learning Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-accent" />
                    Learning Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Progress</span>
                        <span className="font-medium">{Math.round(totalProgress)}%</span>
                      </div>
                      <Progress value={totalProgress} />
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
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="hover:shadow-md transition-shadow">
                  <Link href="/study-materials">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <BookLawIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Study Materials</p>
                        <p className="text-sm text-muted-foreground">Continue learning</p>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                  <Link href="/court-tracker">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-accent/10">
                        <ScalesIcon className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Court Tracker</p>
                        <p className="text-sm text-muted-foreground">{savedCases.length} saved cases</p>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                  <Link href="/store">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Book Store</p>
                        <p className="text-sm text-muted-foreground">Browse books</p>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="purchases">
              <Card>
                <CardHeader>
                  <CardTitle>My Library</CardTitle>
                </CardHeader>
                <CardContent>
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
                        <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {item.type === 'book' ? (
                                <BookOpen className="h-4 w-4 text-primary" />
                              ) : (
                                <FileText className="h-4 w-4 text-accent" />
                              )}
                              <p className="font-medium text-foreground">{item.title}</p>
                              <Badge variant="outline" className="text-xs capitalize">
                                {item.type.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Purchased on {new Date(purchases.find(p => p.item_id === item.id)?.created_at || '').toLocaleDateString()}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
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
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Account Settings</span>
                    {!isEditing ? (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <Button size="sm" onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
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
                      <Input id="email" value={user.email || ""} disabled className="bg-muted" />
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