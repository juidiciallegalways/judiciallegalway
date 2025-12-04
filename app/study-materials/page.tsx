import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { StudyMaterialsContent } from "@/components/study-materials/study-materials-content"
import { Skeleton } from "@/components/ui/skeleton"
import { ShieldCheckIcon, BookLawIcon } from "@/components/icons/legal-icons"

export const metadata = {
  title: "Study Materials | Judicially Legal Ways",
  description: "Access DRM-protected study materials for IPC, CrPC, CPC, Evidence Act, and more.",
}

function StudyMaterialsSkeleton() {
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

export default function StudyMaterialsPage() {
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
                <span className="text-sm font-medium text-primary">250+ Premium Materials</span>
              </div>
              <h1 className="font-serif text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
                Study Material Library
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Access comprehensive, exam-focused study materials with DRM protection. From IPC to Constitutional Law, everything you need to excel.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <ShieldCheckIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">DRM Protected</p>
                    <p className="text-xs text-muted-foreground">Secure Content</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <BookLawIcon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Exam Focused</p>
                    <p className="text-xs text-muted-foreground">Updated 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 lg:px-8">
          <Suspense fallback={<StudyMaterialsSkeleton />}>
            <StudyMaterialsContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  )
}
