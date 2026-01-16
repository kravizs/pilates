"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import { Mail, Check } from "lucide-react"

export function NewsletterSignup() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubscribed(true)
    setIsLoading(false)
    setEmail("")
  }

  if (isSubscribed) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center space-y-2">
            <Check className="w-8 h-8 text-primary mx-auto" />
            <p className="font-medium text-primary">{t.newsletter?.success || "Thank you for subscribing!"}</p>
            <p className="text-sm text-muted-foreground">
              {t.newsletter?.successMessage || "You'll receive our latest updates and wellness tips."}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>{t.newsletter?.title || "Stay Updated"}</CardTitle>
        <CardDescription>
          {t.newsletter?.description || "Get the latest wellness tips and class updates delivered to your inbox"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder={t.newsletter?.placeholder || "Enter your email"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t.newsletter?.subscribing || "Subscribing..." : t.newsletter?.subscribe || "Subscribe"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
