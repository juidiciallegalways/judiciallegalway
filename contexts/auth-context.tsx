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
    console.log('Fetching profile for userId:', userId)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('Profile query result:', { data, error })

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('Creating new profile for user:', userId)
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: user?.email || '',
            role: 'student'
          })
          .select()
          .single()
          
        console.log('Profile creation result:', { newProfile, insertError })
          
        if (insertError) {
          console.error('Failed to create profile:', insertError)
          return null
        }
        
        console.log('Profile created successfully:', newProfile)
        return newProfile as UserProfile
      }

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      console.log('Profile fetched successfully:', data)
      return data as UserProfile
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }, [supabase, user?.email])

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
        console.log('Initializing auth...')
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          console.log('Session found, setting user and fetching profile')
          setUser(session.user)
          const profileData = await fetchProfile(session.user.id)
          setProfile(profileData)
        } else {
          console.log('No session found')
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('Auth init error:', error)
      } finally {
        console.log('Auth init completed, setting isLoading to false')
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in, fetching profile...')
        setUser(session.user)
        const profileData = await fetchProfile(session.user.id)
        console.log('Profile loaded:', profileData)
        setProfile(profileData)
        setIsLoading(false)
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        setUser(null)
        setProfile(null)
        setIsLoading(false)
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('Token refreshed, updating profile...')
        setUser(session.user)
        const profileData = await fetchProfile(session.user.id)
        setProfile(profileData)
      } else if (session?.user && !profile) {
        console.log('Session exists but no profile, fetching...')
        setUser(session.user)
        const profileData = await fetchProfile(session.user.id)
        setProfile(profileData)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, fetchProfile])

  // Computed role checks
  const isAdmin = profile?.role === 'admin'
  const isLawyer = profile?.role === 'lawyer'
  const isStudent = profile?.role === 'student' || (!isAdmin && !isLawyer)

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    isAdmin: profile?.role === 'admin',
    isLawyer: profile?.role === 'lawyer',
    isStudent: profile?.role === 'student' || !profile,
    refreshProfile,
  }

  // Make auth context available globally for debugging
  if (typeof window !== 'undefined') {
    try {
      (window as any).authContext = value
      console.log('Auth context exposed to window:', value)
    } catch (error) {
      console.error('Failed to expose auth context:', error)
    }
  }

  return (
    <AuthContext.Provider value={value}>
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
