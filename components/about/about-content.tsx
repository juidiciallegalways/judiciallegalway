"use client"

import { motion } from "framer-motion"
import { Scale, Target, Shield, Zap, BookOpen, Users, Mail, Phone, MapPin, Clock } from "lucide-react"
import { ScalesIcon } from "@/components/icons/legal-icons"

export function AboutContent() {
  return (
    <div className="bg-background">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 bg-[url('/subtle-parchment-texture.png')] opacity-5" />

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
              <ScalesIcon className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            About Us
          </h1>
          <p className="text-xl text-muted-foreground">
            Welcome to Judicially Legal Ways
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Judicially Legal Ways is India's premier digital ecosystem designed to bridge the gap between legal education and professional practice. We are a specialized <strong>Legal-Tech & Ed-Tech platform</strong> dedicated to empowering law students, judicial aspirants, and practicing advocates with high-quality resources and real-time judicial data.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mt-4">
              We combine academic rigor with cutting-edge technology to make legal knowledge accessible, structured, and affordable for everyone.
            </p>
          </div>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl p-8 md:p-12 border border-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <Target className="h-6 w-6 text-primary-foreground" />
              </div>
              <h2 className="font-serif text-3xl font-bold text-foreground">Our Mission</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              To democratize legal education and practice management in India by providing:
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-background/50 rounded-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">For Aspirants</h3>
                  <p className="text-sm text-muted-foreground">
                    A comprehensive library of subject-wise notes, case studies, and judgment breakdowns that simplify complex legal concepts for Judiciary, CLAT, and Bar Exams.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-background/50 rounded-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <Scale className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">For Advocates</h3>
                  <p className="text-sm text-muted-foreground">
                    A powerful Real-Time Court Tracking System that aggregates daily cause lists, hearing schedules, and case statuses from courts across India, ensuring you never miss a hearing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Why Choose Us */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-6xl mx-auto mb-16"
        >
          <h2 className="font-serif text-3xl font-bold text-foreground text-center mb-12">
            Why Choose Us?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-muted/50 rounded-xl border border-border hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground">Comprehensive Digital Library</h3>
              </div>
              <p className="text-muted-foreground">
                Access structured study materials covering IPC, CrPC, CPC, Constitution, and more. Our content is curated by experts to ensure depth and clarity.
              </p>
            </div>

            <div className="p-6 bg-muted/50 rounded-xl border border-border hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground">Advanced Technology</h3>
              </div>
              <p className="text-muted-foreground">
                We utilize Enterprise-Grade DRM (Digital Rights Management) to ensure that our proprietary content remains exclusive and secure.
              </p>
            </div>

            <div className="p-6 bg-muted/50 rounded-xl border border-border hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground">Real-Time Intelligence</h3>
              </div>
              <p className="text-muted-foreground">
                Our platform integrates directly with court systems to provide live updates on case statuses, judge assignments, and hearing dates, reducing the manual burden on legal professionals.
              </p>
            </div>

            <div className="p-6 bg-muted/50 rounded-xl border border-border hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground">Secure & Reliable</h3>
              </div>
              <p className="text-muted-foreground">
                Built on a robust AWS LightSail infrastructure with Supabase authentication, we guarantee 99.5% uptime and complete data security for our users.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-br from-muted/50 to-muted rounded-2xl p-8 md:p-12 border">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <h2 className="font-serif text-3xl font-bold text-foreground">Contact Us</h2>
            </div>
            <p className="text-muted-foreground mb-8">
              We are here to assist you with your subscription, technical queries, or partnership opportunities.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground mb-4">Get in Touch</h3>
                <a 
                  href="mailto:juidiciallegalways@gmail.com"
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">juidiciallegalways@gmail.com</p>
                  </div>
                </a>
                <a 
                  href="tel:+919876543210"
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">+91 98765 43210</p>
                  </div>
                </a>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-medium">New Delhi, India</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground mb-4">Office Hours</h3>
                <div className="flex items-start gap-3 text-muted-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Monday - Friday</p>
                    <p className="text-sm">09:00 AM – 05:00 PM</p>
                    <p className="text-sm mt-2 font-medium text-foreground">Saturday & Sunday</p>
                    <p className="text-sm">Closed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <h3 className="font-semibold text-foreground mb-3">Technical & Strategic Partner</h3>
              <p className="text-sm text-muted-foreground">
                <strong>Arccena Solutions:</strong> Our platform is developed and maintained under a strategic partnership for continuous innovation and feature refinement.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
