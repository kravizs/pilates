"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { mindBodyAPI, type MindBodyClass } from "@/lib/mindbody-api"
import type { ClassType } from "@/lib/types"
import { Clock, ArrowLeft, Loader2 } from "lucide-react"

interface MindBodyTimeSlotSelectionProps {
  classType: ClassType
  onSelect: (mindBodyClass: MindBodyClass) => void
  onBack: () => void
}

export function MindBodyTimeSlotSelection({ classType, onSelect, onBack }: MindBodyTimeSlotSelectionProps) {
  const { t, language } = useLanguage()
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [mindBodyClasses, setMindBodyClasses] = useState<MindBodyClass[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMindBodyClasses()
  }, [])

  const loadMindBodyClasses = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const today = new Date()
      const endDate = new Date(today)
      endDate.setDate(today.getDate() + 7)

      const startDateStr = today.toISOString().split("T")[0]
      const endDateStr = endDate.toISOString().split("T")[0]

      const classes = await mindBodyAPI.getClasses(startDateStr, endDateStr)

      // Filter classes that match our class type (by name similarity)
      const filteredClasses = classes.filter(
        (mbClass) =>
          mbClass.name.toLowerCase().includes(classType.name.toLowerCase()) ||
          classType.name.toLowerCase().includes(mbClass.name.toLowerCase()),
      )

      setMindBodyClasses(filteredClasses)
    } catch (err) {
      setError("Failed to load available time slots from MindBody")
      console.error("MindBody classes loading error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const dates = [...new Set(mindBodyClasses.map((cls) => cls.startDate))]

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(language === "fr" ? "fr-FR" : language === "es" ? "es-ES" : "en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getAvailabilityStatus = (mbClass: MindBodyClass) => {
    const available = mbClass.webCapacity - mbClass.webBooked
    if (available === 0) return { status: "full", color: "bg-red-100 text-red-800" }
    if (available <= 2) return { status: "limited", color: "bg-yellow-100 text-yellow-800" }
    return { status: "available", color: "bg-green-100 text-green-800" }
  }

  const getLocalizedName = (classType: ClassType) => {
    if (language === "fr" && classType.name_fr) return classType.name_fr
    if (language === "es" && classType.name_es) return classType.name_es
    return classType.name
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h3 className="text-lg font-semibold">{getLocalizedName(classType)}</h3>
            <p className="text-sm text-muted-foreground">Loading MindBody schedule...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h3 className="text-lg font-semibold">{getLocalizedName(classType)}</h3>
            <p className="text-sm text-muted-foreground">MindBody Integration</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadMindBodyClasses}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h3 className="text-lg font-semibold">{getLocalizedName(classType)}</h3>
          <p className="text-sm text-muted-foreground">
            ${classType.price} • {classType.duration_minutes} min • Powered by MindBody
          </p>
        </div>
      </div>

      {/* Date Selection */}
      <div className="space-y-4">
        <h4 className="font-medium">Select Date</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {dates.map((date) => (
            <Button
              key={date}
              variant={selectedDate === date ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDate(date)}
              className="text-xs"
            >
              {formatDate(date)}
            </Button>
          ))}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="space-y-4">
          <h4 className="font-medium">Available Times (MindBody)</h4>
          <div className="grid gap-3">
            {mindBodyClasses
              .filter((mbClass) => mbClass.startDate === selectedDate)
              .map((mbClass) => {
                const availability = getAvailabilityStatus(mbClass)
                const spotsLeft = mbClass.webCapacity - mbClass.webBooked

                return (
                  <Card key={mbClass.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">
                              {formatTime(mbClass.startDateTime)} - {formatTime(mbClass.endDateTime)}
                            </span>
                            <Badge className={availability.color}>
                              {spotsLeft === 0 ? "Full" : `${spotsLeft} spots left`}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              MindBody
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Instructor: {mbClass.instructor.name}</span>
                            <span>Room: {mbClass.location.name}</span>
                          </div>
                          {mbClass.description && (
                            <p className="text-xs text-muted-foreground">{mbClass.description}</p>
                          )}
                        </div>
                        <Button onClick={() => onSelect(mbClass)} disabled={spotsLeft === 0 || !mbClass.isAvailable}>
                          {spotsLeft === 0 ? "Full" : "Book Now"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </div>
      )}

      {mindBodyClasses.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No classes found in MindBody for this class type.</p>
            <Button className="mt-4" onClick={loadMindBodyClasses}>
              Refresh
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
