"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import type { ClassInstance } from "@/lib/types"
import type { ApiError } from "@/lib/api-client"
import { Calendar, Clock, MapPin, User, CreditCard, ArrowLeft, Check } from "lucide-react"

interface BookingConfirmationProps {
  classInstance: ClassInstance
  onComplete: () => void
  onBack: () => void
}

export function BookingConfirmation({ classInstance, onComplete, onBack }: BookingConfirmationProps) {
  const { t, language } = useLanguage()
  const { user } = useAuth()
  const [isBooking, setIsBooking] = useState(false)
  const [isBooked, setIsBooked] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)

  const handleBooking = async () => {
    if (!user?.id) {
      setBookingError('Please log in to make a booking')
      return
    }

    try {
      setIsBooking(true)
      setBookingError(null)

      const response = await apiClient.createBooking({
        class_instance_id: classInstance.id,
        payment_method: 'card',
        special_requests: ''
      })

      if (response.success) {
        setIsBooked(true)
        // Auto-close after showing success
        setTimeout(() => {
          onComplete()
        }, 3000)
      } else {
        throw new Error(response.message || 'Failed to create booking')
      }
    } catch (err) {
      const errorMessage = (err as ApiError).message || 'Failed to create booking. Please try again.'
      setBookingError(errorMessage)
      console.error('Booking error:', err)
    } finally {
      setIsBooking(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(language === "fr" ? "fr-FR" : language === "es" ? "es-ES" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getLocalizedName = (classType: any) => {
    if (language === "fr" && classType.name_fr) return classType.name_fr
    if (language === "es" && classType.name_es) return classType.name_es
    return classType.name
  }

  if (isBooked) {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-green-600">Booking Confirmed!</h3>
          <p className="text-muted-foreground">You'll receive a confirmation email shortly with all the details.</p>
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
        <h3 className="text-lg font-semibold">Confirm Your Booking</h3>
      </div>

      {bookingError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{bookingError}</p>
        </div>
      )}

      {/* Class Details */}
      <Card>
        <CardHeader>
          <CardTitle>{getLocalizedName(classInstance.class_type)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatDate(classInstance.class_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {classInstance.start_time} - {classInstance.end_time}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{classInstance.instructor_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{classInstance.room_name}</span>
            </div>
          </div>
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

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>Class Fee</span>
            <span>${classInstance.class_type.price}</span>
          </div>
          <div className="flex justify-between">
            <span>Booking Fee</span>
            <span>$2.00</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${(classInstance.class_type.price + 2).toFixed(2)}</span>
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
        </ul>
      </div>

      {/* Book Button */}
      <Button className="w-full" size="lg" onClick={handleBooking} disabled={isBooking}>
        {isBooking ? "Processing..." : `Confirm Booking - $${(classInstance.class_type.price + 2).toFixed(2)}`}
      </Button>
    </div>
  )
}
