"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { ScalesIcon } from "@/components/icons/legal-icons"
import { Menu, Sun, Moon, ChevronDown, User, LogOut, Scale, ShoppingBag, Settings, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
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
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { items } = useCart()
  const { user, profile, isLoading, isAdmin, isLawyer } = useAuth()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
  }

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

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
          {!mounted || isLoading ? (
            // Loading skeleton to prevent flash
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 bg-muted animate-pulse rounded-full" />
              <div className="h-4 w-16 bg-muted animate-pulse rounded hidden sm:block" />
            </div>
          ) : user ? (
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
                {isAdmin && (
                  <DropdownMenuItem asChild><Link href="/admin"><Settings className="mr-2 h-4 w-4"/> Admin Panel</Link></DropdownMenuItem>
                )}
                {isLawyer && (
                  <DropdownMenuItem asChild><Link href="/court-tracker"><Scale className="mr-2 h-4 w-4"/> My Cases</Link></DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600"><LogOut className="mr-2 h-4 w-4"/> Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="rounded-full px-6 shadow-md"><Link href="/auth/login">Get Started</Link></Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center gap-3 p-6 border-b bg-muted/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <ScalesIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="font-serif text-lg font-bold text-primary block leading-none">Judicially</span>
                    <span className="text-xs text-muted-foreground font-medium">Legal Ways</span>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 p-6">
                  <div className="space-y-2">
                    {navigation.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive 
                              ? "bg-primary text-primary-foreground shadow-sm" 
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          }`}
                        >
                          {Icon && <Icon className="h-5 w-5" />}
                          <span>{item.name}</span>
                        </Link>
                      )
                    })}
                  </div>

                  {/* User Section */}
                  <div className="mt-8 pt-6 border-t">
                    {user ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-lg">
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground font-bold">
                            {user.email?.[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.email}</p>
                            <p className="text-xs text-muted-foreground">Signed in</p>
                          </div>
                        </div>
                        
                        <Link
                          href="/profile"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                        >
                          <User className="h-5 w-5" />
                          <span>Profile</span>
                        </Link>
                        
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                          >
                            <Settings className="h-5 w-5" />
                            <span>Admin Panel</span>
                          </Link>
                        )}
                        {isLawyer && (
                          <Link
                            href="/court-tracker"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                          >
                            <Scale className="h-5 w-5" />
                            <span>My Cases</span>
                          </Link>
                        )}
                        
                        <button
                          onClick={() => {
                            handleSignOut()
                            setMobileMenuOpen(false)
                          }}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors w-full"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    ) : (
                      <Link
                        href="/auth/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium shadow-sm hover:bg-primary/90 transition-colors"
                      >
                        <User className="h-5 w-5" />
                        <span>Get Started</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-muted/30">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Theme</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  )
}