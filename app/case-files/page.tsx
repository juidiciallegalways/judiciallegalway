import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CaseFilesContent } from "@/components/case-files/case-files-content"
import { Skeleton } from "@/components/ui/skeleton"
import { ShieldCheckIcon, BookLawIcon } from "@/components/icons/legal-icons"

export const metadata = {
  title: "Case Files Library | Judicially Legal Ways",
  description: "Access landmark case files, judgments, and legal documents from Supreme Court, High Courts, and more.",
}

function CaseFilesSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}

export default function CaseFilesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
          <div className="absolute inset-0 seal-pattern opacity-5" />
          <div className="container relative mx-auto px-4 lg:px-8">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span className="text-sm font-medium text-primary">500+ Case Files</span>
              </div>
              <h1 className="font-serif text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
                Case Files Library
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Access landmark judgments, case files, and legal documents from Supreme Court, High Courts, and District Courts. Comprehensive collection for legal research and exam preparation.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <ShieldCheckIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Verified Cases</p>
                    <p className="text-xs text-muted-foreground">Authentic Documents</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <BookLawIcon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Landmark Judgments</p>
                    <p className="text-xs text-muted-foreground">Updated Daily</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 lg:px-8">
          <Suspense fallback={<CaseFilesSkeleton />}>
            <CaseFilesContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  )
}
