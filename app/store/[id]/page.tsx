import { BookDetailContent } from "@/components/store/book-detail-content"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export const metadata = {
  title: "Book Details | Judicially Legal Ways",
  description: "View book details and purchase",
}

export default function BookDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <BookDetailContent bookId={params.id} />
      </main>
      <Footer />
    </div>
  )
}
