import { createClient } from "@/lib/supabase/server"
import { BookDetailContent } from "@/components/store/book-detail-content"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { notFound } from "next/navigation"

export default async function BookDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  // Fetch book data
  const { data: book, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', params.id)
    .eq('is_published', true)
    .single()

  if (error || !book) {
    notFound()
  }

  // Fetch related books
  const { data: relatedBooks } = await supabase
    .from('books')
    .select('*')
    .eq('category', book.category)
    .eq('is_published', true)
    .neq('id', book.id)
    .limit(4)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <BookDetailContent book={book} relatedBooks={relatedBooks || []} />
      </main>
      <Footer />
    </div>
  )
}