"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gavel, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"

interface CourtCase {
  id: string
  case_number: string
  case_title: string | null
  party_names: string[] | null
  court_name: string
  status: string
  next_hearing_date: string | null
  updated_at: string
}

export function CourtUpdatesSection() {
  const [cases, setCases] = useState<CourtCase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCases = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("court_cases")
        .select("*")
        .limit(6) // Get more cases for continuous scrolling
        .order("updated_at", { ascending: false })
      
      if (data) {
        setCases(data)
      }
      setLoading(false)
    }

    fetchCases()
  }, [])

  if (loading || !cases?.length) return null

  // Duplicate cases for seamless infinite scroll
  const duplicatedCases = [...cases, ...cases]

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-muted/50 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Live Court Updates</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">Real-time status tracking from Supreme Court & High Courts.</p>
          </div>
          <Link href="/court-tracker" className="text-primary hover:underline font-medium flex items-center gap-1 text-sm sm:text-base">
            View All Cases <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Link>
        </div>

        {/* Scrolling Ticker Container */}
        <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-lg border shadow-sm">
          <div className="flex flex-col h-[400px] sm:h-[500px] overflow-hidden">
            <div className="flex items-center gap-2 p-4 border-b bg-primary/5">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-primary">LIVE UPDATES</span>
            </div>
            
            {/* Scrolling Content */}
            <div className="flex-1 relative overflow-hidden">
              <div className="flex flex-col animate-scroll-up">
                {duplicatedCases.map((c, index) => (
                  <div key={`${c.id}-${index}`} className="p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex-shrink-0">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="font-mono text-xs">{c.case_number}</Badge>
                      <Badge className={c.status === 'disposed' ? 'bg-green-600' : c.status === 'pending' ? 'bg-amber-600' : 'bg-blue-600'}>
                        {c.status}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-sm mb-2 line-clamp-2">
                      {c.case_title || (c.party_names && c.party_names.length >= 2 ? `${c.party_names[0]} v. ${c.party_names[1]}` : c.case_number)}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Gavel className="h-3 w-3" />
                        <span className="truncate">{c.court_name}</span>
                      </div>
                      {c.next_hearing_date && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(c.next_hearing_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}