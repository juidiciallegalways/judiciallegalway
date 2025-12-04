'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { FcGoogle } from 'react-icons/fc'

export default function GoogleSignIn() {
  const handleLogin = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      console.error('Google Login Error:', error.message)
    }
  }

  return (
    <Button
      variant="outline"
      type="button"
      onClick={handleLogin}
      className="w-full gap-2"
    >
      <FcGoogle className="h-5 w-5" />
      <span>Continue with Google</span>
    </Button>
  )
}
