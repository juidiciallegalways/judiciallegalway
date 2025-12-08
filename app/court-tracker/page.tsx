"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  Gavel, Calendar, Search, Filter, Bell, MapPin, 
  Clock, AlertCircle
} from "lucide-react"
import { toast } from "sonner"

// --- TYPE DEFINITIONS (Production Standard) ---
export interface CourtCase {
  id: string
  case_number: string
  petitioner: string
  respondent: string
  court_name: string
  status: string
  next_hearing: string // Supabase returns dates as strings
  last_updated: string
}

// This interface tells TypeScript: "I expect a list of cases when this component loads"
interface CourtTrackerContentProps {
  initialCases: CourtCase[]
}

export function CourtTrackerContent({ initialCases }: CourtTrackerContentProps) {
  // Initialize state with the Server Data immediately (No Flicker)
  const [cases, setCases] = useState<CourtCase[]>(initialCases || [])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedCase, setSelectedCase] = useState<CourtCase | null>(null)

  // Client-Side Filtering (Instant Speed for <500 items)
  const filteredCases = cases.filter((c) => {
    const searchLower = searchQuery.toLowerCase()
    
    // Safety check: ensure fields exist before calling toLowerCase
    const caseNo = c.case_number?.toLowerCase() || ""
    const pet = c.petitioner?.toLowerCase() || ""
    const resp = c.respondent?.toLowerCase() || ""
    const court = c.court_name?.toLowerCase() || ""

    const matchesSearch = 
      caseNo.includes(searchLower) ||
      pet.includes(searchLower) ||
      resp.includes(searchLower) ||
      court.includes(searchLower)
    
    const matchesStatus = statusFilter === "all" || c.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Format Date safely
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not Scheduled"
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    } catch (e) {
      return dateString
    }
  }

  // Dynamic Status Colors
  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || ""
    if (s.includes("disposed")) return "bg-green-100 text-green-700 border-green-200"
    if (s.includes("adjourned")) return "bg-amber-100 text-amber-700 border-amber-200"
    if (s.includes("reserved")) return "bg-purple-100 text-purple-700 border-purple-200"
    return "bg-blue-100 text-blue-700 border-blue-200"
  }

  const handleTrackCase = (caseId: string) => {
    // In a real app, this would make an API call to save to user's watchlist
    toast.success("Case Added to Watchlist", {
      description: "You will receive notifications for hearing updates."
    })
  }

  return (
    <div className="space-y-8">
      {/* Header & Search Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center bg-card p-4 rounded-xl border shadow-sm">
        <div className="w-full md:w-96 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by Party Name, Case No, or Court..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Hearing Scheduled">Hearing Scheduled</SelectItem>
              <SelectItem value="Disposed">Disposed</SelectItem>
              <SelectItem value="Adjourned">Adjourned</SelectItem>
              <SelectItem value="Judgment Reserved">Judgment Reserved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Case Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredCases.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="col-span-full text-center py-20 bg-muted/30 rounded-xl border-dashed border-2"
            >
              <Gavel className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground">No cases found</h3>
              <p className="text-muted-foreground">Try adjusting your search filters</p>
            </motion.div>
          ) : (
            filteredCases.map((courtCase) => (
              <motion.div
                key={courtCase.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover:shadow-md transition-shadow h-full flex flex-col group bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-4">
                      <Badge variant="outline" className="font-mono text-xs bg-muted">
                        {courtCase.case_number}
                      </Badge>
                      <Badge className={getStatusColor(courtCase.status)}>
                        {courtCase.status}
                      </Badge>
                    </div>
                    <h3 className="font-serif text-lg font-semibold pt-2 leading-tight group-hover:text-primary transition-colors">
                      {courtCase.petitioner} 
                      <span className="text-muted-foreground text-sm font-sans mx-1">vs.</span>
                      {courtCase.respondent}
                    </h3>
                  </CardHeader>
                  
                  <CardContent className="flex-1 space-y-4 text-sm">
                    <div className="flex items-start gap-3 text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{courtCase.court_name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span className="text-foreground font-medium">Next Hearing: {formatDate(courtCase.next_hearing)}</span>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1" onClick={() => setSelectedCase(courtCase)}>
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="font-serif text-2xl pr-8">
                            {courtCase.petitioner} vs. {courtCase.respondent}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                            <div>
                              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Case Number</Label>
                              <p className="font-mono font-medium mt-1">{courtCase.case_number}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Status</Label>
                              <Badge className={`mt-1 ${getStatusColor(courtCase.status)}`}>{courtCase.status}</Badge>
                            </div>
                            <div>
                              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Next Hearing</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{formatDate(courtCase.next_hearing)}</span>
                              </div>
                            </div>
                            <div>
                              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Last Updated</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{formatDate(courtCase.last_updated)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="font-medium flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-primary" />
                              Case Timeline
                            </h4>
                            <div className="border-l-2 border-muted pl-4 space-y-6 ml-2">
                              {/* Visual Timeline - in production this would map through a 'history' array */}
                              <div className="relative">
                                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                                <p className="text-sm font-medium">Current Status</p>
                                <p className="text-xs text-muted-foreground">{courtCase.status}</p>
                              </div>
                              <div className="relative">
                                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-muted-foreground/30 ring-4 ring-background" />
                                <p className="text-sm font-medium">Case Registered</p>
                                <p className="text-xs text-muted-foreground">Initial Filing</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button onClick={() => handleTrackCase(courtCase.id)} size="icon" variant="default">
                      <Bell className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}