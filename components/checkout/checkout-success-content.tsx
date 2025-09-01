"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Package } from "lucide-react"

export function CheckoutSuccessContent() {
  const orderNumber = "SS" + Math.random().toString(36).substr(2, 9).toUpperCase()
  const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for your purchase. Your order has been confirmed and is being processed.
        </p>

        {/* Order Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>Order #{orderNumber}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center p-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Processing</h3>
                <p className="text-sm text-muted-foreground">Your order is being prepared</p>
              </div>\
