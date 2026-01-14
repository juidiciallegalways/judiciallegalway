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
  const fetchProfile = useCallback(async (userId: string, userEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: userEmail || '',
            role: 'student'
          })
          .select()
          .single()
          
        if (insertError) {
          console.error('Failed to create profile:', insertError)
          return null
        }
        
        return newProfile as UserProfile
      }

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data as UserProfile
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }, []) // Remove supabase from dependencies

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      const profileData = await fetchProfile(user.id, user.email)
      setProfile(profileData)
    }
  }, [user?.id, user?.email, fetchProfile])

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          
          // Add timeout for profile fetch
          const profilePromise = fetchProfile(session.user.id, session.user.email)
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
          )
          
          try {
            const profileData = await Promise.race([
              profilePromise as Promise<UserProfile | null>, 
              timeoutPromise as Promise<UserProfile | null>
            ])
            setProfile(profileData)
          } catch (profileError) {
            console.error('Profile fetch failed:', profileError)
            setProfile(null)
            
            // Retry profile fetch after a delay
            setTimeout(async () => {
              try {
                const retryProfileData = await fetchProfile(session.user.id, session.user.email)
                setProfile(retryProfileData)
              } catch (retryError) {
                console.error('Profile retry failed:', retryError)
              }
            }, 3000)
          }
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('Auth init error:', error)
        setUser(null)
        setProfile(null)
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
        const profileData = await fetchProfile(session.user.id, session.user.email)
        setProfile(profileData)
        setIsLoading(false)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        setIsLoading(false)
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user)
        // Don't refetch profile on token refresh to avoid loops
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
