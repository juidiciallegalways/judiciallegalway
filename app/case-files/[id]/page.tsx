import { createClient } from "@/lib/supabase/server"
import { CaseFileDetailContent } from "@/components/case-files/case-file-detail-content"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { notFound } from "next/navigation"

export default async function CaseFilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  // Fetch Real Data
  const { data: caseFile, error } = await supabase
    .from('case_files')
    .select('*')
    .eq('id', params.id)
    .eq('is_published', true)
    .single()

  if (error || !caseFile) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <CaseFileDetailContent caseFile={caseFile} />
      </main>
      <Footer />
    </div>
  )
}