import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // if "next" is in param, use it as the redirect URL--to homepage
  const next = searchParams.get('next') ?? '/'

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        const forwardedHost = request.headers.get('x-forwarded-host')
        
        // Handle different environments
        if (process.env.NODE_ENV === 'development') {
          // Local development - use the current origin
          return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
          // Production with load balancer
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          // Fallback
          return NextResponse.redirect(`${origin}${next}`)
        }
      }
    } catch (error) {
      console.error('Error in auth callback:', error)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=server_error`)
    }
  }

  // If there's an error, redirect to an error page
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=invalid_code`)
}
