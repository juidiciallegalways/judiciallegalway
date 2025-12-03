"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ScalesIcon } from "@/components/icons/legal-icons"
import {
  Users,
  BookOpen,
  IndianRupee,
  TrendingUp,
  Settings,
  BarChart3,
  LogOut,
  Home,
  Gavel,
  Plus,
  Eye,
  Trash2,
  Edit2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const revenueData = [
  { month: "Jan", revenue: 45000 },
  { month: "Feb", revenue: 52000 },
  { month: "Mar", revenue: 48000 },
  { month: "Apr", revenue: 61000 },
  { month: "May", revenue: 55000 },
  { month: "Jun", revenue: 67000 },
]

const userGrowthData = [
  { month: "Jan", users: 1200 },
  { month: "Feb", users: 1450 },
  { month: "Mar", users: 1680 },
  { month: "Apr", users: 1920 },
  { month: "May", users: 2150 },
  { month: "Jun", users: 2400 },
]

const categoryData = [
  { name: "IPC", value: 35 },
  { name: "CrPC", value: 25 },
  { name: "CPC", value: 20 },
  { name: "Evidence", value: 12 },
  { name: "Others", value: 8 },
]

const COLORS = ["#22334A", "#B39563", "#D72638", "#4A9D9A", "#7C4DFF"]

const categories = [
  "IPC",
  "CrPC",
  "CPC",
  "Evidence Act",
  "Constitutional Law",
  "Contract Law",
  "Property Law",
  "Family Law",
]

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [materials, setMaterials] = useState<
    { id: string; title: string; category: string; is_published: boolean; price: number }[]
  >([])
  const [users, setUsers] = useState<
    { id: string; email: string; full_name: string; role: string; created_at: string }[]
  >([])
  const [cases, setCases] = useState<{ id: string; case_number: string; status: string; court_name: string }[]>([])
  const [showAddMaterial, setShowAddMaterial] = useState(false)
  const [showAddCase, setShowAddCase] = useState(false)
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    description: "",
    category: "IPC",
    price: "",
    is_premium: false,
    total_pages: "",
  })
  const [newCase, setNewCase] = useState({
    case_number: "",
    case_title: "",
    court_name: "",
    judge_name: "",
    status: "pending",
  })

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      const [materialsRes, usersRes, casesRes] = await Promise.all([
        supabase.from("study_materials").select("id, title, category, is_published, price"),
        supabase
          .from("profiles")
          .select("id, email, full_name, role, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("court_cases").select("id, case_number, status, court_name"),
      ])

      setMaterials(materialsRes.data || [])
      setUsers(usersRes.data || [])
      setCases(casesRes.data || [])
    }
    fetchData()
  }, [])

  const handleAddMaterial = async () => {
    const supabase = createClient()
    await supabase.from("study_materials").insert({
      title: newMaterial.title,
      description: newMaterial.description,
      category: newMaterial.category,
      price: Number.parseFloat(newMaterial.price) || 0,
      is_premium: newMaterial.is_premium,
      total_pages: Number.parseInt(newMaterial.total_pages) || 100,
      is_published: false,
    })
    setShowAddMaterial(false)
    setNewMaterial({ title: "", description: "", category: "IPC", price: "", is_premium: false, total_pages: "" })
    const { data } = await supabase.from("study_materials").select("id, title, category, is_published, price")
    setMaterials(data || [])
  }

  const handleAddCase = async () => {
    const supabase = createClient()
    await supabase.from("court_cases").insert({
      case_number: newCase.case_number,
      case_title: newCase.case_title,
      court_name: newCase.court_name,
      judge_name: newCase.judge_name,
      status: newCase.status,
    })
    setShowAddCase(false)
    setNewCase({ case_number: "", case_title: "", court_name: "", judge_name: "", status: "pending" })
    const { data } = await supabase.from("court_cases").select("id, case_number, status, court_name")
    setCases(data || [])
  }

  const togglePublish = async (id: string, current: boolean) => {
    const supabase = createClient()
    await supabase.from("study_materials").update({ is_published: !current }).eq("id", id)
    setMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, is_published: !current } : m)))
  }

  const deleteMaterial = async (id: string) => {
    const supabase = createClient()
    await supabase.from("study_materials").delete().eq("id", id)
    setMaterials((prev) => prev.filter((m) => m.id !== id))
  }

  const updateUserRole = async (userId: string, role: string) => {
    const supabase = createClient()
    await supabase.from("profiles").update({ role }).eq("id", userId)
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)))
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-[#0B1017]">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-[#0B1017]/95 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <ScalesIcon className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <span className="font-serif text-lg font-bold text-white">Admin</span>
                <span className="ml-1 text-sm text-gray-400">Panel</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white" asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                View Site
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 border-r border-gray-800 min-h-[calc(100vh-4rem)] p-4">
          <nav className="space-y-2">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "materials", label: "Study Materials", icon: BookOpen },
              { id: "cases", label: "Court Cases", icon: Gavel },
              { id: "users", label: "Users", icon: Users },
              { id: "analytics", label: "Analytics", icon: TrendingUp },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-accent text-accent-foreground"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {activeTab === "overview" && (
            <div className="space-y-8">
              <h1 className="font-serif text-2xl font-bold text-white">Dashboard Overview</h1>

              {/* Stats Cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    label: "Total Revenue",
                    value: "₹3,28,000",
                    change: "+12%",
                    icon: IndianRupee,
                    color: "text-green-500",
                  },
                  {
                    label: "Active Users",
                    value: users.length.toString(),
                    change: "+8%",
                    icon: Users,
                    color: "text-blue-500",
                  },
                  {
                    label: "Study Materials",
                    value: materials.length.toString(),
                    change: "+5",
                    icon: BookOpen,
                    color: "text-accent",
                  },
                  {
                    label: "Court Cases",
                    value: cases.length.toString(),
                    change: "+15",
                    icon: Gavel,
                    color: "text-purple-500",
                  },
                ].map((stat, i) => (
                  <Card key={i} className="bg-gray-900 border-gray-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">{stat.label}</p>
                          <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                          <p className={`text-sm ${stat.color} mt-1`}>{stat.change}</p>
                        </div>
                        <div className={`p-3 rounded-lg bg-gray-800 ${stat.color}`}>
                          <stat.icon className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Revenue Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="month" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#1F2937", border: "none" }}
                            labelStyle={{ color: "#F3F4F6" }}
                          />
                          <Bar dataKey="revenue" fill="#B39563" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">User Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={userGrowthData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="month" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#1F2937", border: "none" }}
                            labelStyle={{ color: "#F3F4F6" }}
                          />
                          <Line type="monotone" dataKey="users" stroke="#22334A" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "materials" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="font-serif text-2xl font-bold text-white">Study Materials</h1>
                <Dialog open={showAddMaterial} onOpenChange={setShowAddMaterial}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Material
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-800 text-white">
                    <DialogHeader>
                      <DialogTitle>Add New Study Material</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={newMaterial.title}
                          onChange={(e) => setNewMaterial((prev) => ({ ...prev, title: e.target.value }))}
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={newMaterial.description}
                          onChange={(e) => setNewMaterial((prev) => ({ ...prev, description: e.target.value }))}
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select
                            value={newMaterial.category}
                            onValueChange={(v) => setNewMaterial((prev) => ({ ...prev, category: v }))}
                          >
                            <SelectTrigger className="bg-gray-800 border-gray-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Price (₹)</Label>
                          <Input
                            type="number"
                            value={newMaterial.price}
                            onChange={(e) => setNewMaterial((prev) => ({ ...prev, price: e.target.value }))}
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Total Pages</Label>
                          <Input
                            type="number"
                            value={newMaterial.total_pages}
                            onChange={(e) => setNewMaterial((prev) => ({ ...prev, total_pages: e.target.value }))}
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                        <div className="flex items-center gap-3 pt-6">
                          <Switch
                            checked={newMaterial.is_premium}
                            onCheckedChange={(v) => setNewMaterial((prev) => ({ ...prev, is_premium: v }))}
                          />
                          <Label>Premium Content</Label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddMaterial(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddMaterial}>Add Material</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="bg-gray-900 border-gray-800">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-gray-800/50">
                      <TableHead className="text-gray-400">Title</TableHead>
                      <TableHead className="text-gray-400">Category</TableHead>
                      <TableHead className="text-gray-400">Price</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((material) => (
                      <TableRow key={material.id} className="border-gray-800 hover:bg-gray-800/50">
                        <TableCell className="text-white font-medium">{material.title}</TableCell>
                        <TableCell className="text-gray-300">{material.category}</TableCell>
                        <TableCell className="text-gray-300">₹{material.price || "Free"}</TableCell>
                        <TableCell>
                          <Badge variant={material.is_published ? "default" : "secondary"}>
                            {material.is_published ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => togglePublish(material.id, material.is_published)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteMaterial(material.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {materials.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                          No study materials yet. Add your first one!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {activeTab === "cases" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="font-serif text-2xl font-bold text-white">Court Cases</h1>
                <Dialog open={showAddCase} onOpenChange={setShowAddCase}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Case
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-800 text-white">
                    <DialogHeader>
                      <DialogTitle>Add New Court Case</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Case Number</Label>
                        <Input
                          value={newCase.case_number}
                          onChange={(e) => setNewCase((prev) => ({ ...prev, case_number: e.target.value }))}
                          className="bg-gray-800 border-gray-700"
                          placeholder="e.g., CIV/2024/001234"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Case Title</Label>
                        <Input
                          value={newCase.case_title}
                          onChange={(e) => setNewCase((prev) => ({ ...prev, case_title: e.target.value }))}
                          className="bg-gray-800 border-gray-700"
                          placeholder="e.g., State vs. John Doe"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Court Name</Label>
                          <Input
                            value={newCase.court_name}
                            onChange={(e) => setNewCase((prev) => ({ ...prev, court_name: e.target.value }))}
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Judge Name</Label>
                          <Input
                            value={newCase.judge_name}
                            onChange={(e) => setNewCase((prev) => ({ ...prev, judge_name: e.target.value }))}
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                          value={newCase.status}
                          onValueChange={(v) => setNewCase((prev) => ({ ...prev, status: v }))}
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="hearing_today">Hearing Today</SelectItem>
                            <SelectItem value="adjourned">Adjourned</SelectItem>
                            <SelectItem value="disposed">Disposed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddCase(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddCase}>Add Case</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="bg-gray-900 border-gray-800">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-gray-800/50">
                      <TableHead className="text-gray-400">Case Number</TableHead>
                      <TableHead className="text-gray-400">Court</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cases.map((caseItem) => (
                      <TableRow key={caseItem.id} className="border-gray-800 hover:bg-gray-800/50">
                        <TableCell className="text-white font-medium">{caseItem.case_number}</TableCell>
                        <TableCell className="text-gray-300">{caseItem.court_name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              caseItem.status === "hearing_today"
                                ? "destructive"
                                : caseItem.status === "disposed"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {caseItem.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {cases.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-400 py-8">
                          No court cases yet. Add your first one!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              <h1 className="font-serif text-2xl font-bold text-white">User Management</h1>

              <Card className="bg-gray-900 border-gray-800">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-gray-800/50">
                      <TableHead className="text-gray-400">User</TableHead>
                      <TableHead className="text-gray-400">Email</TableHead>
                      <TableHead className="text-gray-400">Role</TableHead>
                      <TableHead className="text-gray-400">Joined</TableHead>
                      <TableHead className="text-gray-400 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="border-gray-800 hover:bg-gray-800/50">
                        <TableCell className="text-white font-medium">{user.full_name || "—"}</TableCell>
                        <TableCell className="text-gray-300">{user.email}</TableCell>
                        <TableCell>
                          <Select value={user.role || "student"} onValueChange={(v) => updateUserRole(user.id, v)}>
                            <SelectTrigger className="w-[120px] bg-gray-800 border-gray-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                          No users yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-8">
              <h1 className="font-serif text-2xl font-bold text-white">Analytics</h1>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Content by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {categoryData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "none" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Monthly Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { label: "Total Page Views", value: "125,430", change: "+18%" },
                        { label: "Avg. Session Duration", value: "24 min", change: "+5%" },
                        { label: "Course Completion Rate", value: "68%", change: "+12%" },
                        { label: "Customer Satisfaction", value: "4.8/5", change: "+0.2" },
                      ].map((metric, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-gray-800">
                          <div>
                            <p className="text-sm text-gray-400">{metric.label}</p>
                            <p className="text-xl font-bold text-white">{metric.value}</p>
                          </div>
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                            {metric.change}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <h1 className="font-serif text-2xl font-bold text-white">Settings</h1>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Platform Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">Maintenance Mode</p>
                        <p className="text-sm text-gray-400">Disable site access for maintenance</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">User Registrations</p>
                        <p className="text-sm text-gray-400">Allow new user signups</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">Email Notifications</p>
                        <p className="text-sm text-gray-400">Send system emails</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">DRM Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">Watermark Enabled</p>
                        <p className="text-sm text-gray-400">Show user watermark on content</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">Screenshot Protection</p>
                        <p className="text-sm text-gray-400">Detect screenshot attempts</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">Copy Protection</p>
                        <p className="text-sm text-gray-400">Disable text selection & copy</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
