import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProfileContent } from "@/components/profile/profile-content"

export const metadata = {
  title: "Profile | Judicially Legal Ways",
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <ProfileContent />
      </main>
      <Footer />
    </div>
  )
}
