"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CourtBuildingIcon, ScalesIcon, GavelIcon } from "@/components/icons/legal-icons"
import {
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  Calendar,
  User,
  MapPin,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Bell,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface CourtCase {
  id: string
  case_number: string
  case_title: string
  party_names: string[]
  advocate_names: string[]
  court_name: string
  court_type: string
  state: string
  judge_name: string
  status: string
  case_summary: string
  filing_date: string
  next_hearing_date: string
  disposal_date: string | null
}

const states = [
  "All States",
  "Delhi",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Gujarat",
  "Rajasthan",
  "Uttar Pradesh",
  "West Bengal",
  "Madhya Pradesh",
  "Kerala",
]

const courtTypes = ["All Courts", "Supreme Court", "High Court", "District Court", "Sessions Court", "Tribunal"]

const statuses = ["All Status", "Pending", "Hearing Today", "Listed", "Reserved", "Disposed"]

// Demo cases for initial display
const demoCases: CourtCase[] = [
  {
    id: "1",
    case_number: "WP(C) 2024/1234",
    case_title: "State of Delhi vs. ABC Corporation",
    party_names: ["State of Delhi", "ABC Corporation"],
    advocate_names: ["Adv. Rajesh Kumar", "Adv. Priya Sharma"],
    court_name: "Delhi High Court",
    court_type: "High Court",
    state: "Delhi",
    judge_name: "Justice S.K. Verma",
    status: "Hearing Today",
    case_summary: "Writ petition challenging the validity of certain provisions under environmental regulations.",
    filing_date: "2024-01-15",
    next_hearing_date: new Date().toISOString().split("T")[0],
    disposal_date: null,
  },
  {
    id: "2",
    case_number: "SLP(Crl) 2024/567",
    case_title: "Ramesh Kumar vs. Union of India",
    party_names: ["Ramesh Kumar", "Union of India"],
    advocate_names: ["Adv. Amit Singh"],
    court_name: "Supreme Court of India",
    court_type: "Supreme Court",
    state: "Delhi",
    judge_name: "Justice A.K. Reddy",
    status: "Pending",
    case_summary: "Special leave petition against High Court judgment in criminal matter.",
    filing_date: "2024-02-20",
    next_hearing_date: "2024-12-15",
    disposal_date: null,
  },
  {
    id: "3",
    case_number: "CA 2024/890",
    case_title: "XYZ Ltd vs. PQR Industries",
    party_names: ["XYZ Ltd", "PQR Industries"],
    advocate_names: ["Adv. Sunita Devi", "Adv. Mohammed Ali"],
    court_name: "Bombay High Court",
    court_type: "High Court",
    state: "Maharashtra",
    judge_name: "Justice M.N. Patil",
    status: "Disposed",
    case_summary: "Civil appeal regarding breach of contract and damages.",
    filing_date: "2023-08-10",
    next_hearing_date: "2024-11-01",
    disposal_date: "2024-11-01",
  },
]

export function CourtTrackerContent() {
  const [cases, setCases] = useState<CourtCase[]>(demoCases)
  const [savedCases, setSavedCases] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedState, setSelectedState] = useState("All States")
  const [selectedCourtType, setSelectedCourtType] = useState("All Courts")
  const [selectedStatus, setSelectedStatus] = useState("All Status")
  const [loading, setLoading] = useState(false)
  const [selectedCase, setSelectedCase] = useState<CourtCase | null>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      // Fetch cases from database
      const { data: casesData } = await supabase
        .from("court_cases")
        .select("*")
        .order("next_hearing_date", { ascending: true })

      if (casesData && casesData.length > 0) {
        setCases(casesData)
      }

      // Fetch saved cases
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: saved } = await supabase.from("saved_cases").select("case_id").eq("user_id", user.id)

        setSavedCases(new Set(saved?.map((s) => s.case_id) || []))
      }
    }
    fetchData()
  }, [])

  const toggleSaveCase = async (caseId: string) => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // Redirect to login
      window.location.href = "/auth/login"
      return
    }

    if (savedCases.has(caseId)) {
      await supabase.from("saved_cases").delete().eq("user_id", user.id).eq("case_id", caseId)

      setSavedCases((prev) => {
        const next = new Set(prev)
        next.delete(caseId)
        return next
      })
    } else {
      await supabase.from("saved_cases").insert({ user_id: user.id, case_id: caseId })

      setSavedCases((prev) => new Set([...prev, caseId]))
    }
  }

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      searchQuery === "" ||
      c.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.case_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.party_names.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.advocate_names.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesState = selectedState === "All States" || c.state === selectedState
    const matchesCourt = selectedCourtType === "All Courts" || c.court_type === selectedCourtType
    const matchesStatus = selectedStatus === "All Status" || c.status === selectedStatus

    return matchesSearch && matchesState && matchesCourt && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      "Hearing Today": "bg-destructive text-destructive-foreground",
      Pending: "bg-amber-500 text-white",
      Listed: "bg-blue-500 text-white",
      Reserved: "bg-purple-500 text-white",
      Disposed: "bg-green-500 text-white",
    }
    return styles[status] || "bg-muted text-muted-foreground"
  }

  const CaseCard = ({ case: c }: { case: CourtCase }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className="group hover:shadow-xl transition-all h-full rounded-xl border-l-4" style={{
        borderLeftColor: c.status === "Hearing Today" ? "hsl(var(--destructive))" : 
                        c.status === "Disposed" ? "hsl(var(--green-500))" : 
                        "hsl(var(--border))"
      }}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getStatusBadge(c.status)}>{c.status}</Badge>
                {c.status === "Hearing Today" && (
                  <motion.span
                    className="relative flex h-2 w-2"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
                  </motion.span>
                )}
              </div>
              <h3 className="font-serif font-semibold text-foreground group-hover:text-primary transition-colors">
                {c.case_number}
              </h3>
            </div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleSaveCase(c.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {savedCases.has(c.id) ? (
                  <BookmarkCheck className="h-5 w-5 text-accent" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </Button>
            </motion.div>
          </div>

          <p className="text-sm text-foreground font-medium mb-4 line-clamp-2">{c.case_title}</p>

          <div className="space-y-2.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <CourtBuildingIcon className="h-4 w-4 flex-shrink-0 text-accent" />
              <span className="truncate">{c.court_name}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <GavelIcon className="h-4 w-4 flex-shrink-0 text-primary" />
              <span className="truncate">{c.judge_name}</span>
            </div>
            {c.next_hearing_date && c.status !== "Disposed" && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/5">
                <Calendar className="h-4 w-4 flex-shrink-0 text-accent" />
                <span className="font-medium">
                  Next:{" "}
                  {new Date(c.next_hearing_date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" className="w-full mt-4 bg-transparent" onClick={() => setSelectedCase(c)}>
                  View Details
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">{c.case_number}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-2">
                <Badge className={getStatusBadge(c.status)}>{c.status}</Badge>
                <Badge variant="outline">{c.court_type}</Badge>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Case Title</h4>
                <p className="text-muted-foreground">{c.case_title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Court</h4>
                  <p className="text-muted-foreground">{c.court_name}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Presiding Judge</h4>
                  <p className="text-muted-foreground">{c.judge_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Parties</h4>
                  <ul className="space-y-1">
                    {c.party_names.map((party, i) => (
                      <li key={i} className="text-muted-foreground flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {party}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Advocates</h4>
                  <ul className="space-y-1">
                    {c.advocate_names.map((adv, i) => (
                      <li key={i} className="text-muted-foreground flex items-center gap-2">
                        <ScalesIcon className="h-4 w-4" />
                        {adv}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Filing Date</h4>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(c.filing_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    {c.status === "Disposed" ? "Disposal Date" : "Next Hearing"}
                  </h4>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {c.status === "Disposed" && c.disposal_date
                      ? new Date(c.disposal_date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : c.next_hearing_date
                        ? new Date(c.next_hearing_date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "Not scheduled"}
                  </p>
                </div>
              </div>

              {c.case_summary && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Case Summary</h4>
                  <p className="text-muted-foreground">{c.case_summary}</p>
                </div>
              )}

              <Button className="w-full gap-2" onClick={() => toggleSaveCase(c.id)}>
                {savedCases.has(c.id) ? (
                  <>
                    <BookmarkCheck className="h-4 w-4" />
                    Saved to Watchlist
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4" />
                    Save to Watchlist
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      {/* Stats Cards */}
      <motion.div
        className="grid gap-4 md:grid-cols-4 mb-8"
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
        {[
          { label: "Total Cases", value: cases.length.toString(), icon: FileText, color: "text-primary", bgColor: "bg-primary/10" },
          {
            label: "Hearing Today",
            value: cases.filter((c) => c.status === "Hearing Today").length.toString(),
            icon: AlertCircle,
            color: "text-destructive",
            bgColor: "bg-destructive/10"
          },
          {
            label: "Pending",
            value: cases.filter((c) => c.status === "Pending").length.toString(),
            icon: Clock,
            color: "text-amber-500",
            bgColor: "bg-amber-500/10"
          },
          {
            label: "Disposed",
            value: cases.filter((c) => c.status === "Disposed").length.toString(),
            icon: CheckCircle,
            color: "text-green-500",
            bgColor: "bg-green-500/10"
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="hover:shadow-lg transition-shadow rounded-xl">
              <CardContent className="p-5 flex items-center gap-4">
                <motion.div
                  className={`p-3 rounded-xl ${stat.bgColor} ${stat.color}`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <stat.icon className="h-6 w-6" />
                </motion.div>
                <div>
                  <motion.p
                    className="text-3xl font-bold text-foreground"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 + 0.2, type: "spring" }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="mb-8 rounded-xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by case number, party name, or advocate..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="w-[150px]">
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCourtType} onValueChange={setSelectedCourtType}>
                  <SelectTrigger className="w-[150px]">
                    <CourtBuildingIcon className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {courtTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Active Filters Summary */}
            {(selectedState !== "All States" || selectedCourtType !== "All Courts" || selectedStatus !== "All Status") && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-muted-foreground"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Showing <span className="font-semibold text-foreground">{filteredCases.length}</span> results</span>
                {selectedState !== "All States" && <Badge variant="secondary">{selectedState}</Badge>}
                {selectedCourtType !== "All Courts" && <Badge variant="secondary">{selectedCourtType}</Badge>}
                {selectedStatus !== "All Status" && <Badge variant="secondary">{selectedStatus}</Badge>}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Results */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Cases ({filteredCases.length})</TabsTrigger>
          <TabsTrigger value="saved">Saved ({savedCases.size})</TabsTrigger>
          <TabsTrigger value="today">
            Hearing Today ({filteredCases.filter((c) => c.status === "Hearing Today").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {filteredCases.length === 0 ? (
            <Card className="p-12 text-center">
              <CourtBuildingIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">No cases found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCases.map((c) => (
                <CaseCard key={c.id} case={c} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved">
          {savedCases.size === 0 ? (
            <Card className="p-12 text-center">
              <Bookmark className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">No saved cases</h3>
              <p className="text-muted-foreground">Save cases to track them here</p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCases
                .filter((c) => savedCases.has(c.id))
                .map((c) => (
                  <CaseCard key={c.id} case={c} />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="today">
          {filteredCases.filter((c) => c.status === "Hearing Today").length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">No hearings today</h3>
              <p className="text-muted-foreground">Check back later for updates</p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCases
                .filter((c) => c.status === "Hearing Today")
                .map((c) => (
                  <CaseCard key={c.id} case={c} />
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
