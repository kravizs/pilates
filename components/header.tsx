"use client"

import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/language-selector"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { Menu, X, User } from "lucide-react"
import { useState } from "react"
import { BookingModal } from "./booking/booking-modal"
import { LoginModal } from "./auth/login-modal"
import { SignupModal } from "./auth/signup-modal"
import Link from "next/link"

export function Header() {
  const { t } = useLanguage()
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)

  const handleLoginClick = () => {
    setIsLoginModalOpen(true)
    setIsMenuOpen(false) // Close mobile menu if open
  }

  const handleSignupClick = () => {
    setIsSignupModalOpen(true)
    setIsMenuOpen(false)
  }

  const switchToSignup = () => {
    setIsLoginModalOpen(false)
    setIsSignupModalOpen(true)
  }

  const switchToLogin = () => {
    setIsSignupModalOpen(false)
    setIsLoginModalOpen(true)
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-primary"></div>
            <span className="text-xl font-bold">Hi Studio</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              {t.nav?.home || "Home"}
            </Link>
            <Link href="/information" className="text-sm font-medium hover:text-primary transition-colors">
              {t.nav?.information || "Information"}
            </Link>
            <Link href="/planning" className="text-sm font-medium hover:text-primary transition-colors">
              {t.nav?.planning || "Planning"}
            </Link>
            <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
              {t.nav?.pricing || "Pricing"}
            </Link>
            {user && (
              <Link href="/account" className="text-sm font-medium hover:text-primary transition-colors">
                {t.nav?.account || "My Account"}
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <LanguageSelector />

            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground hidden lg:inline">Hi, {user.name}</span>
                {user.is_admin && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin">Admin</Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={logout}>
                  <User className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="hidden md:inline-flex" onClick={handleLoginClick}>
                  <User className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">{t.auth?.login || "Login"}</span>
                </Button>
                <Button className="hidden md:inline-flex" onClick={() => setIsBookingModalOpen(true)}>
                  {t.nav?.book || "Book Now"}
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="container mx-auto px-4 sm:px-6 py-4 space-y-4">
              <Link href="/" className="block text-sm font-medium hover:text-primary transition-colors">
                {t.nav?.home || "Home"}
              </Link>
              <Link href="/information" className="block text-sm font-medium hover:text-primary transition-colors">
                {t.nav?.information || "Information"}
              </Link>
              <Link href="/planning" className="block text-sm font-medium hover:text-primary transition-colors">
                {t.nav?.planning || "Planning"}
              </Link>
              <Link href="/pricing" className="block text-sm font-medium hover:text-primary transition-colors">
                {t.nav?.pricing || "Pricing"}
              </Link>
              {user && (
                <Link href="/account" className="block text-sm font-medium hover:text-primary transition-colors">
                  {t.nav?.account || "My Account"}
                </Link>
              )}
              {user ? (
                <div className="space-y-2 pt-2">
                  {user.is_admin && (
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <Link href="/admin">Admin Dashboard</Link>
                    </Button>
                  )}
                  <Button variant="outline" className="w-full bg-transparent" onClick={logout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <Button variant="outline" className="w-full bg-transparent" onClick={handleLoginClick}>
                    {t.auth?.login || "Login"}
                  </Button>
                  <Button className="w-full" onClick={() => setIsBookingModalOpen(true)}>
                    {t.nav?.book || "Book Now"}
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToSignup={switchToSignup}
      />
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSwitchToLogin={switchToLogin}
      />
    </>
  )
}
