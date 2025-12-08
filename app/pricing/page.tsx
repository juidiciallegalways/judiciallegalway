import { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PricingSection } from "@/components/pricing/pricing-section"

export const metadata: Metadata = {
  title: "Pricing | Judicially Legal Ways",
  description: "Choose the perfect plan for your legal studies journey",
}

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <PricingSection />
      </main>
      <Footer />
    </div>
  )
}
