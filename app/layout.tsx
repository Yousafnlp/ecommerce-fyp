import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import { CartProvider } from "@/lib/cart-context"

export const metadata: Metadata = {
  title: "SpecSmart - Smarter Choices. Sharper Tech",
  description:
    "Intelligent e-commerce platform for digital electronics with AI-powered product recommendations and advanced search",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
          <CartProvider>
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
