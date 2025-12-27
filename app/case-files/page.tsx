import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CaseFilesContent } from "@/components/case-files/case-files-content"
import { CaseFilesHero } from "@/components/case-files/case-files-hero"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Case Files Library | Judicially Legal Ways",
  description: "Access landmark case files, judgments, and legal documents with expert analysis.",
}

export default async function CaseFilesPage() {
  const supabase = await createClient()

  // Fetch data on the server
  const { data: caseFiles } = await supabase
    .from("case_files")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/10">
      <Header />
      <main className="flex-1">
        <CaseFilesHero />
        
        <div className="container mx-auto px-0 py-4 lg:px-8 lg:py-6">
          <div className="mb-6 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                  Explore Case Files
                </h2>
                <p className="text-muted-foreground mt-2">
                  Browse through our comprehensive collection of landmark judgments
                </p>
              </div>
            </div>
          </div>

          <Suspense fallback={
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
                <span className="text-muted-foreground">Loading case files...</span>
              </div>
            </div>
          }>
            <CaseFilesContent initialCaseFiles={caseFiles || []} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  )
}