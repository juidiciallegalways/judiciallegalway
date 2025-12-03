import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CourtTrackerContent } from "@/components/court-tracker/court-tracker-content"

export const metadata = {
  title: "Court Case Tracker | Judicially Legal Ways",
  description: "Track court cases in real-time across Supreme Court, High Courts, and District Courts.",
}

export default function CourtTrackerPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <CourtTrackerContent />
      </main>
      <Footer />
    </div>
  )
}
