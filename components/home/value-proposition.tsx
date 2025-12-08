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
    description:
      "Advanced encryption with watermarks, screenshot detection, and device-level protection to safeguard premium content.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: CourtBuildingIcon,
    title: "Real-Time Court Tracking",
    description:
      "Live updates from Supreme Court, High Courts, and District Courts. Track cases by number, party, or advocate name.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: BookLawIcon,
    title: "Exam-Focused Content",
    description:
      "Curated study materials aligned with judiciary exam patterns. IPC, CrPC, CPC, Evidence Act, and more.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: CertificateIcon,
    title: "Expert-Authored Resources",
    description:
      "Content created by practicing advocates, retired judges, and law professors with decades of experience.",
    color: "bg-accent/10 text-accent",
  },
]

// Note: value is now a number for animation
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
    stiffness: 60, // Lower stiffness for a smoother, slower ease-out
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
        // Format with commas (e.g., 50,000)
        ref.current.textContent = Intl.NumberFormat('en-US').format(Math.floor(latest))
      }
    })
  }, [springValue])

  return (
    <div ref={inViewRef} className="text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/10">
        <Icon className="h-7 w-7 text-primary-foreground" />
      </div>
      <p className="font-serif text-4xl font-bold text-primary-foreground flex justify-center items-baseline">
        {/* tabular-nums ensures all numbers have equal width to prevent jitter */}
        <span ref={ref} className="tabular-nums tracking-tight">0</span>
        <span>{suffix}</span>
      </p>
      <p className="mt-1 text-primary-foreground/80">{label}</p>
    </div>
  )
}

export function ValueProposition() {
  const { isVisible, ref } = useScrollAnimation({ threshold: 0.1, triggerOnce: true })

  return (
    <motion.section 
      ref={ref as React.RefObject<HTMLElement>}
      className="py-12 md:py-16"
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
    >
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="mx-auto max-w-3xl text-center mb-16"
          variants={fadeIn}
        >
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Why Choose Judicially Legal Ways?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to excel in your legal career, from comprehensive study materials to real-time court
            tracking.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
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
              <Card className="group border-0 bg-card shadow-md transition-shadow duration-300 hover:shadow-xl h-full rounded-xl">
                <CardContent className="p-6">
                  <motion.div
                    className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${feature.color}`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <feature.icon className="h-7 w-7" />
                  </motion.div>
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <div className="mt-20 rounded-xl bg-primary p-8 lg:p-12 shadow-2xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
        </div>
      </div>
    </motion.section>
  )
}