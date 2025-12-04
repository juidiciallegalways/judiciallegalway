import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { StoreContent } from "@/components/store/store-content"
import { BookLawIcon } from "@/components/icons/legal-icons"
import { Package, Shield } from "lucide-react"

export const metadata = {
  title: "Digital Study Store | Judicially Legal Ways",
  description: "Purchase digital study materials, e-books, and bundles for your legal education.",
}

export default function StorePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5 py-12 md:py-16">
          <div className="absolute inset-0 seal-pattern opacity-5" />
          <div className="absolute top-20 right-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-10 left-10 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
          
          <div className="container relative mx-auto px-4 lg:px-8">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span className="text-sm font-medium text-primary">Instant Digital Access</span>
              </div>
              <h1 className="font-serif text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
                Digital Study Store
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Premium digital study materials, e-books, and exam bundles. Curated by experts, trusted by thousands of law students across India.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <BookLawIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">500+ Materials</p>
                    <p className="text-xs text-muted-foreground">Expert Authored</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <Package className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Instant Access</p>
                    <p className="text-xs text-muted-foreground">Read Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">DRM Protected</p>
                    <p className="text-xs text-muted-foreground">Secure Content</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <StoreContent />
      </main>
      <Footer />
    </div>
  )
}
