"use client"

import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/lib/i18n"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star } from "lucide-react"
import { BackButton } from "@/components/ui/back-button"

export default function PricingPage() {
  const { language } = useLanguage()
  const t = translations[language]

  const pricingPlans = [
    {
      name: t.pricing?.single || "Single Class",
      price: "25€",
      description: t.pricing?.singleDesc || "Perfect for trying out our classes",
      features: [
        t.pricing?.features?.access || "Access to all disciplines",
        t.pricing?.features?.booking || "Online booking",
        t.pricing?.features?.cancel || "Free cancellation 2h before",
      ],
      popular: false,
    },
    {
      name: t.pricing?.pack || "5-Class Pack",
      price: "110€",
      originalPrice: "125€",
      description: t.pricing?.packDesc || "Great value for regular practice",
      features: [
        t.pricing?.features?.access || "Access to all disciplines",
        t.pricing?.features?.booking || "Online booking",
        t.pricing?.features?.cancel || "Free cancellation 2h before",
        t.pricing?.features?.validity || "Valid for 2 months",
      ],
      popular: true,
    },
    {
      name: t.pricing?.unlimited || "Unlimited Monthly",
      price: "150€",
      description: t.pricing?.unlimitedDesc || "Unlimited access to all classes",
      features: [
        t.pricing?.features?.unlimited || "Unlimited classes",
        t.pricing?.features?.priority || "Priority booking",
        t.pricing?.features?.guest || "Bring a friend once/month",
        t.pricing?.features?.workshops || "Access to workshops",
      ],
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <BackButton />

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            {t.pricing?.title || "Pricing & Memberships"}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            {t.pricing?.subtitle || "Choose the perfect plan for your wellness journey"}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card key={index} className={`relative border-border ${plan.popular ? "ring-2 ring-primary" : ""}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                  <Star className="w-3 h-3 mr-1" />
                  {t.pricing?.popular || "Most Popular"}
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-bold text-primary">{plan.price}</span>
                    {plan.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">{plan.originalPrice}</span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                  {t.pricing?.choose || "Choose Plan"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto border-border">
            <CardHeader>
              <CardTitle>{t.pricing?.info?.title || "Additional Information"}</CardTitle>
            </CardHeader>
            <CardContent className="text-left space-y-2">
              <p className="text-sm text-muted-foreground">
                • {t.pricing?.info?.firstTime || "First-time visitors get 20% off their first class"}
              </p>
              <p className="text-sm text-muted-foreground">
                • {t.pricing?.info?.student || "Student discount available with valid ID"}
              </p>
              <p className="text-sm text-muted-foreground">
                • {t.pricing?.info?.corporate || "Corporate packages available for groups of 5+"}
              </p>
              <p className="text-sm text-muted-foreground">
                • {t.pricing?.info?.freeze || "Membership freeze options available"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
