'use client'

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from './loading-spinner'

interface ProgressiveImageProps extends Omit<ImageProps, 'onLoad'> {
  showSpinner?: boolean
  spinnerClassName?: string
}

export function ProgressiveImage({
  className,
  showSpinner = true,
  spinnerClassName,
  alt,
  ...props
}: ProgressiveImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="relative w-full h-full">
      {isLoading && showSpinner && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <LoadingSpinner className={cn("text-muted-foreground", spinnerClassName)} />
        </div>
      )}
      <Image
        {...props}
        alt={alt}
        className={cn(
          'transition-opacity duration-500',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  )
}
