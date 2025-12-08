"use client"

import { motion } from "framer-motion"
import { Cookie, Shield, Settings, AlertCircle, CheckCircle, XCircle } from "lucide-react"

export function CookiesContent() {
  return (
    <div className="bg-background">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 bg-[url('/subtle-parchment-texture.png')] opacity-5" />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Cookie className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
            Cookies Policy
          </h1>
          <p className="text-muted-foreground">
            Cookies and Tracking Technologies Policy
          </p>
          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-sm text-amber-900 dark:text-amber-200 flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Understanding how we use cookies to provide and secure our services
            </p>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="prose prose-slate dark:prose-invert max-w-none"
        >
          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Cookie className="h-6 w-6 text-primary" />
              1. WHAT ARE COOKIES?
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Cookies are small text files placed on your device to store data that can be recalled by a web server. Given our use of Supabase Authentication and Next.js, we use a combination of <strong>HTTP Cookies</strong> and <strong>Local Storage</strong> to function.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Settings className="h-6 w-6 text-primary" />
              2. TYPES OF COOKIES WE USE
            </h2>
            <div className="space-y-6 text-muted-foreground">
              <p className="mb-6">
                We use different types of cookies to provide and secure our services:
              </p>

              {/* Strictly Necessary Cookies */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-red-500/10 border-b border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
                      <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">Strictly Necessary</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">Mandatory - Cannot be disabled</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <div>
                      <strong className="text-foreground">Authentication:</strong> Storing your Supabase Session Token (JWT) to keep you logged in.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <div>
                      <strong className="text-foreground">Security:</strong> Validating your session against your Device Fingerprint to enforce DRM.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <div>
                      <strong className="text-foreground">Load Balancing:</strong> AWS LightSail cookies to route traffic efficiently.
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-red-500/5 rounded-lg border border-red-500/20">
                    <p className="text-sm text-red-900 dark:text-red-200">
                      <strong>Note:</strong> You cannot use the Platform without these cookies. They are essential for security and functionality.
                    </p>
                  </div>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-blue-500/10 border-b border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                      <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">Functional</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Optional - Disables features if blocked</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    </div>
                    <div>
                      <strong className="text-foreground">Preferences:</strong> Remembering your font size in the Reader, "Mark-as-read" status, and Case Search filters.
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
                    <p className="text-sm text-blue-900 dark:text-blue-200">
                      <strong>Note:</strong> Disabling these cookies will result in loss of personalization features.
                    </p>
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-green-500/10 border-b border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">Analytics</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">Optional - Opt-in required</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10 shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    </div>
                    <div>
                      <strong className="text-foreground">Performance:</strong> Tracking which case studies are most read (for our "Most-read material" dashboard). We use anonymized data for this.
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-500/5 rounded-lg border border-green-500/20">
                    <p className="text-sm text-green-900 dark:text-green-200">
                      <strong>Note:</strong> These cookies help us improve our content and services. All data is anonymized.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Settings className="h-6 w-6 text-primary" />
              3. MANAGING COOKIES
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                You can control cookies via your browser settings. However, disabling <strong>Strictly Necessary</strong> cookies will break the Platform's functionality, specifically:
              </p>
              
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Impact of Disabling Necessary Cookies:</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        <span>You will be <strong>unable to log in</strong>.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        <span>The <strong>"Secure DRM-Based Reader"</strong> will fail to load content as it cannot verify your session security.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-6 bg-muted rounded-lg border">
                <h3 className="font-semibold text-foreground mb-3">How to Manage Cookies in Your Browser:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span><strong>Edge:</strong> Settings → Cookies and site permissions → Manage and delete cookies</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <div className="mt-12 p-6 bg-muted rounded-lg border">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Questions About Cookies?</h3>
                <p className="text-sm text-muted-foreground">
                  If you have any questions about our use of cookies, please contact us at{" "}
                  <a href="mailto:juidiciallegalways@gmail.com" className="text-primary hover:underline">
                    juidiciallegalways@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
