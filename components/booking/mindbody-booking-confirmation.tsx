"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { mindBodyAPI, type MindBodyClass } from "@/lib/mindbody-api"
import { Calendar, Clock, MapPin, User, CreditCard, ArrowLeft, Check, Loader2 } from "lucide-react"

interface MindBodyBookingConfirmationProps {
  mindBodyClass: MindBodyClass
  onComplete: () => void
  onBack: () => void
}

export function MindBodyBookingConfirmation({ mindBodyClass, onComplete, onBack }: MindBodyBookingConfirmationProps) {
  const { t, language } = useLanguage()
  const { user } = useAuth()
  const [isBooking, setIsBooking] = useState(false)
  const [isBooked, setIsBooked] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleBooking = async () => {
    if (!user) return

    setIsBooking(true)
    setError(null)

    try {
      // First, get or create the client in MindBody
      const mindBodyClient = await mindBodyAPI.getOrCreateClient({
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        mobilePhone: user.phone,
      })

      // Then book the class
      const booking = await mindBodyAPI.bookClass(mindBodyClass.id, mindBodyClient.id, false)

      if (booking) {
        setIsBooked(true)
        // Auto-close after showing success
        setTimeout(() => {
          onComplete()
        }, 2000)
      } else {
        throw new Error("Booking failed")
      }
    } catch (err) {
      setError("Failed to book class through MindBody. Please try again.")
      console.error("MindBody booking error:", err)
    } finally {
      setIsBooking(false)
    }
  }

  const formatDate = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr)
    return date.toLocaleDateString(language === "fr" ? "fr-FR" : language === "es" ? "es-ES" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (isBooked) {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-green-600">Booking Confirmed!</h3>
          <p className="text-muted-foreground">
            Your class has been booked through MindBody. You'll receive a confirmation email shortly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} disabled={isBooking}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h3 className="text-lg font-semibold">Confirm Your MindBody Booking</h3>
      </div>

      {error && (
        <Card className="border-red-200">
          <CardContent className="p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Class Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {mindBodyClass.name}
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">MindBody</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatDate(mindBodyClass.startDateTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {formatTime(mindBodyClass.startDateTime)} - {formatTime(mindBodyClass.endDateTime)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{mindBodyClass.instructor.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{mindBodyClass.location.name}</span>
            </div>
          </div>
          {mindBodyClass.description && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">{mindBodyClass.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details */}
      <Card>
        <CardHeader>
          <CardTitle>Your Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <strong>Name:</strong> {user?.first_name} {user?.last_name}
            </p>
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            {user?.phone && (
              <p>
                <strong>Phone:</strong> {user.phone}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* MindBody Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            MindBody Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              This booking will be processed through MindBody, our integrated scheduling system. You'll receive
              confirmation and can manage your booking through both Hi Studio and MindBody.
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Available Spots:</span>
              <span>
                {mindBodyClass.webCapacity - mindBodyClass.webBooked} of {mindBodyClass.webCapacity}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Booking System:</span>
              <span>MindBody Online</span>
            </div>
            <div className="flex justify-between">
              <span>Class ID:</span>
              <span className="font-mono text-xs">{mindBodyClass.id}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <div className="text-xs text-muted-foreground space-y-2">
        <p>By booking this class, you agree to our terms and conditions:</p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Cancellations must be made at least 2 hours before class time</li>
          <li>Late arrivals (more than 10 minutes) may not be admitted</li>
          <li>Please bring your own water bottle and towel</li>
          <li>This booking is processed through MindBody Online</li>
        </ul>
      </div>

      {/* Book Button */}
      <Button className="w-full" size="lg" onClick={handleBooking} disabled={isBooking || !mindBodyClass.isAvailable}>
        {isBooking ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Booking through MindBody...
          </>
        ) : (
          `Confirm MindBody Booking`
        )}
      </Button>
    </div>
  )
}
