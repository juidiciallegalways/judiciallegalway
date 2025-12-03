import { BookDetailContent } from "@/components/store/book-detail-content"

export const metadata = {
  title: "Book Details | Judicially Legal Ways",
  description: "View book details and purchase",
}

export default function BookDetailPage({ params }: { params: { id: string } }) {
  return <BookDetailContent bookId={params.id} />
}
