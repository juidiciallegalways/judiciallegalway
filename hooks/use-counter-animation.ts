'use client'

import { useEffect, useState } from 'react'
import { useMotionValue, useSpring, useTransform } from 'framer-motion'

interface CounterAnimationOptions {
  target: number
  duration?: number
  isVisible: boolean
}

export function useCounterAnimation({ target, duration = 1.5, isVisible }: CounterAnimationOptions) {
  const [hasAnimated, setHasAnimated] = useState(false)
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    stiffness: 50,
    damping: 30,
    duration: duration * 1000
  })
  const displayValue = useTransform(springValue, (latest) => Math.round(latest))

  useEffect(() => {
    if (isVisible && !hasAnimated) {
      motionValue.set(target)
      setHasAnimated(true)
    }
  }, [isVisible, hasAnimated, target, motionValue])

  return displayValue
}
