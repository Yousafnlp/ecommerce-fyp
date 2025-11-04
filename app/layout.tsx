import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Suspense } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import Script from "next/script";

export const metadata: Metadata = {
  title: "SpecSmart - Smarter Choices. Sharper Tech",
  description:
    "Intelligent e-commerce platform for digital electronics with AI-powered product recommendations and advanced search",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <CartProvider>
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          </CartProvider>
        </AuthProvider>
        <Analytics />

        {/* This script runs before React hydration */}
        <Script id="theme-loader" strategy="beforeInteractive">
          {`
          try {
            const theme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isDark = theme === 'dark' || (!theme && prefersDark);
            if (isDark) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          } catch (_) {}
        `}
        </Script>
      </body>
    </html>
  );
}
