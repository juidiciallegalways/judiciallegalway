import { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { TermsContent } from "@/components/legal/terms-content"

export const metadata: Metadata = {
  title: "Terms and Conditions | Judicially Legal Ways",
  description: "Terms and Conditions of Use for Judicially Legal Ways platform",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <TermsContent />
      </main>
      <Footer />
    </div>
  )
}
