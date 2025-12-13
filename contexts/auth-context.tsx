"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

// User role type matching database enum
export type UserRole = 'student' | 'lawyer' | 'admin'

// Profile type matching database schema
export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  phone: string | null
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  isAdmin: boolean
  isLawyer: boolean
  isStudent: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  isAdmin: false,
  isLawyer: false,
  isStudent: true,
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  // Fetch user profile from database
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data as UserProfile
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }, [supabase])

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    }
  }, [user?.id, fetchProfile])

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          const profileData = await fetchProfile(session.user.id)
          setProfile(profileData)
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('Auth init error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        const profileData = await fetchProfile(session.user.id)
        setProfile(profileData)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
      } else if (session?.user) {
        setUser(session.user)
        // Only fetch profile if we don't have it
        if (!profile) {
          const profileData = await fetchProfile(session.user.id)
          setProfile(profileData)
        }
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase, fetchProfile, profile])

  // Computed role checks
  const isAdmin = profile?.role === 'admin'
  const isLawyer = profile?.role === 'lawyer'
  const isStudent = profile?.role === 'student' || (!isAdmin && !isLawyer)

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      isLoading, 
      isAdmin, 
      isLawyer, 
      isStudent,
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
