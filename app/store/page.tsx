import { createClient } from "@/lib/supabase/server"
import { StoreContent } from "@/components/store/store-content"
import { StoreHero } from "@/components/store/store-hero"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

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
        <StoreHero />
        <StoreContent initialBooks={books || []} />
      </main>
      <Footer />
    </div>
  )
}