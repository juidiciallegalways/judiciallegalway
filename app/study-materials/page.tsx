import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { StudyMaterialsContent } from "@/components/study-materials/study-materials-content"
import { Skeleton } from "@/components/ui/skeleton"

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
        <div className="container mx-auto px-4 py-8 lg:px-8">
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">Study Material Library</h1>
            <p className="mt-2 text-muted-foreground">
              Access comprehensive, exam-focused study materials with DRM protection
            </p>
          </div>
          <Suspense fallback={<StudyMaterialsSkeleton />}>
            <StudyMaterialsContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  )
}
