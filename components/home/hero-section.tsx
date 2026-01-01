"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScalesIcon, ShieldCheckIcon, CourtBuildingIcon } from "@/components/icons/legal-icons"
import { BookOpen, ArrowRight, Play } from "lucide-react"
import { useParallax } from "@/hooks/use-parallax"
import { fadeInUp } from "@/lib/animation-variants"
import { useShouldEnableParallax, useShouldAnimate } from "@/hooks/use-media-query"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

export function HeroSection() {
  // Conditionally enable parallax based on viewport
  const shouldEnableParallax = useShouldEnableParallax()
  const shouldAnimate = useShouldAnimate()
  const prefersReducedMotion = useReducedMotion()
  
  // Disable animations if user prefers reduced motion
  const enableAnimations = shouldAnimate && !prefersReducedMotion
  const enableParallax = shouldEnableParallax && !prefersReducedMotion
  
  // Apply parallax to background pattern, disabled on mobile (< 1024px) or if reduced motion
  const { offset: bgOffset, ref: bgRef } = useParallax({ 
    speed: 0.5, 
    disabled: !enableParallax
  })

  // Apply parallax to floating cards with slower speed
  const { offset: cardOffset, ref: cardRef } = useParallax({ 
    speed: 0.3, 
    disabled: !enableParallax
  })

  return (
    <section className="relative overflow-hidden">
      {/* Background Pattern with Parallax */}
      <div 
        ref={bgRef as React.RefObject<HTMLDivElement>}
        className="absolute inset-0 seal-pattern opacity-30" 
        style={{
          transform: `translate3d(0, ${bgOffset}px, 0)`,
          willChange: 'transform'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-muted/30" />

      <div className="container relative mx-auto px-4 py-12 md:py-16 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-6 gap-2 px-4 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Trusted by 50,000+ Law Students
            </Badge>

            <motion.h1 
              className="font-serif text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl"
              initial={enableAnimations ? "hidden" : false}
              animate={enableAnimations ? "visible" : false}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.6, delay: 0.2, ease: "easeOut" }
                }
              }}
            >
              <span className="text-balance">India&apos;s Most Reliable</span>{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Legal Learning
              </span>{" "}
              <span className="text-balance">&amp; Court Tracking Platform</span>
            </motion.h1>

            <motion.p 
              className="mt-6 text-lg text-muted-foreground text-pretty"
              initial={enableAnimations ? "hidden" : false}
              animate={enableAnimations ? "visible" : false}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.6, delay: 0.4, ease: "easeOut" }
                }
              }}
            >
              Access secure DRM-protected study materials, track court cases in real-time, and prepare for legal exams
              with expert resources. Your complete companion for judiciary preparation.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="mt-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3"
              initial={enableAnimations ? "hidden" : false}
              animate={enableAnimations ? "visible" : false}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.15,
                    delayChildren: 0.6
                  }
                }
              }}
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -30 },
                  visible: { 
                    opacity: 1, 
                    x: 0,
                    transition: { duration: 0.4, ease: "easeOut" }
                  }
                }}
                whileHover={enableAnimations ? { scale: 1.05 } : undefined}
                transition={{ duration: 0.2 }}
              >
                <Button size="lg" className="gap-2 w-full sm:w-auto sm:px-8" asChild>
                  <Link href="/case-files">
                    <BookOpen className="h-5 w-5" />
                    Explore Case Files
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -30 },
                  visible: { 
                    opacity: 1, 
                    x: 0,
                    transition: { duration: 0.4, ease: "easeOut" }
                  }
                }}
                whileHover={enableAnimations ? { scale: 1.05 } : undefined}
                transition={{ duration: 0.2 }}
              >
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto sm:px-8 bg-transparent" asChild>
                  <Link href="/court-tracker">
                    <CourtBuildingIcon className="h-5 w-5" />
                    Track Court Cases
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={enableAnimations ? "hidden" : false}
              animate={enableAnimations ? "visible" : false}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.15,
                    delayChildren: 0.6
                  }
                }
              }}
            >
              <motion.div 
                className="flex items-center gap-3 p-4 rounded-lg bg-muted/50"
                variants={fadeInUp}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <ShieldCheckIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">DRM Secure</p>
                  <p className="text-sm text-muted-foreground">Protected Content</p>
                </div>
              </motion.div>
              <motion.div 
                className="flex items-center gap-3 p-4 rounded-lg bg-muted/50"
                variants={fadeInUp}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 shrink-0">
                  <ScalesIcon className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Real-Time</p>
                  <p className="text-sm text-muted-foreground">Court Updates</p>
                </div>
              </motion.div>
              <motion.div 
                className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 sm:col-span-2 lg:col-span-1"
                variants={fadeInUp}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Exam Focused</p>
                  <p className="text-sm text-muted-foreground">Study Resources</p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Visual */}
          <div className="relative hidden lg:block">
            <div 
              ref={cardRef as React.RefObject<HTMLDivElement>}
              className="relative"
              style={{
                transform: `translate3d(0, ${cardOffset}px, 0)`,
                willChange: 'transform'
              }}
            >
              {/* Main Card */}
              <motion.div 
                className="glass rounded-xl p-7 shadow-2xl w-full max-w-lg"
                whileHover={enableAnimations ? {
                  y: -15,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  transition: { duration: 0.3 }
                } : undefined}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary">
                      <ScalesIcon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-foreground">Supreme Court</h3>
                      <p className="text-sm text-muted-foreground">Live Case Tracker</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/10 text-green-600">Live</Badge>
                </div>

                {/* Mock Case List with Scrolling Animation */}
                <div className="h-96 overflow-hidden relative">
                  <div className="animate-scroll-up">
                    {[
                      { case: "WP(C) 2024/1234", status: "Hearing Today", color: "bg-destructive" },
                      { case: "SLP(Crl) 2024/567", status: "Pending", color: "bg-amber-500" },
                      { case: "CA 2024/890", status: "Disposed", color: "bg-green-500" },
                      { case: "PIL 2024/445", status: "Listed", color: "bg-blue-500" },
                      { case: "CRL.A 2024/223", status: "Hearing Today", color: "bg-destructive" },
                      { case: "WP(C) 2024/1234", status: "Hearing Today", color: "bg-destructive" },
                      { case: "SLP(Crl) 2024/567", status: "Pending", color: "bg-amber-500" },
                      { case: "CA 2024/890", status: "Disposed", color: "bg-green-500" },
                      { case: "PIL 2024/445", status: "Listed", color: "bg-blue-500" },
                      { case: "CRL.A 2024/223", status: "Hearing Today", color: "bg-destructive" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-background/50 p-4 mb-3 flex-shrink-0">
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="font-medium text-foreground">{item.case}</p>
                          <p className="text-sm text-muted-foreground">Delhi High Court</p>
                        </div>
                        <Badge variant="secondary" className={`${item.color} text-white flex-shrink-0`}>
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="mt-5 w-full gap-2 bg-transparent" variant="outline">
                  View All Cases
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>

              {/* Floating Elements - Removed Video Lectures and Secure DRM */}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
