import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DRMReader } from "@/components/reader/drm-reader"

// Mock case files data
const mockCaseFiles = [
  {
    id: "1",
    title: "Kesavananda Bharati v. State of Kerala",
    description: "Landmark judgment that established the basic structure doctrine of the Indian Constitution.",
    case_number: "AIR 1973 SC 1461",
    court_name: "Supreme Court of India",
    category: "constitutional",
    year: 1973,
    thumbnail_url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800",
    file_url: "/files/kesavananda-bharati.pdf",
    is_premium: false,
    price: 0,
    total_pages: 700,
  },
  {
    id: "2",
    title: "Maneka Gandhi v. Union of India",
    description: "Revolutionary judgment that expanded the scope of Article 21.",
    case_number: "AIR 1978 SC 597",
    court_name: "Supreme Court of India",
    category: "constitutional",
    year: 1978,
    thumbnail_url: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800",
    file_url: "/files/maneka-gandhi.pdf",
    is_premium: false,
    price: 0,
    total_pages: 250,
  },
]

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

  // Try to fetch from case_files table
  const { data: caseFile } = await supabase.from("case_files").select("*").eq("id", id).single()

  let material = caseFile
  let itemType = "case_file"
  let progressTable = "case_file_progress"
  let materialIdField = "case_file_id"

  // If not found in case_files, use mock data
  if (!material) {
    const mockCase = mockCaseFiles.find((c) => c.id === id)
    if (mockCase) {
      material = mockCase
    } else {
      notFound()
    }
  }

  // Check if user has access (free material or purchased)
  if (material.is_premium) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("item_id", id)
      .eq("item_type", itemType)
      .eq("payment_status", "completed")
      .single()

    if (!purchase) {
      redirect(`/case-files/${id}`)
    }
  }

  // Get user progress
  const { data: progress } = await supabase
    .from(progressTable)
    .select("*")
    .eq("user_id", user.id)
    .eq(materialIdField, id)
    .single()

  return <DRMReader material={material} userEmail={user.email || "user@example.com"} initialProgress={progress} />
}
