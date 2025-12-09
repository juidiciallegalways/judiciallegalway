import { Header } from "@/components/layout/header"
import { HeroSection } from "@/components/home/hero-section"
import { ValueProposition } from "@/components/home/value-proposition"
import { FeaturedCarousel } from "@/components/home/featured-carousel" 
import { CourtUpdatesSection } from "@/components/home/court-updates-section" // Make sure this component exists!
import { Testimonials } from "@/components/home/testimonials"
import { CTASection } from "@/components/home/cta-section"
import { Footer } from "@/components/layout/footer"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        <HeroSection />
        <ValueProposition />
        {/* Real Dynamic Data Sections */}
        <FeaturedCarousel />
        <CourtUpdatesSection />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}