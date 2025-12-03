'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface MotionContextType {
  prefersReducedMotion: boolean
  shouldAnimate: boolean
}

const MotionContext = createContext<MotionContextType>({
  prefersReducedMotion: false,
  shouldAnimate: true,
})

export function useMotionPreference() {
  return useContext(MotionContext)
}

interface MotionProviderProps {
  children: React.ReactNode
}

/**
 * Motion Context Provider
 * Detects user's prefers-reduced-motion preference and provides global control
 * for animations throughout the application
 */
export function MotionProvider({ children }: MotionProviderProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Check for prefers-reduced-motion media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches)

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  // Don't animate if user prefers reduced motion
  const shouldAnimate = mounted && !prefersReducedMotion

  return (
    <MotionContext.Provider value={{ prefersReducedMotion, shouldAnimate }}>
      {children}
    </MotionContext.Provider>
  )
}
