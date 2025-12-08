"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Sparkles, Crown, BookOpen } from "lucide-react"
import { ScalesIcon } from "@/components/icons/legal-icons"

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Perfect for getting started with legal studies",
    icon: BookOpen,
    features: [
      "Access to basic study materials",
      "Limited case file storage (5 files)",
      "Community support",
      "Basic court tracker",
      "Weekly legal updates",
    ],
    cta: "Get Started",
    popular: false,
    color: "from-slate-500 to-slate-600",
  },
  {
    name: "Pro",
    price: "₹499",
    period: "per month",
    description: "For serious law students and professionals",
    icon: Sparkles,
    features: [
      "Everything in Free",
      "Unlimited case file storage",
      "Advanced court tracker with notifications",
      "Priority support",
      "Exclusive study materials & notes",
      "AI-powered legal research assistant",
      "Downloadable PDF resources",
      "Ad-free experience",
    ],
    cta: "Start Pro Trial",
    popular: true,
    color: "from-primary to-purple-600",
  },
  {
    name: "Exclusive",
    price: "₹999",
    period: "per month",
    description: "Ultimate package for legal excellence",
    icon: Crown,
    features: [
      "Everything in Pro",
      "1-on-1 mentorship sessions (2/month)",
      "Live webinars with legal experts",
      "Custom study plans",
      "Early access to new features",
      "Dedicated account manager",
      "Exclusive networking events",
      "Certificate of completion",
      "Lifetime resource access",
    ],
    cta: "Go Exclusive",
    popular: false,
    color: "from-amber-500 to-orange-600",
  },
]

export function PricingSection() {
  const [selectedPlan, setSelectedPlan] = useState<string>("Pro")

  return (
    <div className="bg-background">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 bg-[url('/subtle-parchment-texture.png')] opacity-5" />

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select the perfect plan for your legal studies journey. Upgrade, downgrade, or cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon
            const isSelected = selectedPlan === plan.name
            return (
              <Card
                key={plan.name}
                onClick={() => setSelectedPlan(plan.name)}
                onMouseEnter={() => setSelectedPlan(plan.name)}
                className={`relative flex flex-col cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? "border-primary shadow-xl scale-105"
                    : "border-border/50 hover:border-primary/50 hover:shadow-lg"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pb-6">
                  <div className={`mx-auto mb-3 h-12 w-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center transition-transform ${isSelected ? "scale-110" : ""}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="font-serif text-xl mb-1">{plan.name}</CardTitle>
                  <CardDescription className="text-xs">{plan.description}</CardDescription>
                  <div className="mt-3">
                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground text-sm ml-1">/ {plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 pt-0">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-xs text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4">
                  <Button
                    className="w-full"
                    variant={isSelected ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation()
                      // Do nothing for now
                    }}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">Can I switch plans later?</h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">Is there a free trial?</h3>
              <p className="text-muted-foreground">
                Pro and Exclusive plans come with a 7-day free trial. No credit card required to start.
              </p>
            </div>
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards, debit cards, UPI, and net banking through our secure payment gateway.
              </p>
            </div>
            <div className="border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Absolutely! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl p-12 border border-primary/20">
            <h2 className="font-serif text-3xl font-bold mb-4">
              Still have questions?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Our team is here to help you choose the right plan for your needs.
            </p>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
