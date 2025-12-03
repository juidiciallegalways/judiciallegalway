import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScalesIcon, ShieldCheckIcon } from "@/components/icons/legal-icons"
import { ArrowRight, CheckCircle } from "lucide-react"

const benefits = [
  "Access to 1,200+ study materials",
  "Real-time court case tracking",
  "DRM-protected secure content",
  "Expert video lectures",
  "Mobile-friendly access",
  "24/7 customer support",
]

export function CTASection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-8 lg:p-16">
          {/* Background Pattern */}
          <div className="absolute inset-0 seal-pattern opacity-10" />

          <div className="relative grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 mb-6">
                <ShieldCheckIcon className="h-5 w-5 text-primary-foreground" />
                <span className="text-sm font-medium text-primary-foreground">Start Your Free Trial Today</span>
              </div>

              <h2 className="font-serif text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl text-balance">
                Ready to Transform Your Legal Career?
              </h2>

              <p className="mt-6 text-lg text-primary-foreground/80">
                Join thousands of successful law students and legal professionals. Get instant access to premium study
                materials and court tracking tools.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button size="lg" variant="secondary" className="gap-2 px-8" asChild>
                  <Link href="/auth/sign-up">
                    Get Started Free
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                  asChild
                >
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>

            {/* Benefits List */}
            <div className="glass rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                  <ScalesIcon className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-foreground">Everything You Need</h3>
                  <p className="text-sm text-muted-foreground">All-in-one legal learning platform</p>
                </div>
              </div>

              <ul className="space-y-4">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">No credit card required for 7-day free trial</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
