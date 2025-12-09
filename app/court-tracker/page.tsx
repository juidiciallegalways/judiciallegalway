import { createClient } from "@/lib/supabase/server"
import { CourtTrackerContent } from "@/components/court-tracker/court-tracker-content"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export const metadata = {
  title: "Court Tracker | Judicially Legal Ways",
}

export default async function CourtTrackerPage() {
  const supabase = await createClient()
  
  const { data: cases } = await supabase
    .from('court_cases')
    .select('*')
    .order('next_hearing_date', { ascending: true })
    .limit(50)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4 lg:px-8">
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-3xl font-serif font-bold">Court Tracker</h1>
            <p className="text-muted-foreground">Real-time status tracking from courts across India.</p>
          </div>
          <CourtTrackerContent initialCases={cases || []} />
        </div>
      </main>
      <Footer />
    </div>
  )
}