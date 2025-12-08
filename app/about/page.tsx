import { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AboutContent } from "@/components/about/about-content"

export const metadata: Metadata = {
  title: "About Us | Judicially Legal Ways",
  description: "Learn about Judicially Legal Ways - India's premier legal education and court tracking platform",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <AboutContent />
      </main>
      <Footer />
    </div>
  )
}
