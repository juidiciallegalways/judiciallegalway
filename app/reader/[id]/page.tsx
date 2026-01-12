import { createClient } from "@/lib/supabase/server"
import { DRMReader } from "@/components/reader/drm-reader"
import { notFound, redirect } from "next/navigation"

export default async function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login?next=' + encodeURIComponent(`/reader/${id}`))
  }

  // Try to find the item in case_files first
  const { data: caseFile } = await supabase
    .from('case_files')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (caseFile) {
    // Check if user has purchased this case file or if it's free
    if (caseFile.price > 0) {
      const { data: purchase } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_type', 'case_file')
        .eq('item_id', caseFile.id)
        .eq('payment_status', 'completed')
        .single()

      if (!purchase) {
        redirect(`/case-files/${id}`)
      }
    }

    return (
      <DRMReader 
        filePath={caseFile.file_url}
        userEmail={user.email || 'user@example.com'}
        itemId={caseFile.id}
        itemType="case_file"
        itemTitle={caseFile.title}
        itemData={caseFile}
      />
    )
  }

  // Try to find the item in books
  const { data: book } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (book && book.file_url) {
    // Check if user has purchased this book or if it's free
    if (book.price > 0) {
      const { data: purchase } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_type', 'book')
        .eq('item_id', book.id)
        .eq('payment_status', 'completed')
        .single()

      if (!purchase) {
        redirect(`/store/${id}`)
      }
    }

    return (
      <DRMReader 
        filePath={book.file_url}
        userEmail={user.email || 'user@example.com'}
        itemId={book.id}
        itemType="book"
        itemTitle={book.title}
        itemData={book}
      />
    )
  }

  notFound()
}