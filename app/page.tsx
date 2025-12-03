import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturedCarousel } from "@/components/home/featured-carousel"
import { ValueProposition } from "@/components/home/value-proposition"
import { Testimonials } from "@/components/home/testimonials"
import { CTASection } from "@/components/home/cta-section"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturedCarousel />
        <ValueProposition />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
