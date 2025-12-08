import { createClient } from "@/lib/supabase/server"
import { StoreContent } from "@/components/store/store-content"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { BookLawIcon } from "@/components/icons/legal-icons"
import { Package, Shield } from "lucide-react"

export const metadata = {
  title: "Digital Study Store | Judicially Legal Ways",
  description: "Purchase digital study materials, e-books, and bundles for your legal education.",
}

export default async function StorePage() {
  const supabase = await createClient()

  // Fetch Books from DB
  const { data: books } = await supabase
    .from('books')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5 py-12 md:py-16">
          <div className="absolute inset-0 seal-pattern opacity-5" />
          <div className="container relative mx-auto px-4 lg:px-8">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
                <span className="text-sm font-medium text-primary">Instant Digital Access</span>
              </div>
              <h1 className="font-serif text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
                Digital Study Store
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Premium digital study materials, e-books, and exam bundles. Curated by experts.
              </p>
            </div>
          </div>
        </section>

        {/* Real Data Component */}
        <StoreContent initialBooks={books || []} />
      </main>
      <Footer />
    </div>
  )
}