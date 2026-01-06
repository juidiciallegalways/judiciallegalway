"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, BookOpen, FileText, Scale } from "lucide-react"
import Image from "next/image"
import { CarouselSkeleton } from "./carousel-skeleton"
import { useImagesLoading } from "@/hooks/use-image-loading"

const featuredItems = [
  {
    id: 1,
    type: "case",
    title: "Kesavananda Bharati Case",
    description: "Landmark judgment establishing the basic structure doctrine",
    image: "/indian-penal-code-law-book.jpg",
    badge: "Most Popular",
    href: "/case-files?category=constitutional",
    icon: BookOpen,
  },
  {
    id: 2,
    type: "case",
    title: "Criminal Law Cases",
    description: "Important judgments on IPC and CrPC with detailed analysis",
    image: "/criminal-procedure-code-legal-document.jpg",
    badge: "Exam Essential",
    href: "/case-files?category=criminal",
    icon: FileText,
  },
  {
    id: 3,
    type: "update",
    title: "Supreme Court Updates",
    description: "Latest landmark judgments and constitutional interpretations",
    image: "/supreme-court-of-india-building.jpg",
    badge: "Live Updates",
    href: "/court-tracker",
    icon: Scale,
  },
  {
    id: 4,
    type: "case",
    title: "Civil Law Judgments",
    description: "Comprehensive collection of civil law case files",
    image: "/evidence-act-law-courtroom.jpg",
    badge: "New Content",
    href: "/case-files?category=civil",
    icon: BookOpen,
  },
  {
    id: 5,
    type: "case",
    title: "Family Law Cases",
    description: "Important family law judgments and precedents",
    image: "/civil-procedure-code-legal-files.jpg",
    badge: "Updated 2024",
    href: "/case-files?category=family",
    icon: FileText,
  },
]

export function FeaturedCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)
  const [isHovered, setIsHovered] = useState(false)
  const [isInViewport, setIsInViewport] = useState(true)
  const [lastInteractionTime, setLastInteractionTime] = useState(0)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const carouselRef = useRef<HTMLDivElement>(null)
  
  // Track image loading state
  const { isLoading: imagesLoading } = useImagesLoading(
    featuredItems.map(item => item.image)
  )

  // Show skeleton on initial load while images are loading
  useEffect(() => {
    if (!imagesLoading && isInitialLoad) {
      // Add a small delay for smooth transition
      const timer = setTimeout(() => {
        setIsInitialLoad(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [imagesLoading, isInitialLoad])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1)
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2)
      } else {
        setItemsPerView(3)
      }
    }

    // Debounce resize handler for better performance
    let resizeTimer: NodeJS.Timeout
    const debouncedResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(handleResize, 150)
    }

    handleResize()
    window.addEventListener("resize", debouncedResize, { passive: true })
    return () => {
      window.removeEventListener("resize", debouncedResize)
      clearTimeout(resizeTimer)
    }
  }, [])

  // Intersection Observer to pause auto-play when out of viewport
  useEffect(() => {
    const element = carouselRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const maxIndex = Math.max(0, featuredItems.length - itemsPerView)

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
    setLastInteractionTime(Date.now())
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
    setLastInteractionTime(Date.now())
  }

  // Auto-play with pause on hover and after manual interaction
  useEffect(() => {
    const shouldPause = isHovered || !isInViewport || (Date.now() - lastInteractionTime < 10000)
    
    if (shouldPause) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
    }, 5000)
    
    return () => clearInterval(timer)
  }, [maxIndex, isHovered, isInViewport, lastInteractionTime])

  return (
    <section className="py-12 md:py-16" ref={carouselRef}>
      <div className="container mx-auto px-4 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl font-bold text-foreground">Featured Case Files & Updates</h2>
            <p className="mt-2 text-muted-foreground">
              Explore landmark judgments and latest court updates
            </p>
          </div>
          
          {/* Desktop navigation in header */}
          <div className="hidden sm:flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={prevSlide} 
              disabled={currentIndex === 0}
              className="h-10 w-10 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={nextSlide} 
              disabled={currentIndex >= maxIndex}
              className="h-10 w-10 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </div>
      </div>

      <div className={`${itemsPerView === 1 ? 'px-4' : 'px-4 lg:px-8 xl:px-12'}`}>
        <div className="relative">
          <div 
            className="overflow-hidden carousel-container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
          {isInitialLoad && imagesLoading ? (
            <CarouselSkeleton itemsPerView={itemsPerView} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className={`flex ${itemsPerView === 1 ? 'gap-0' : 'gap-6'}`}
                animate={{
                  x: `-${currentIndex * (100 / itemsPerView)}%`,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 0.8,
                }}
              >
            {featuredItems.map((item) => (
              <motion.div
                key={item.id}
                className="flex-shrink-0"
                style={{ 
                  width: itemsPerView === 1 
                    ? '100%' 
                    : itemsPerView === 2 
                    ? 'calc(50% - 12px)' 
                    : 'calc(33.333% - 16px)'
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <Card
                  className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group card-hover rounded-xl"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      fill
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwABmQA//Z"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <Badge className="absolute left-4 top-4 bg-accent text-accent-foreground">{item.badge}</Badge>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center hidden md:flex">
                      <p className="text-white text-sm px-4 text-center">{item.description}</p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <item.icon className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                      <span className="text-sm font-medium text-primary capitalize">
                        {item.type === "update" ? "Court Update" : "Case File"}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{item.description}</p>
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <Link href={item.href}>Explore Now</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
              </motion.div>
            </motion.div>
          )}
          </div>

          {/* Mobile navigation - visible on smaller screens */}
          <div className="flex sm:hidden items-center justify-center gap-4 mt-6">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={prevSlide} 
              disabled={currentIndex === 0}
              className="h-10 w-10 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={nextSlide} 
              disabled={currentIndex >= maxIndex}
              className="h-10 w-10 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
