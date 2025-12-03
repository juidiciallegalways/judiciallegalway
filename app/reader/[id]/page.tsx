import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DRMReader } from "@/components/reader/drm-reader"

export const metadata = {
  title: "Reader | Judicially Legal Ways",
}

export default async function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: material } = await supabase.from("study_materials").select("*").eq("id", id).single()

  if (!material) {
    notFound()
  }

  // Check if user has access (free material or purchased)
  if (material.is_premium) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("item_id", id)
      .eq("item_type", "study_material")
      .eq("payment_status", "completed")
      .single()

    if (!purchase) {
      redirect(`/study-materials/${id}`)
    }
  }

  // Get user progress
  const { data: progress } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("material_id", id)
    .single()

  return <DRMReader material={material} userEmail={user.email || "user@example.com"} initialProgress={progress} />
}
