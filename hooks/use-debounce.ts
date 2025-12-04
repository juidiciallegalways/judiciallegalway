'use client'

import { useEffect, useRef } from 'react'

/**
 * Custom hook for debouncing function calls
 * Useful for resize handlers and other high-frequency events
 */
export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 150
): T {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const callbackRef = useRef(callback)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const debouncedCallback = useRef(((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args)
    }, delay)
  }) as T)

  return debouncedCallback.current
}
