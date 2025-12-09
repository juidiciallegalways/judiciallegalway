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
import { useCart } from "@/contexts/cart-context"

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
  const { items } = useCart()

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
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
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "glass shadow-lg border-b bg-background/80 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm group-hover:scale-110 transition-transform">
            <ScalesIcon className="h-6 w-6" />
          </div>
          <div className="hidden sm:block">
            <span className="font-serif text-lg font-bold text-primary block leading-none">Judicially</span>
            <span className="text-xs text-muted-foreground font-medium tracking-wide">Legal Ways</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex lg:items-center lg:gap-1 bg-background/50 p-1 rounded-full border backdrop-blur-sm">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-full ${
                pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.name}
              {pathname === item.href && (
                <motion.div layoutId="navbar-indicator" className="absolute inset-0 bg-muted -z-10 rounded-full" />
              )}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* THEME TOGGLE (Restored) */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}

          {/* Cart */}
          <Button variant="ghost" size="icon" className="relative rounded-full" asChild>
            <Link href="/store/cart">
              <ShoppingBag className="h-5 w-5" />
              {items.length > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
              )}
            </Link>
          </Button>

          {/* User Profile */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 rounded-full pl-1 pr-3 border-muted-foreground/20">
                  <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground font-bold">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild><Link href="/profile"><User className="mr-2 h-4 w-4"/> Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/admin"><Settings className="mr-2 h-4 w-4"/> Admin</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600"><LogOut className="mr-2 h-4 w-4"/> Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="rounded-full px-6 shadow-md"><Link href="/auth/login">Sign In</Link></Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 mt-8">
                {navigation.map((item) => (
                  <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium p-2 hover:bg-muted rounded-md">
                    {item.name}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  )
}