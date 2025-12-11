import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gavel, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"

export async function CourtUpdatesSection() {
  const supabase = await createClient()
  const { data: cases } = await supabase
    .from("court_cases")
    .select("*")
    .limit(3)
    .order("updated_at", { ascending: false })

  if (!cases?.length) return null

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {cases.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow h-full">
              <CardContent className="p-4 sm:p-5">
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                   <Badge variant="outline" className="font-mono text-xs truncate max-w-[120px] sm:max-w-none">{c.case_number}</Badge>
                   <Badge className={c.status === 'disposed' ? 'bg-green-600' : 'bg-amber-600 text-xs sm:text-sm'}>{c.status}</Badge>
                </div>
                <h3 className="font-medium text-sm sm:text-base md:text-lg mb-2 line-clamp-2">{c.case_title || `${c.petitioner} v. ${c.respondent}`}</h3>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4 gap-2">
                  <div className="flex items-center gap-1"><Gavel className="h-3 w-3" /> <span className="truncate">{c.court_name}</span></div>
                  {c.next_hearing_date && (
                    <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(c.next_hearing_date).toLocaleDateString()}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}