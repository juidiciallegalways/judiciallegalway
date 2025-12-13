import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export const metadata = {
  title: "Admin Dashboard | Judicially Legal Ways",
}

export default async function AdminPage() {
  const supabase = await createClient()
  
  // Get user with retry logic
  let user = null
  let retries = 0
  while (!user && retries < 3) {
    const { data, error } = await supabase.auth.getUser()
    if (data?.user) {
      user = data.user
      break
    }
    if (error && retries < 2) {
      await new Promise(resolve => setTimeout(resolve, 100))
      retries++
    } else {
      break
    }
  }

  if (!user) {
    redirect("/auth/login?next=/admin")
  }

  // Get profile with error handling
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  // If profile doesn't exist, create it with student role
  if (!profile) {
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email || '',
      role: "student"
    })
    
    if (insertError) {
      console.error("Failed to create profile:", insertError)
    }
    
    // Redirect to home with message - user needs admin role set
    redirect("/?error=profile_created_contact_admin")
  }

  // Check admin role - be more lenient, log for debugging
  if (profile.role !== "admin") {
    console.log("Access denied - User role:", profile.role, "User ID:", user.id, "User email:", user.email)
    redirect("/?error=admin_access_required")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <AdminDashboard />
      </main>
      <Footer />
    </div>
  )
}
