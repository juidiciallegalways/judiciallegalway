import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { StoreContent } from "@/components/store/store-content"

export const metadata = {
  title: "Book Store | Judicially Legal Ways",
  description: "Purchase law books and bundles for your legal education.",
}

export default function StorePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <StoreContent />
      </main>
      <Footer />
    </div>
  )
}
