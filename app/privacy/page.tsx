import { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PrivacyContent } from "@/components/legal/privacy-content"

export const metadata: Metadata = {
  title: "Privacy Policy | Judicially Legal Ways",
  description: "Privacy Policy and Data Protection practices for Judicially Legal Ways platform",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <PrivacyContent />
      </main>
      <Footer />
    </div>
  )
}
