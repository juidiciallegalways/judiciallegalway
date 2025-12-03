"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, BookOpen, FileText, Scale } from "lucide-react"

const featuredItems = [
  {
    id: 1,
    type: "subject",
    title: "Indian Penal Code (IPC)",
    description: "Complete coverage of all 511 sections with case laws and examples",
    image: "/indian-penal-code-law-book.jpg",
    badge: "Most Popular",
    href: "/study-materials?category=ipc",
    icon: BookOpen,
  },
  {
    id: 2,
    type: "subject",
    title: "Criminal Procedure Code",
    description: "In-depth analysis of CrPC with procedural flowcharts",
    image: "/criminal-procedure-code-legal-document.jpg",
    badge: "Exam Essential",
    href: "/study-materials?category=crpc",
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
    type: "subject",
    title: "Evidence Act",
    description: "Comprehensive guide with practical applications",
    image: "/evidence-act-law-courtroom.jpg",
    badge: "New Content",
    href: "/study-materials?category=evidence",
    icon: BookOpen,
  },
  {
    id: 5,
    type: "subject",
    title: "Civil Procedure Code",
    description: "Civil litigation procedures simplified for exams",
    image: "/civil-procedure-code-legal-files.jpg",
    badge: "Updated 2024",
    href: "/study-materials?category=cpc",
    icon: FileText,
  },
]

export function FeaturedCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)

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

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const maxIndex = Math.max(0, featuredItems.length - itemsPerView)

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(timer)
  }, [maxIndex])

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl font-bold text-foreground">Featured Subjects & Updates</h2>
            <p className="mt-2 text-muted-foreground">
              Explore our most popular study materials and latest court updates
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevSlide} disabled={currentIndex === 0}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </Button>
            <Button variant="outline" size="icon" onClick={nextSlide} disabled={currentIndex >= maxIndex}>
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </div>

        <div className="overflow-hidden">
          <div
            className="flex gap-6 transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            }}
          >
            {featuredItems.map((item) => (
              <Card
                key={item.id}
                className="flex-shrink-0 overflow-hidden transition-all hover:shadow-lg"
                style={{ width: `calc(${100 / itemsPerView}% - ${((itemsPerView - 1) * 24) / itemsPerView}px)` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <Badge className="absolute left-4 top-4 bg-accent text-accent-foreground">{item.badge}</Badge>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <item.icon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-primary capitalize">
                      {item.type === "update" ? "Court Update" : "Study Material"}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{item.description}</p>
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href={item.href}>Explore Now</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-6 sm:hidden">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 w-2 rounded-full transition-colors ${i === currentIndex ? "bg-primary" : "bg-border"}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
