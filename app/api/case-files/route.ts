import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    const court = searchParams.get('court')
    const year = searchParams.get('year')
    const search = searchParams.get('search')
    const isPremium = searchParams.get('isPremium')

    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('case_files')
      .select('*', { count: 'exact' })
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (court && court !== 'all') {
      // Handle court filtering - convert court filter to match court_name
      const courtName = court
        .replace('supreme', 'Supreme Court')
        .replace('-hc', ' HC')
        .replace('delhi', 'Delhi')
        .replace('bombay', 'Bombay')
        .replace('calcutta', 'Calcutta')
        .replace('madras', 'Madras')

      query = query.ilike('court_name', `%${courtName}%`)
    }

    if (year && year !== 'all') {
      query = query.eq('year', parseInt(year))
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,case_number.ilike.%${search}%`)
    }

    if (isPremium !== null && isPremium !== undefined) {
      query = query.eq('is_premium', isPremium === 'true')
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: caseFiles, error, count } = await query

    if (error) {
      console.error('Error fetching case files:', error)
      return NextResponse.json(
        { error: 'Failed to fetch case files' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      caseFiles: caseFiles || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}