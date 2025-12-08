"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScalesIcon } from "@/components/icons/legal-icons"
import { Menu, Sun, Moon, ChevronDown, User, LogOut, Scale, ShoppingBag, Settings, Bell, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const navigation = [
  { name: "Home", href: "/", icon: null },
  { name: "Case Files", href: "/case-files", icon: FileText },
  { name: "Court Tracker", href: "/court-tracker", icon: Scale },
  { name: "Book Store", href: "/store", icon: ShoppingBag },
]

export function Header() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifications] = useState(3) // Mock notification count

  useEffect(() => {
    setMounted(true)

    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10)
          ticking = false
        })
        ticking = true
      }
    }
    
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = "/"
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "glass shadow-lg border-b" : "bg-background/80 backdrop-blur-sm"
      }`}
    >
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div 
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <ScalesIcon className="h-6 w-6 text-primary-foreground" />
          </motion.div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1">
              <span className="font-serif text-lg font-bold text-primary group-hover:text-primary/80 transition-colors">
                Judicially
              </span>
              <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">PRO</Badge>
            </div>
            <span className="text-xs text-muted-foreground">Legal Ways</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative px-4 py-2 group"
              >
                <span className={`text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"
                }`}>
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.name}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {!isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x