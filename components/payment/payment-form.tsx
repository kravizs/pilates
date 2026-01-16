"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useLanguage } from "@/contexts/language-context"
import { CreditCard, Lock, Check } from "lucide-react"

interface PaymentFormProps {
  amount: number
  description: string
  onSuccess: () => void
  onCancel: () => void
}

export function PaymentForm({ amount, description, onSuccess, onCancel }: PaymentFormProps) {
  const { t } = useLanguage()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsProcessing(false)
    onSuccess()
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          {t.payment?.title || "Secure Payment"}
        </CardTitle>
        <CardDescription>
          {description} - €{amount}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Method Selection */}
          <div className="space-y-2">
            <Label>{t.payment?.method || "Payment Method"}</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={paymentMethod === "card" ? "default" : "outline"}
                onClick={() => setPaymentMethod("card")}
                className="flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                {t.payment?.card || "Card"}
              </Button>
              <Button
                type="button"
                variant={paymentMethod === "paypal" ? "default" : "outline"}
                onClick={() => setPaymentMethod("paypal")}
              >
                PayPal
              </Button>
            </div>
          </div>

          {paymentMethod === "card" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="cardNumber">{t.payment?.cardNumber || "Card Number"}</Label>
                <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">{t.payment?.expiry || "MM/YY"}</Label>
                  <Input id="expiry" placeholder="12/25" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="123" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">{t.payment?.cardName || "Cardholder Name"}</Label>
                <Input id="name" placeholder="John Doe" required />
              </div>
            </>
          )}

          <Separator />

          <div className="flex justify-between items-center">
            <span className="font-semibold">
              {t.payment?.total || "Total"}: €{amount}
            </span>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
              {t.payment?.cancel || "Cancel"}
            </Button>
            <Button type="submit" disabled={isProcessing} className="flex-1">
              {isProcessing ? (
                t.payment?.processing || "Processing..."
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {t.payment?.pay || "Pay"} €{amount}
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {t.payment?.secure || "Your payment information is secure and encrypted"}
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
