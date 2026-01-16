"use client"

import { Button } from "@/components/ui/button"
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react"

export function SocialMediaLinks() {
  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com/histudio", label: "Instagram" },
    { icon: Facebook, href: "https://facebook.com/histudio", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com/histudio", label: "Twitter" },
    { icon: Youtube, href: "https://youtube.com/histudio", label: "YouTube" },
  ]

  return (
    <div className="flex items-center gap-2">
      {socialLinks.map(({ icon: Icon, href, label }) => (
        <Button key={label} variant="ghost" size="sm" asChild className="hover:text-primary">
          <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
            <Icon className="w-4 h-4" />
          </a>
        </Button>
      ))}
    </div>
  )
}
