import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CaseFilesContent } from "@/components/case-files/case-files-content"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Case Files Library | Judicially Legal Ways",
  description: "Access landmark case files, judgments, and legal documents.",
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-12">
          <div className="container relative mx-auto px-4 lg:px-8">
            <h1 className="font-serif text-4xl font-bold text-foreground">
              Case Files Library
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Access landmark judgments and legal documents.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 lg:px-8">
          <Suspense fallback={<div className="p-10 text-center">Loading Library...</div>}>
            <CaseFilesContent initialCaseFiles={caseFiles || []} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  )
}