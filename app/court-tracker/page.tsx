import { createClient } from "@/lib/supabase/server"
import { CourtTrackerContent } from "@/components/court-tracker/court-tracker-content"

export const metadata = {
  title: "Court Tracker | Judicially Legal Ways",
  description: "Track real-time case status from Supreme Court and High Courts."
}

export default async function CourtTrackerPage() {
  const supabase = await createClient()
  
  // Fetch real cases from Supabase
  const { data: cases } = await supabase
    .from('court_cases')
    .select('*')
    .order('next_hearing', { ascending: true }) // Using 'next_hearing' from your SQL script logic, handled as next_hearing_date in map
    .limit(50)

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-serif font-bold mb-6 px-4 md:px-0">
        Live Court Tracking
      </h1>
      <CourtTrackerContent initialCases={cases || []} />
    </div>
  )
}