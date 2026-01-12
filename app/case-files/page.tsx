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

  try {
    // Fetch data on the server
    const { data: caseFiles, error } = await supabase
      .from("case_files")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error('Error fetching case files:', error)
    }

    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <CaseFilesHero />
          
          <Suspense fallback={
            <div className="flex items-center justify-center py-20 bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
                <span className="text-gray-600 dark:text-gray-300">Loading case files...</span>
              </div>
            </div>
          }>
            <CaseFilesContent initialCaseFiles={caseFiles || []} />
          </Suspense>
        </main>
        <Footer />
      </div>
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <CaseFilesHero />
          <CaseFilesContent initialCaseFiles={[]} />
        </main>
        <Footer />
      </div>
    )
  }
}