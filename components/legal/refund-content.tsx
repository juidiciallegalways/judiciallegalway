"use client"

import { motion } from "framer-motion"
import { XCircle, CheckCircle, AlertCircle, Clock, FileText } from "lucide-react"

export function RefundContent() {
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
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
            Refund and Cancellation Policy
          </h1>
          <p className="text-muted-foreground">
            Understanding our refund policy for digital content
          </p>
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-900 dark:text-red-200 flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4" />
              ALL SALES ARE FINAL - Refunds are only provided under specific exceptional circumstances
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
              <FileText className="h-6 w-6 text-primary" />
              1. GENERAL POLICY
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Judicially Legal Ways provides immediate access to digital content (Subject Material, Case Bundles, Notes). Due to the intangible nature of these digital goods, <strong className="text-foreground">ALL SALES ARE FINAL</strong>.
              </p>
              
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  We do NOT offer refunds for:
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <span><strong>Change of mind</strong> - Once purchased, digital content cannot be returned</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <span><strong>Accidental purchases</strong> - Once the content has been accessed or downloaded</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <span><strong>Incompatibility with unsupported devices</strong> - e.g., trying to access on a rooted/jailbroken device where DRM fails</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-primary" />
              2. ELIGIBILITY FOR REFUNDS (EXCEPTIONS)
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                We will strictly adhere to the following conditions for processing refunds:
              </p>
              
              <div className="space-y-4">
                {/* Duplicate Payment */}
                <div className="border border-green-500/20 rounded-lg overflow-hidden">
                  <div className="bg-green-500/10 border-b border-green-500/20 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Duplicate Payment</h3>
                        <p className="text-sm text-muted-foreground">Technical glitch causing double charge</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm">
                      If a technical glitch causes a <strong>double charge</strong> for the same order, we will refund the duplicate transaction immediately upon verification.
                    </p>
                  </div>
                </div>

                {/* Service Unavailability */}
                <div className="border border-green-500/20 rounded-lg overflow-hidden">
                  <div className="bg-green-500/10 border-b border-green-500/20 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Service Unavailability</h3>
                        <p className="text-sm text-muted-foreground">Platform downtime exceeding SLA</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm">
                      If the Platform is verifiably down (<strong>99.5% uptime SLA breach</strong>) for more than <strong>48 continuous hours</strong>, preventing access to subscribed content, you may be eligible for a refund.
                    </p>
                  </div>
                </div>

                {/* Wrong Content */}
                <div className="border border-green-500/20 rounded-lg overflow-hidden">
                  <div className="bg-green-500/10 border-b border-green-500/20 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Wrong Content</h3>
                        <p className="text-sm text-muted-foreground">Content mismatch with description</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm">
                      If the content unlocked does not match the description (e.g., purchased "IPC Notes" but received "Contracts Notes"), we will provide a full refund or replacement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              3. REFUND PROCESS
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <div className="grid sm:grid-cols-3 gap-4">
                {/* Request Window */}
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      1
                    </div>
                    <h3 className="font-semibold text-foreground">Request Window</h3>
                  </div>
                  <p className="text-sm">
                    You must submit a refund request to{" "}
                    <a href="mailto:juidiciallegalways@gmail.com" className="text-primary hover:underline">
                      juidiciallegalways@gmail.com
                    </a>{" "}
                    within <strong>7 days</strong> of the transaction.
                  </p>
                </div>

                {/* Verification */}
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      2
                    </div>
                    <h3 className="font-semibold text-foreground">Verification</h3>
                  </div>
                  <p className="text-sm">
                    Our team will verify your "Activity Logs" to confirm if the content was accessed. If logs show the content was viewed/consumed, the refund will be <strong>denied</strong>.
                  </p>
                </div>

                {/* Timeline */}
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      3
                    </div>
                    <h3 className="font-semibold text-foreground">Timeline</h3>
                  </div>
                  <p className="text-sm">
                    Approved refunds are processed within <strong>7-10 business days</strong> to the original payment source.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Important Note</h4>
                    <p className="text-sm text-amber-900 dark:text-amber-200">
                      All refund requests are subject to verification. We maintain detailed activity logs to ensure fair processing of refund claims.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <XCircle className="h-6 w-6 text-primary" />
              4. CANCELLATION OF SUBSCRIPTIONS
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    Auto-Renewal
                  </h3>
                  <p className="text-sm">
                    Monthly/Annual subscriptions renew automatically unless cancelled.
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg border">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    Cancellation
                  </h3>
                  <p className="text-sm">
                    You may cancel the renewal at any time via the <strong>"User Profile Dashboard"</strong>.
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg border">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    Effect
                  </h3>
                  <p className="text-sm">
                    Cancellation stops future billing. You retain access until the end of the current billing cycle. <strong>No partial refunds</strong> are provided for the remaining days of the current cycle.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">How to Cancel Your Subscription</h4>
                    <ol className="text-sm space-y-2 text-blue-900 dark:text-blue-200">
                      <li>1. Log in to your account</li>
                      <li>2. Go to your User Profile Dashboard</li>
                      <li>3. Navigate to Subscription Settings</li>
                      <li>4. Click "Cancel Subscription"</li>
                      <li>5. Confirm your cancellation</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-12 p-6 bg-muted rounded-lg border">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Need Help?</h3>
                <p className="text-sm text-muted-foreground">
                  For refund requests or questions about our refund policy, please contact us at{" "}
                  <a href="mailto:juidiciallegalways@gmail.com" className="text-primary hover:underline">
                    juidiciallegalways@gmail.com
                  </a>
                  {" "}within 7 days of your transaction.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
