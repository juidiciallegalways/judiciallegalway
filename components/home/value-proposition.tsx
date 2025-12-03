import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheckIcon, CourtBuildingIcon, BookLawIcon, CertificateIcon } from "@/components/icons/legal-icons"
import { Clock, Users, Award } from "lucide-react"

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

const stats = [
  { icon: Users, value: "50,000+", label: "Active Students" },
  { icon: BookLawIcon, value: "1,200+", label: "Study Materials" },
  { icon: Clock, value: "500+", label: "Video Hours" },
  { icon: Award, value: "95%", label: "Success Rate" },
]

export function ValueProposition() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Why Choose Judicially Legal Ways?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to excel in your legal career, from comprehensive study materials to real-time court
            tracking.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <Card key={i} className="group border-0 bg-card shadow-md transition-all hover:shadow-xl">
              <CardContent className="p-6">
                <div
                  className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${feature.color} transition-transform group-hover:scale-110`}
                >
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 rounded-2xl bg-primary p-8 lg:p-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/10">
                  <stat.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <p className="font-serif text-4xl font-bold text-primary-foreground">{stat.value}</p>
                <p className="mt-1 text-primary-foreground/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
