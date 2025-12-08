import { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { RefundContent } from "@/components/legal/refund-content"

export const metadata: Metadata = {
  title: "Refund and Cancellation Policy | Judicially Legal Ways",
  description: "Refund and Cancellation Policy for Judicially Legal Ways platform",
}

export default function RefundPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <RefundContent />
      </main>
      <Footer />
    </div>
  )
}
