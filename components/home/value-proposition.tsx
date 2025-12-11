'use client'

import React, { useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheckIcon, CourtBuildingIcon, BookLawIcon, CertificateIcon } from "@/components/icons/legal-icons"
import { Clock, Users, Award } from "lucide-react"
import { motion, useInView, useMotionValue, useSpring } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { fadeIn, fadeInUp, staggerContainer } from "@/lib/animation-variants"

const features = [
  {
    icon: ShieldCheckIcon,
    title: "Secure DRM Protection",
    description: "Advanced encryption with watermarks, screenshot detection, and device-level protection to safeguard premium content.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: CourtBuildingIcon,
    title: "Real-Time Court Tracking",
    description: "Live updates from Supreme Court, High Courts, and District Courts. Track cases by number, party, or advocate name.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: BookLawIcon,
    title: "Exam-Focused Content",
    description: "Curated study materials aligned with judiciary exam patterns. IPC, CrPC, CPC, Evidence Act, and more.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: CertificateIcon,
    title: "Expert-Authored Resources",
    description: "Content created by practicing advocates, retired judges, and law professors with decades of experience.",
    color: "bg-accent/10 text-accent",
  },
]

const stats = [
  { icon: Users, value: 500, suffix: "+", label: "Active Students" },
  { icon: BookLawIcon, value: 120, suffix: "+", label: "Study Materials" },
  { icon: Clock, value: 50, suffix: "+", label: "Video Hours" },
  { icon: Award, value: 90, suffix: "%", label: "Success Rate" },
]

function AnimatedStat({ 
  icon: Icon, 
  value, 
  suffix, 
  label 
}: { 
  icon: any
  value: number
  suffix: string
  label: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inViewRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(inViewRef, { once: true, margin: "-50px" })
  
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 60,
    duration: 4
  })

  useEffect(() => {
    if (isInView) {
      motionValue.set(value)
    }
  }, [isInView, value, motionValue])

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Intl.NumberFormat('en-US').format(Math.floor(latest))
      }
    })
  }, [springValue])

  return (
    <div ref={inViewRef} className="text-center">
      {/* Responsive icon container */}
      <div className="mx-auto mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-primary-foreground/10">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-primary-foreground" />
      </div>
      
      {/* Responsive number with suffix */}
      <p className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground flex justify-center items-baseline">
        <span ref={ref} className="tabular-nums tracking-tight">0</span>
        <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl ml-1">{suffix}</span>
      </p>
      
      {/* Responsive label */}
      <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-primary-foreground/80 font-medium">{label}</p>
    </div>
  )
}

export function ValueProposition() {
  const { isVisible, ref } = useScrollAnimation({ threshold: 0.1, triggerOnce: true })

  return (
    <motion.section 
      ref={ref as React.RefObject<HTMLElement>}
      className="py-8 sm:py-12 md:py-16 lg:py-20"
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Responsive */}
        <motion.div 
          className="mx-auto max-w-3xl text-center mb-8 sm:mb-12 md:mb-16"
          variants={fadeIn}
        >
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            Why Choose Judicially Legal Ways?
          </h2>
          <p className="mt-2 sm:mt-3 md:mt-4 text-sm sm:text-base md:text-lg text-muted-foreground">
            Everything you need to excel in your legal career, from comprehensive study materials to real-time court tracking.
          </p>
        </motion.div>

        {/* Features Grid - Responsive */}
        <motion.div 
          className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          variants={staggerContainer}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {features.map((feature, i) => (
            <motion.div 
              key={i} 
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="group border-0 bg-card shadow-sm sm:shadow-md transition-all duration-300 hover:shadow-lg sm:hover:shadow-xl h-full rounded-lg sm:rounded-xl">
                <CardContent className="p-4 sm:p-5 md:p-6">
                  {/* Responsive icon */}
                  <motion.div
                    className={`mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 items-center justify-center rounded-lg sm:rounded-xl ${feature.color}`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                  </motion.div>
                  
                  {/* Responsive title */}
                  <h3 className="font-serif text-base sm:text-lg md:text-xl font-semibold text-foreground mb-1 sm:mb-2">
                    {feature.title}
                  </h3>
                  
                  {/* Responsive description */}
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed sm:leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section - Fully Responsive */}
        <div className="mt-12 sm:mt-16 md:mt-20 lg:mt-24 rounded-xl bg-primary p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 shadow-xl">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {stats.map((stat, i) => (
              <AnimatedStat
                key={i}
                icon={stat.icon}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
              />
            ))}
          </div>
          
          {/* Additional responsive info - optional */}
          <div className="mt-6 sm:mt-8 md:mt-10 text-center">
            <p className="text-xs sm:text-sm text-primary-foreground/70">
              Real-time data updated monthly
            </p>
          </div>
        </div>

        {/* Optional: Mobile-specific call to action */}
        <div className="mt-8 sm:hidden">
          <div className="bg-accent/10 rounded-xl p-4 text-center">
            <p className="text-sm font-medium text-accent">Join 500+ successful law students today</p>
            <button className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  )
}