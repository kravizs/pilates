"use client"

import { useLanguage } from "@/contexts/language-context"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import { SocialMediaLinks } from "./social-media-links"
import { NewsletterSignup } from "./newsletter-signup"
import Link from "next/link"

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-muted py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo and Description */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary"></div>
              <span className="text-xl font-bold">Hi Studio</span>
            </div>
            <p className="text-sm text-muted-foreground text-pretty max-w-xs">
              {t.about?.description ||
                "Your wellness journey starts here. Join our community of mindful movement and holistic health."}
            </p>
            <div>
              <h4 className="font-medium mb-3 text-sm">{t.footer?.followUs || "Follow Us"}</h4>
              <SocialMediaLinks />
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base">{t.nav?.contact || "Contact"}</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="text-pretty">{t.footer?.address || "123 Wellness Street, Paris, France"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>{t.footer?.phone || "+33 1 23 45 67 89"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>{t.footer?.email || "hello@histudio.com"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>{t.footer?.hours || "Mon-Sun: 7:00 - 21:00"}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base">{t.footer?.quickLinks || "Quick Links"}</h3>
            <div className="space-y-3 text-sm">
              <Link href="/information" className="block text-muted-foreground hover:text-primary transition-colors">
                {t.nav?.information || "Information"}
              </Link>
              <Link href="/planning" className="block text-muted-foreground hover:text-primary transition-colors">
                {t.nav?.planning || "Planning"}
              </Link>
              <Link href="/pricing" className="block text-muted-foreground hover:text-primary transition-colors">
                {t.nav?.pricing || "Pricing"}
              </Link>
              <Link href="/account" className="block text-muted-foreground hover:text-primary transition-colors">
                {t.nav?.account || "My Account"}
              </Link>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <NewsletterSignup />
          </div>
        </div>

        <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Hi Studio. {t.footer?.rights || "All rights reserved."}</p>
        </div>
      </div>
    </footer>
  )
}
