import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    // Fetch fresh profile from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      return NextResponse.json(
        { error: 'Profile not found', details: profileError.message },
        { status: 404 }
      )
    }
    
    // Return fresh profile data
    return NextResponse.json({
      success: true,
      profile,
      message: 'Profile refreshed successfully'
    })
    
  } catch (error: any) {
    console.error('Error refreshing profile:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  return POST() // Allow GET requests too
}
