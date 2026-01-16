"use client"

import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/lib/i18n"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BackButton } from "@/components/ui/back-button"
import { Clock, Users, Award, Heart } from "lucide-react"

export default function InformationPage() {
  const { language } = useLanguage()
  const t = translations[language]

  const disciplines = [
    {
      name: "Pilates",
      description: t.disciplines?.pilates || "Strengthen your core and improve flexibility",
      duration: "50 min",
      capacity: "12",
      level: t.levels?.all || "All levels",
    },
    {
      name: "Yoga",
      description: t.disciplines?.yoga || "Find balance and inner peace",
      duration: "60 min",
      capacity: "15",
      level: t.levels?.beginner || "Beginner to Advanced",
    },
    {
      name: "Barre",
      description: t.disciplines?.barre || "Ballet-inspired fitness workout",
      duration: "45 min",
      capacity: "10",
      level: t.levels?.intermediate || "Intermediate",
    },
  ]

  const coaches = [
    {
      name: "Sarah Martinez",
      specialty: "Pilates & Yoga",
      experience: "8 years",
      bio: t.coaches?.sarah || "Certified instructor with expertise in rehabilitation",
    },
    {
      name: "Emma Thompson",
      specialty: "Barre & Dance",
      experience: "6 years",
      bio: t.coaches?.emma || "Former professional dancer and fitness enthusiast",
    },
    {
      name: "Lucas Dubois",
      specialty: "Yoga & Meditation",
      experience: "10 years",
      bio: t.coaches?.lucas || "Mindfulness expert and certified yoga instructor",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <BackButton href="/" />

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            {t.information?.title || "About Hi Studio"}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            {t.information?.subtitle ||
              "Discover our disciplines, meet our expert coaches, and learn about our wellness philosophy"}
          </p>
        </div>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            {t.information?.disciplines || "Our Disciplines"}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {disciplines.map((discipline, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-primary">{discipline.name}</CardTitle>
                  <CardDescription>{discipline.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {discipline.duration}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {discipline.capacity} max
                    </Badge>
                    <Badge variant="outline">{discipline.level}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            {t.information?.coaches || "Meet Our Coaches"}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {coaches.map((coach, index) => (
              <Card key={index} className="border-border">
                <CardHeader>
                  <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Heart className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-center">{coach.name}</CardTitle>
                  <CardDescription className="text-center">{coach.specialty}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit mx-auto">
                      <Award className="w-3 h-3" />
                      {coach.experience}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">{coach.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
