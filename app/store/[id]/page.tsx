import { createClient } from "@/lib/supabase/server"
import { BookDetailContent } from "@/components/store/book-detail-content"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { notFound } from "next/navigation"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: book } = await supabase
    .from('books')
    .select('title, description, author, price, category')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (!book) {
    return {
      title: 'Book Not Found | Judicially Legal Ways',
      description: 'The requested book could not be found.',
    }
  }

  return {
    title: `${book.title} by ${book.author} | Judicially Legal Ways`,
    description: book.description || `Purchase ${book.title} - ${book.category} book for legal studies and exam preparation.`,
    openGraph: {
      title: book.title,
      description: book.description,
      type: 'product',
      price: book.price.toString(),
      currency: 'INR',
      availability: 'instock',
    },
  }
}

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  // Fetch book data
  const { data: book, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
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