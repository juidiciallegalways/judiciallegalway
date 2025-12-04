'use client'

import { useEffect, useState } from 'react'

/**
 * Custom hook for responsive breakpoint detection
 * @param query - Media query string (e.g., '(min-width: 768px)')
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false)
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    setMounted(true)
    const mediaQuery = window.matchMedia(query)
    
    // Set initial value
    setMatches(mediaQuery.matches)

    // Create event listener
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add listener
    mediaQuery.addEventListener('change', handleChange)

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [query])

  // Return false during SSR to prevent hydration mismatch
  return mounted ? matches : false
}

/**
 * Predefined breakpoint hooks for common use cases
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
}

export function useIsMobileDevice(): boolean {
  return useMediaQuery('(max-width: 767px)')
}

/**
 * Hook to determine if animations should be enabled based on viewport
 * Disables complex animations on mobile for better performance
 */
export function useShouldAnimate(): boolean {
  const isDesktop = useIsDesktop()
  const isTablet = useIsTablet()
  
  // Enable animations on desktop and tablet, disable on mobile
  return isDesktop || isTablet
}

/**
 * Hook to determine if parallax should be enabled
 * Only enables parallax on desktop (>= 1024px)
 */
export function useShouldEnableParallax(): boolean {
  return useIsDesktop()
}
