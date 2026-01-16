"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import type { ClassType } from "@/lib/types"
import { Clock, Users } from "lucide-react"

interface ClassSelectionProps {
  onSelect: (classType: ClassType) => void
}

export function ClassSelection({ onSelect }: ClassSelectionProps) {
  const { t, language } = useLanguage()

  const classes: ClassType[] = [
    {
      id: "1",
      name: "Yoga Flow",
      name_fr: "Yoga Flow",
      name_es: "Yoga Flow",
      description: "Flow through mindful movements and find your inner peace",
      description_fr: "Enchaînez des mouvements conscients et trouvez votre paix intérieure",
      description_es: "Fluye a través de movimientos conscientes y encuentra tu paz interior",
      duration_minutes: 60,
      max_capacity: 12,
      difficulty_level: "intermediate",
      price: 25.0,
      image_url: "/yoga-class-with-people-in-peaceful-poses.jpg",
      equipment_needed: ["yoga mat", "blocks"],
      is_active: true,
    },
    {
      id: "2",
      name: "Pilates Core",
      name_fr: "Pilates Core",
      name_es: "Pilates Core",
      description: "Strengthen your core and improve flexibility with precision",
      description_fr: "Renforcez votre tronc et améliorez votre flexibilité avec précision",
      description_es: "Fortalece tu core y mejora la flexibilidad con precisión",
      duration_minutes: 45,
      max_capacity: 8,
      difficulty_level: "intermediate",
      price: 30.0,
      image_url: "/pilates-class-with-reformer-equipment.jpg",
      equipment_needed: ["pilates mat", "resistance bands"],
      is_active: true,
    },
    {
      id: "3",
      name: "Meditation",
      name_fr: "Méditation",
      name_es: "Meditación",
      description: "Cultivate mindfulness and reduce stress through guided practice",
      description_fr: "Cultivez la pleine conscience et réduisez le stress par la pratique guidée",
      description_es: "Cultiva la atención plena y reduce el estrés a través de la práctica guiada",
      duration_minutes: 30,
      max_capacity: 15,
      difficulty_level: "beginner",
      price: 20.0,
      image_url: "/meditation-room-with-cushions-and-candles.jpg",
      equipment_needed: ["meditation cushion"],
      is_active: true,
    },
    {
      id: "4",
      name: "HIIT Fitness",
      name_fr: "Fitness HIIT",
      name_es: "Fitness HIIT",
      description: "High-energy workouts to boost your strength and endurance",
      description_fr: "Entraînements haute énergie pour booster votre force et endurance",
      description_es: "Entrenamientos de alta energía para aumentar tu fuerza y resistencia",
      duration_minutes: 50,
      max_capacity: 10,
      difficulty_level: "advanced",
      price: 35.0,
      image_url: "/fitness-class-with-weights-and-equipment.jpg",
      equipment_needed: ["dumbbells", "kettlebells"],
      is_active: true,
    },
  ]

  const getLocalizedName = (classType: ClassType) => {
    if (language === "fr" && classType.name_fr) return classType.name_fr
    if (language === "es" && classType.name_es) return classType.name_es
    return classType.name
  }

  const getLocalizedDescription = (classType: ClassType) => {
    if (language === "fr" && classType.description_fr) return classType.description_fr
    if (language === "es" && classType.description_es) return classType.description_es
    return classType.description
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {classes.map((classType) => (
          <Card key={classType.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={classType.image_url || "/placeholder.svg"}
                alt={getLocalizedName(classType)}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {getLocalizedName(classType)}
                <Badge className={getDifficultyColor(classType.difficulty_level)}>{classType.difficulty_level}</Badge>
              </CardTitle>
              <CardDescription>{getLocalizedDescription(classType)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {classType.duration_minutes} min
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {classType.max_capacity} max
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">${classType.price}</span>
                <Button onClick={() => onSelect(classType)}>Select Class</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
