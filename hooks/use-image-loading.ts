'use client'

import { useState, useEffect } from 'react'

/**
 * Hook to track image loading state
 * Useful for showing loading spinners or skeletons while images load
 */
export function useImageLoading(src: string | undefined) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!src) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setHasError(false)

    const img = new Image()
    
    img.onload = () => {
      setIsLoading(false)
    }
    
    img.onerror = () => {
      setIsLoading(false)
      setHasError(true)
    }
    
    img.src = src

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  return { isLoading, hasError }
}

/**
 * Hook to track multiple images loading state
 * Returns true when all images have loaded
 */
export function useImagesLoading(sources: (string | undefined)[]) {
  const [isLoading, setIsLoading] = useState(true)
  const [loadedCount, setLoadedCount] = useState(0)

  useEffect(() => {
    const validSources = sources.filter(Boolean) as string[]
    
    if (validSources.length === 0) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setLoadedCount(0)

    let loaded = 0
    const images = validSources.map(src => {
      const img = new Image()
      
      img.onload = () => {
        loaded++
        setLoadedCount(loaded)
        if (loaded === validSources.length) {
          setIsLoading(false)
        }
      }
      
      img.onerror = () => {
        loaded++
        setLoadedCount(loaded)
        if (loaded === validSources.length) {
          setIsLoading(false)
        }
      }
      
      img.src = src
      return img
    })

    return () => {
      images.forEach(img => {
        img.onload = null
        img.onerror = null
      })
    }
  }, [sources])

  return { isLoading, loadedCount, total: sources.length }
}
