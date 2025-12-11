'use client'

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScalesIcon, ShieldCheckIcon } from "@/components/icons/legal-icons"
import { ArrowRight, CheckCircle } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { scaleIn, staggerContainer, slideInFromLeft } from "@/lib/animation-variants"

const benefits = [
  "Access to 1,200+ study materials",
  "Real-time court case tracking",
  "DRM-protected secure content",
  "Expert video lectures",
  "Mobile-friendly access",
  "24/7 customer support",
]

export function CTASection() {
  const { isVisible, ref } = useScrollAnimation({ threshold: 0.2, triggerOnce: true })

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-8 sm:py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-xl bg-primary p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 animated-gradient-bg">
          {/* Background Pattern */}
          <div className="absolute inset-0 seal-pattern opacity-10" />

          <motion.div 
            className="relative grid gap-8 lg:gap-12 lg:grid-cols-2 lg:items-center"
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            {/* Content */}
            <div className="order-2 lg:order-1">
              <motion.div 
                className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-6"
                variants={slideInFromLeft}
              >
                <ShieldCheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                <span className="text-xs sm:text-sm font-medium text-primary-foreground">Start Your Free Trial Today</span>
              </motion.div>

              <motion.h2 
                className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-primary-foreground text-balance"
                variants={scaleIn}
              >
                Ready to Transform Your Legal Career?
              </motion.h2>

              <motion.p 
                className="mt-3 sm:mt-4 md:mt-6 text-sm sm:text-base md:text-lg text-primary-foreground/80"
                variants={slideInFromLeft}
              >
                Join thousands of successful law students and legal professionals. Get instant access to premium study
                materials and court tracking tools.
              </motion.p>

              <motion.div 
                className="mt-4 sm:mt-6 md:mt-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3"
                variants={staggerContainer}
              >
                <motion.div
                  variants={slideInFromLeft}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="w-full sm:w-auto"
                >
                  <Button size="lg" variant="secondary" className="gap-2 w-full sm:w-auto px-4 sm:px-6 md:px-8 cta-button-glow text-sm sm:text-base" asChild>
                    <Link href="/auth/signup">
                      Get Started Free
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div
                  variants={slideInFromLeft}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 w-full sm:w-auto px-4 sm:px-6 md:px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent cta-button-glow text-sm sm:text-base"
                    asChild
                  >
                    <Link href="/pricing">View Pricing</Link>
                  </Button>
                </motion.div>
              </motion.div>
            </div>

            {/* Benefits List */}
            <motion.div 
              className="glass rounded-xl p-4 sm:p-6 md:p-8 order-1 lg:order-2"
              variants={slideInFromLeft}
            >
              <motion.div 
                className="flex items-center gap-3 mb-4 sm:mb-6"
                variants={slideInFromLeft}
              >
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-accent">
                  <ScalesIcon className="h-5 w-5 sm:h-6 sm:w-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg md:text-xl font-semibold text-foreground">Everything You Need</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">All-in-one legal learning platform</p>
                </div>
              </motion.div>

              <motion.ul 
                className="space-y-2 sm:space-y-3 md:space-y-4"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.3
                    }
                  }
                }}
              >
                {benefits.map((benefit, i) => (
                  <motion.li 
                    key={i} 
                    className="flex items-start gap-2 sm:gap-3"
                    variants={slideInFromLeft}
                  >
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={isVisible ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                      transition={{ 
                        delay: 0.5 + (i * 0.1),
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                      className="mt-0.5"
                    >
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0 checkmark-animate" />
                    </motion.div>
                    <span className="text-foreground text-sm sm:text-base">{benefit}</span>
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div 
                className="mt-4 sm:mt-6 md:mt-8 pt-3 sm:pt-4 md:pt-6 border-t border-border"
                variants={slideInFromLeft}
              >
                <p className="text-xs sm:text-sm text-muted-foreground">No credit card required for 7-day free trial</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}