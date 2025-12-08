import { createClient } from "@/lib/supabase/server"
import { CourtTrackerContent } from "@/components/court-tracker/court-tracker-content"

export const metadata = {
  title: "Court Tracker | Judicially Legal Ways",
  description: "Track real-time case status from Supreme Court and High Courts."
}

// ⚠️ THIS FUNCTION MUST BE EXPORTED AS DEFAULT ⚠️
export default async function CourtTrackerPage() {
  const supabase = await createClient()
  
  // 1. Fetch real cases from Supabase
  const { data: cases } = await supabase
    .from('court_cases')
    .select('*')
    .order('next_hearing', { ascending: true })
    .limit(50)

  // 2. Pass data to the Client Component
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-serif font-bold mb-6 px-4 md:px-0">
        Live Court Tracking
      </h1>
      {/* Pass the data down as a prop */}
      <CourtTrackerContent initialCases={cases || []} />
    </div>
  )
}