'use client'

import Link from "next/link"
import { motion } from "framer-motion"
import { ScalesIcon } from "@/components/icons/legal-icons"
import { Facebook, Twitter, Linkedin, Youtube, Mail, Phone, MapPin, ArrowRight, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

const footerLinks = {
  study: [
    { name: "Constitutional Law", href: "/case-files?category=constitutional" },
    { name: "Criminal Law", href: "/case-files?category=criminal" },
    { name: "Civil Law", href: "/case-files?category=civil" },
    { name: "Family Law", href: "/case-files?category=family" },
    { name: "Corporate Law", href: "/case-files?category=corporate" },
  ],
  services: [
    { name: "Court Tracker", href: "/court-tracker" },
    { name: "Book Store", href: "/store" },
    { name: "Subscriptions", href: "/pricing" },
    { name: "For Advocates", href: "/advocates" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Careers", href: "/careers" },
    { name: "Blog", href: "/blog" },
  ],
  legal: [
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Refund Policy", href: "/refund" },
    { name: "Cookie Policy", href: "/cookies" },
  ],
}

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
  { name: "YouTube", icon: Youtube, href: "#" },
]

export function Footer() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      setTimeout(() => {
        setIsSubscribed(false)
        setEmail('')
      }, 3000)
    }
  }

  return (
    <footer className="border-t bg-gradient-to-b from-muted/30 to-muted/50">
      <div className="container mx-auto px-4 py-12 lg:px-8">
        {/* Newsletter Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 rounded-xl bg-primary p-8 lg:p-10"
        >
          <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
            <div>
              <h3 className="font-serif text-2xl font-bold text-primary-foreground">
                Stay Updated with Legal Insights
              </h3>
              <p className="mt-2 text-primary-foreground/80">
                Get the latest court updates, case files, and exam tips delivered to your inbox.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
                required
              />
              <Button 
                type="submit" 
                variant="secondary"
                className="gap-2 whitespace-nowrap"
                disabled={isSubscribed}
              >
                {isSubscribed ? (
                  <>✓ Subscribed</>
                ) : (
                  <>
                    Subscribe
                    <Send className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </motion.div>

        {/* Main Footer Content */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div 
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <ScalesIcon className="h-6 w-6 text-primary-foreground" />
              </motion.div>
              <div>
                <span className="font-serif text-lg font-bold text-primary group-hover:text-primary/80 transition-colors">
                  Judicially
                </span>
                <span className="ml-1 text-sm text-muted-foreground">Legal Ways</span>
              </div>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              India&apos;s most reliable legal learning and court tracking platform. Empowering law students and
              professionals with secure, exam-focused resources.
            </p>
            <div className="mt-6 space-y-3">
              <a 
                href="mailto:contact@judicially.in" 
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <span>contact@judicially.in</span>
              </a>
              <a 
                href="tel:+919876543210" 
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <span>+91 98765 43210</span>
              </a>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-4 w-4" />
                </div>
                <span>New Delhi, India</span>
              </div>
            </div>
          </motion.div>

          {/* Study Materials */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="font-serif font-semibold text-foreground mb-4">Case Files</h3>
            <ul className="space-y-2.5">
              {footerLinks.study.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground transition-colors hover:text-primary flex items-center gap-2 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="font-serif font-semibold text-foreground mb-4">Services</h3>
            <ul className="space-y-2.5">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground transition-colors hover:text-primary flex items-center gap-2 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="font-serif font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground transition-colors hover:text-primary flex items-center gap-2 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h3 className="font-serif font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground transition-colors hover:text-primary flex items-center gap-2 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 flex flex-col items-center justify-between gap-6 border-t pt-8 md:flex-row"
        >
          <div className="flex flex-col items-center gap-3 md:flex-row md:gap-6">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Judicially Legal Ways. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <span>•</span>
              <Link href="/cookies" className="hover:text-primary transition-colors">Cookies</Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <motion.div
                key={social.name}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={social.href}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>SSL Secured</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span>DRM Protected</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-500" />
            <span>ISO Certified</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span>Trusted by 50,000+ Students</span>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
