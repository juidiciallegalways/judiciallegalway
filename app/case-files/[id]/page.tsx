import { createClient } from "@/lib/supabase/server"
import { CaseFileDetailContent } from "@/components/case-files/case-file-detail-content"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { notFound } from "next/navigation"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: caseFile } = await supabase
    .from('case_files')
    .select('title, description, case_number, court_name, category, price')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (!caseFile) {
    return {
      title: 'Case File Not Found | Judicially Legal Ways',
      description: 'The requested case file could not be found.',
    }
  }

  return {
    title: `${caseFile.title} | Judicially Legal Ways`,
    description: caseFile.description || `Access landmark case ${caseFile.case_number} from ${caseFile.court_name} - ${caseFile.category} legal document.`,
    openGraph: {
      title: caseFile.title,
      description: caseFile.description,
      type: 'article',
      price: caseFile.price?.toString() || '0',
      currency: 'INR',
    },
  }
}

export default async function CaseFilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  // Fetch Real Data
  const { data: caseFile, error } = await supabase
    .from('case_files')
    .select('*')
    .eq('id', id)
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