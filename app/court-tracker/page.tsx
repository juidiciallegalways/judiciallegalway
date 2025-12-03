import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CourtTrackerContent } from "@/components/court-tracker/court-tracker-content"
import { CourtBuildingIcon, GavelIcon } from "@/components/icons/legal-icons"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Court Case Tracker | Judicially Legal Ways",
  description: "Track court cases in real-time across Supreme Court, High Courts, and District Courts.",
}

export default function CourtTrackerPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-accent/10 via-background to-primary/5 py-12 md:py-16">
          <div className="absolute inset-0 seal-pattern opacity-5" />
          <div className="absolute top-20 right-10 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute bottom-10 left-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          
          <div className="container relative mx-auto px-4 lg:px-8">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                <span className="text-sm font-medium text-accent">Live Case Updates</span>
              </div>
              <h1 className="font-serif text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
                Court Case Tracker
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Track court cases in real-time across Supreme Court, High Courts, and District Courts. Get instant updates on hearing dates, case status, and judgments.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <CourtBuildingIcon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Multi-Court</p>
                    <p className="text-xs text-muted-foreground">All India Coverage</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <GavelIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Real-Time</p>
                    <p className="text-xs text-muted-foreground">Instant Updates</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <CourtTrackerContent />
      </main>
      <Footer />
    </div>
  )
}
