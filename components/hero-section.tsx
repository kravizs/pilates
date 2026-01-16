"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { useState } from "react"
import { SignupModal } from "./auth/signup-modal"
import { LoginModal } from "./auth/login-modal"
import { useRouter } from "next/navigation"

export function HeroSection() {
  const { t } = useLanguage()
  const router = useRouter()
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const handleStartJourney = () => {
    setIsSignupModalOpen(true)
  }

  const handleSchedule = () => {
    router.push("/planning")
  }

  const switchToLogin = () => {
    setIsSignupModalOpen(false)
    setIsLoginModalOpen(true)
  }

  const switchToSignup = () => {
    setIsLoginModalOpen(false)
    setIsSignupModalOpen(true)
  }

  return (
    <>
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted"
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/modern-wellness-studio-interior-with-yoga-mats-and.jpg"
            alt="Hi Studio Interior"
            className="w-full h-full object-cover opacity-20"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 container px-4 text-center space-y-6 md:space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-balance leading-tight">
              {t.hero.title}
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              {t.hero.subtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
            <Button
              size="lg"
              className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-4 md:py-6"
              onClick={handleStartJourney}
            >
              {t.hero.cta}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-4 md:py-6 bg-transparent"
              onClick={handleSchedule}
            >
              {t.nav.schedule}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-sm md:max-w-md mx-auto pt-8 md:pt-12">
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-primary">500+</div>
              <div className="text-xs md:text-sm text-muted-foreground">Happy Members</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-primary">50+</div>
              <div className="text-xs md:text-sm text-muted-foreground">Classes Weekly</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-primary">4.9</div>
              <div className="text-xs md:text-sm text-muted-foreground">Rating</div>
            </div>
          </div>
        </div>
      </section>

      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSwitchToLogin={switchToLogin}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToSignup={switchToSignup}
      />
    </>
  )
}
