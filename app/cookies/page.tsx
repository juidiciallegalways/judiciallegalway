import { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CookiesContent } from "@/components/legal/cookies-content"

export const metadata: Metadata = {
  title: "Cookies Policy | Judicially Legal Ways",
  description: "Cookies and Tracking Technologies Policy for Judicially Legal Ways platform",
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <CookiesContent />
      </main>
      <Footer />
    </div>
  )
}
