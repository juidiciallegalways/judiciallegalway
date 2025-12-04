'use client'

import { useEffect, useState, useRef } from 'react'

interface ParallaxOptions {
  speed?: number
  disabled?: boolean
}

export function useParallax({ speed = 0.5, disabled = false }: ParallaxOptions = {}) {
  const [offset, setOffset] = useState(0)
  const elementRef = useRef<HTMLElement>(null)
  const rafIdRef = useRef<number | null>(null)
  const tickingRef = useRef(false)

  useEffect(() => {
    if (disabled || !elementRef.current) return

    const handleScroll = () => {
      const element = elementRef.current
      if (!element) return

      const rect = element.getBoundingClientRect()
      const scrolled = window.scrollY
      const elementTop = rect.top + scrolled
      const windowHeight = window.innerHeight

      // Only calculate parallax when element is in viewport
      if (scrolled + windowHeight > elementTop && scrolled < elementTop + rect.height) {
        const parallaxOffset = (scrolled - elementTop) * speed
        setOffset(parallaxOffset)
      }
      
      tickingRef.current = false
    }

    // RAF throttling for optimal performance
    const throttledScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true
        rafIdRef.current = requestAnimationFrame(handleScroll)
      }
    }

    // Use passive event listener for better scroll performance
    window.addEventListener('scroll', throttledScroll, { passive: true })
    handleScroll() // Initial calculation

    return () => {
      window.removeEventListener('scroll', throttledScroll)
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
      tickingRef.current = false
    }
  }, [speed, disabled])

  return { offset, ref: elementRef }
}
