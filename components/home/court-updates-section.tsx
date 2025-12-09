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
    <section className="py-16 bg-white border-t">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-serif font-bold text-slate-900">Live Court Updates</h2>
            <p className="text-muted-foreground mt-2">Real-time status tracking from Supreme Court & High Courts.</p>
          </div>
          <Link href="/court-tracker" className="text-primary hover:underline font-medium flex items-center gap-1">
            View All Cases <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {cases.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                   <Badge variant="outline" className="font-mono text-xs">{c.case_number}</Badge>
                   <Badge className={c.status === 'disposed' ? 'bg-green-600' : 'bg-amber-600'}>{c.status}</Badge>
                </div>
                <h3 className="font-medium text-lg mb-2 line-clamp-1">{c.case_title || `${c.petitioner} v. ${c.respondent}`}</h3>
                <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
                  <div className="flex items-center gap-1"><Gavel className="h-3 w-3" /> {c.court_name}</div>
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