import { notFound } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { MaterialDetailContent } from "@/components/study-materials/material-detail-content"
import { createClient } from "@/lib/supabase/server"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: material } = await supabase.from("study_materials").select("title, description").eq("id", id).single()

  return {
    title: material?.title ? `${material.title} | Judicially Legal Ways` : "Study Material",
    description: material?.description || "Access premium study materials",
  }
}

export default async function MaterialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: material, error } = await supabase
    .from("study_materials")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .single()

  if (error || !material) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <MaterialDetailContent material={material} />
      </main>
      <Footer />
    </div>
  )
}
