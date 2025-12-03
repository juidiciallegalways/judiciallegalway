"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react"
import { slideInFromLeft } from "@/lib/animation-variants"

const testimonials = [
  {
    id: 1,
    name: "Advocate Priya Sharma",
    role: "Delhi High Court",
    avatar: "/professional-indian-woman-lawyer-portrait.jpg",
    content:
      "Judicially Legal Ways transformed my case preparation. The court tracking feature saves me hours every week, and the study materials are incredibly well-organized.",
    rating: 5,
  },
  {
    id: 2,
    name: "Rahul Verma",
    role: "Judiciary Aspirant",
    avatar: "/young-indian-man-student-portrait.jpg",
    content:
      "I cleared my Judicial Services exam on the first attempt thanks to the comprehensive study materials. The DRM protection also ensures I get quality, piracy-free content.",
    rating: 5,
  },
  {
    id: 3,
    name: "Justice K.S. Reddy (Retd.)",
    role: "Former District Judge",
    avatar: "/elderly-indian-man-judge-portrait.jpg",
    content:
      "As someone who has spent 30 years in the judiciary, I can vouch for the accuracy and depth of the content. This platform is what every law student needs.",
    rating: 5,
  },
  {
    id: 4,
    name: "Ananya Patel",
    role: "LLM Student, NLU Delhi",
    avatar: "/young-indian-woman-law-student-portrait.jpg",
    content:
      "The real-time court updates feature is a game-changer for my research work. No other platform offers this level of comprehensive legal resources.",
    rating: 5,
  },
]

// Animation variants for testimonial transitions
const testimonialVariants = {
  enter: {
    opacity: 0,
    scale: 0.95,
    x: 50,
  },
  center: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    x: -50,
    transition: {
      duration: 0.6,
      ease: "easeIn",
    },
  },
}

// Stagger container for testimonial content
const contentStaggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

// Individual content item animation
const contentItem = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
}

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">Trusted by Legal Professionals</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Hear from advocates, judges, and students who have transformed their legal journey with us.
          </p>
        </div>

        <div className="relative mx-auto max-w-4xl">
          {/* Main Testimonial Card */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Card className="glass border-0 shadow-xl group hover:shadow-2xl transition-shadow duration-300 overflow-hidden rounded-xl">
            <CardContent className="p-8 lg:p-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  variants={testimonialVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <motion.div
                    variants={contentStaggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div variants={contentItem}>
                      <Quote className="h-12 w-12 text-accent/30 mb-6 transition-transform duration-300 group-hover:scale-110" />
                    </motion.div>

                    <motion.p 
                      variants={contentItem}
                      className="text-xl lg:text-2xl text-foreground leading-relaxed mb-8"
                    >
                      &ldquo;{testimonials[currentIndex].content}&rdquo;
                    </motion.p>

                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <motion.div 
                        variants={slideInFromLeft}
                        className="flex items-center gap-4"
                      >
                        <Avatar className="h-14 w-14 border-2 border-accent">
                          <AvatarImage 
                            src={testimonials[currentIndex].avatar || "/placeholder.svg"}
                            loading="lazy"
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {testimonials[currentIndex].name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <motion.p 
                            variants={contentItem}
                            className="font-serif font-semibold text-foreground"
                          >
                            {testimonials[currentIndex].name}
                          </motion.p>
                          <motion.p 
                            variants={contentItem}
                            className="text-sm text-muted-foreground"
                          >
                            {testimonials[currentIndex].role}
                          </motion.p>
                        </div>
                      </motion.div>

                      <motion.div 
                        variants={contentItem}
                        className="flex items-center gap-1"
                      >
                        {Array.from({ length: testimonials[currentIndex].rating }).map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
                          >
                            <Star className="h-5 w-5 fill-accent text-accent" />
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button variant="outline" size="icon" onClick={prevTestimonial}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous testimonial</span>
            </Button>

            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                    i === currentIndex ? "bg-primary" : "bg-border"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                  whileHover={{ scale: 1.1 }}
                  animate={{
                    scale: i === currentIndex ? 1.2 : 1,
                  }}
                  style={{
                    animation: i === currentIndex ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
                  }}
                />
              ))}
            </div>

            <Button variant="outline" size="icon" onClick={nextTestimonial}>
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next testimonial</span>
            </Button>
          </div>
          
          <style jsx>{`
            @keyframes pulse {
              0%, 100% {
                opacity: 1;
              }
              50% {
                opacity: 0.7;
              }
            }
          `}</style>
        </div>

        {/* Logos/Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-6">Recognized by leading legal institutions</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            {["Bar Council of India", "NLU Delhi", "NLSIU Bangalore", "NALSAR Hyderabad"].map((name, i) => (
              <div key={i} className="font-serif text-lg font-semibold text-foreground">
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
