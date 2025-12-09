import { createClient } from "@/lib/supabase/server"
import { CaseFileDetailContent } from "@/components/case-files/case-file-detail-content"

export default async function CaseFilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  // Fetch Real Data
  const { data: caseFile } = await supabase
    .from('case_files')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!caseFile) return <div className="p-20 text-center">Case File Not Found</div>

  return <CaseFileDetailContent caseFile={caseFile} />
}