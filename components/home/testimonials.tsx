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
    content: "Judicially Legal Ways transformed my case preparation. The court tracking feature saves me hours every week, and the study materials are incredibly well-organized.",
    rating: 5,
  },
  {
    id: 2,
    name: "Rahul Verma",
    role: "Judiciary Aspirant",
    avatar: "/young-indian-man-student-portrait.jpg",
    content: "I cleared my Judicial Services exam on the first attempt thanks to the comprehensive study materials. The DRM protection also ensures I get quality, piracy-free content.",
    rating: 5,
  },
  {
    id: 3,
    name: "Justice K.S. Reddy (Retd.)",
    role: "Former District Judge",
    avatar: "/elderly-indian-man-judge-portrait.jpg",
    content: "As someone who has spent 30 years in the judiciary, I can vouch for the accuracy and depth of the content. This platform is what every law student needs.",
    rating: 5,
  },
  {
    id: 4,
    name: "Ananya Patel",
    role: "LLM Student, NLU Delhi",
    avatar: "/young-indian-woman-law-student-portrait.jpg",
    content: "The real-time court updates feature is a game-changer for my research work. No other platform offers this level of comprehensive legal resources.",
    rating: 5,
  },
]

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
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    x: -50,
    transition: {
      duration: 0.6,
    },
  },
}

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

const contentItem = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
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
    <section className="py-8 sm:py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-8 sm:mb-12">
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">Trusted by Legal Professionals</h2>
          <p className="mt-2 sm:mt-4 text-sm sm:text-base md:text-lg text-muted-foreground">
            Hear from advocates, judges, and students who have transformed their legal journey with us.
          </p>
        </div>

        <div className="relative mx-auto max-w-4xl">
          {/* Navigation arrows positioned outside the testimonial card */}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={prevTestimonial} 
            className="absolute -left-12 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 hidden lg:flex"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous testimonial</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={nextTestimonial} 
            className="absolute -right-12 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 hidden lg:flex"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next testimonial</span>
          </Button>

          {/* Main Testimonial Card */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass border-0 shadow-xl group hover:shadow-2xl transition-shadow duration-300 overflow-hidden rounded-xl">
              <CardContent className="p-4 sm:p-6 md:p-8 lg:p-12">
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
                        <Quote className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-accent/30 mb-4 sm:mb-6 transition-transform duration-300 group-hover:scale-110" />
                      </motion.div>

                      <motion.p 
                        variants={contentItem}
                        className="text-base sm:text-lg md:text-xl lg:text-2xl text-foreground leading-relaxed mb-6 md:mb-8"
                      >
                        &ldquo;{testimonials[currentIndex].content}&rdquo;
                      </motion.p>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6">
                        <motion.div 
                          variants={slideInFromLeft}
                          className="flex items-center gap-3 md:gap-4 w-full sm:w-auto"
                        >
                          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 border-2 border-accent">
                            <AvatarImage 
                              src={testimonials[currentIndex].avatar || "/placeholder.svg"}
                              loading="lazy"
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                              {testimonials[currentIndex].name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <motion.p 
                              variants={contentItem}
                              className="font-serif font-semibold text-foreground text-sm sm:text-base md:text-lg"
                            >
                              {testimonials[currentIndex].name}
                            </motion.p>
                            <motion.p 
                              variants={contentItem}
                              className="text-xs sm:text-sm text-muted-foreground"
                            >
                              {testimonials[currentIndex].role}
                            </motion.p>
                          </div>
                        </motion.div>

                        <motion.div 
                          variants={contentItem}
                          className="flex items-center gap-1 self-start sm:self-center"
                        >
                          {Array.from({ length: testimonials[currentIndex].rating }).map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
                            >
                              <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-accent text-accent" />
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

          {/* Mobile navigation - visible on smaller screens */}
          <div className="flex lg:hidden items-center justify-center gap-4 mt-6">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={prevTestimonial} 
              className="h-10 w-10 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous testimonial</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={nextTestimonial} 
              className="h-10 w-10 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next testimonial</span>
            </Button>
          </div>
        </div>

        {/* Logos/Trust Badges */}
        <div className="mt-8 sm:mt-12 md:mt-16 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">Recognized by leading legal institutions</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 opacity-60">
            {["Bar Council of India", "NLU Delhi", "NLSIU Bangalore", "NALSAR Hyderabad"].map((name, i) => (
              <div key={i} className="font-serif text-sm sm:text-base md:text-lg font-semibold text-foreground">
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}