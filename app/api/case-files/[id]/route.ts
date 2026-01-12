import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: caseFile, error } = await supabase
      .from('case_files')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .single()

    if (error) {
      console.error('Error fetching case file:', error)
      return NextResponse.json(
        { error: 'Case file not found' },
        { status: 404 }
      )
    }

    if (!caseFile) {
      return NextResponse.json(
        { error: 'Case file not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ caseFile })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}