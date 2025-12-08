"use client"

import { motion } from "framer-motion"
import { Shield, Lock, Database, Eye, FileText, AlertCircle } from "lucide-react"

export function PrivacyContent() {
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
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last Updated: December 09, 2025
          </p>
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-200 flex items-center justify-center gap-2">
              <Lock className="h-4 w-4" />
              We are committed to protecting your privacy under the Digital Personal Data Protection Act, 2023
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
              1. INTRODUCTION
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Judicially Legal Ways ("we," "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal data when you use our Platform. We act as a <strong>Data Fiduciary</strong> under the Digital Personal Data Protection Act, 2023, determining the purposes and means of processing your data.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              2. DATA WE COLLECT
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                We collect the following categories of personal data to provide our services and enforce our security policies:
              </p>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border border-border rounded-lg">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-b">Data Category</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-b">Specific Data Points</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-b">Purpose of Collection</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium">Identity Data</td>
                      <td className="px-4 py-3 text-sm">Name, Profile Picture, User ID</td>
                      <td className="px-4 py-3 text-sm">To create your account and populate your User Profile Dashboard</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium">Professional Data</td>
                      <td className="px-4 py-3 text-sm">Bar Council Enrollment No., College Name, Role (Student/Advocate)</td>
                      <td className="px-4 py-3 text-sm">To verify eligibility for specific content tiers and customize the learning path</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium">Contact Data</td>
                      <td className="px-4 py-3 text-sm">Email Address, Phone Number</td>
                      <td className="px-4 py-3 text-sm">For authentication (Login/OTP), password resets, and sending invoices</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium">Financial Data</td>
                      <td className="px-4 py-3 text-sm">Transaction Logs, Order History, GSTIN</td>
                      <td className="px-4 py-3 text-sm">To process payments via Razorpay/Stripe and generate tax-compliant invoices. We do not store card details</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium">Technical Data (DRM)</td>
                      <td className="px-4 py-3 text-sm">Device ID, IP Address, OS Version, Browser Fingerprint, Screen Resolution</td>
                      <td className="px-4 py-3 text-sm"><strong>Critical:</strong> To enforce DRM (dynamic watermarking), detect screen recording, prevent account sharing, and secure the Platform against piracy</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium">Usage Data</td>
                      <td className="px-4 py-3 text-sm">Search history (cases), Bookmarks, Reading time, "Most-read material" stats</td>
                      <td className="px-4 py-3 text-sm">To power the Analytics Dashboard and improve content recommendations</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Eye className="h-6 w-6 text-primary" />
              3. HOW WE USE YOUR DATA
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>We process your data based on the following grounds:</p>
              
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <h3 className="font-semibold text-foreground mb-2">3.1. Performance of Contract</h3>
                  <p className="text-sm">To provide access to the Study Material Library and Court Tracking System.</p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg border">
                  <h3 className="font-semibold text-foreground mb-2">3.2. Legitimate Uses (Security & DRM)</h3>
                  <p className="text-sm mb-2">We process your Technical Data (Device ID, IP) to:</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Generate dynamic watermarks (embedding your ID into the content)</li>
                    <li>Detect and block screen recording software</li>
                    <li>Enforce the "One User, One Device" restriction</li>
                    <li>Prevent concurrent logins from different locations</li>
                  </ul>
                  <p className="text-sm mt-2 italic">Note: This processing is necessary to protect our intellectual property and prevent fraud.</p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg border">
                  <h3 className="font-semibold text-foreground mb-2">3.3. Consent</h3>
                  <p className="text-sm">For sending promotional emails or newsletters. You may withdraw this consent at any time.</p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg border">
                  <h3 className="font-semibold text-foreground mb-2">3.4. Legal Compliance</h3>
                  <p className="text-sm">Retaining financial records for 8 years as required by the GST Act and Income Tax Act.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
              4. DATA SHARING AND TRANSFERS
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                We share your data with trusted <strong>Data Processors</strong> who assist us in delivering the service. These partners are contractually bound to protect your data:
              </p>
              
              <ul className="space-y-3">
                <li className="p-4 bg-muted/50 rounded-lg border">
                  <strong className="text-foreground">Hosting & Infrastructure:</strong> AWS LightSail (Amazon Web Services). Data is stored in secure servers, primarily in the ap-south-1 (Mumbai) region to ensure low latency and data residency compliance.
                </li>
                <li className="p-4 bg-muted/50 rounded-lg border">
                  <strong className="text-foreground">Authentication & Database:</strong> Supabase. Used for secure login management and encrypted session storage. Supabase acts as a sub-processor.
                </li>
                <li className="p-4 bg-muted/50 rounded-lg border">
                  <strong className="text-foreground">Payments:</strong> Razorpay and Stripe. We share order details to process payments. We do not have access to your raw banking credentials.
                </li>
                <li className="p-4 bg-muted/50 rounded-lg border">
                  <strong className="text-foreground">Legal Disclosures:</strong> We may disclose your data to law enforcement agencies if required under Section 69 of the IT Act, 2000, particularly in cases of confirmed content piracy or cybercrime investigation.
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              5. DATA SECURITY
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                We employ enterprise-grade security measures as per Section 43A of the IT Act:
              </p>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10 shrink-0 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  </div>
                  <div>
                    <strong className="text-foreground">Encryption:</strong> Data is encrypted in transit (SSL/TLS) and at rest (Database encryption).
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 shrink-0 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                  </div>
                  <div>
                    <strong className="text-foreground">Access Control:</strong> Role-based access controls (RBAC) ensure only authorized personnel can access sensitive user logs.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/10 shrink-0 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                  </div>
                  <div>
                    <strong className="text-foreground">Obfuscation:</strong> The Platform uses DOM obfuscation to protect content from scraping, which also enhances data security.
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
              6. DATA RETENTION
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <ul className="space-y-3">
                <li>
                  <strong className="text-foreground">Active Accounts:</strong> We retain personal data as long as your account is active.
                </li>
                <li>
                  <strong className="text-foreground">Inactive Accounts:</strong> We may archive accounts after a period of inactivity but retain core identity data to prevent re-registration by banned users (e.g., those banned for piracy).
                </li>
                <li>
                  <strong className="text-foreground">Transaction Records:</strong> Retained for 8 years for tax audits.
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
              7. YOUR RIGHTS (DATA PRINCIPALS)
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>Under the DPDP Act, 2023, you have the right to:</p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h3 className="font-semibold text-foreground mb-2">Access</h3>
                  <p className="text-sm">Request a summary of the personal data we hold about you.</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h3 className="font-semibold text-foreground mb-2">Correction</h3>
                  <p className="text-sm">Update your profile details via the Dashboard.</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h3 className="font-semibold text-foreground mb-2">Grievance Redressal</h3>
                  <p className="text-sm">Contact our Grievance Officer for privacy concerns.</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h3 className="font-semibold text-foreground mb-2">Nomination</h3>
                  <p className="text-sm">Nominate an individual to exercise your rights in the event of death or incapacity.</p>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-12 p-6 bg-muted rounded-lg border">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Contact Us</h3>
                <p className="text-sm text-muted-foreground">
                  For any privacy-related questions or to exercise your rights, please contact us at{" "}
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
