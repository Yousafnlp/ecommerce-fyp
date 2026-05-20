"use client";

import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Suspense } from "react";
import { Provider } from "react-redux";
import store from "@/store";
import Script from "next/script";
import { AuthBootstrap } from "@/components/root/AuthInit";
import ChatBot from "@/components/chatbot/ChatBot";
import { CompareProvider } from "@/lib/compare-context";
import { CompareBar } from "@/components/compare/CompareBar";
// export const metadata = {
//   title: "SpecSmart - Smarter Choices. Sharper Tech",
//   description:
//     "Intelligent e-commerce platform for digital electronics with AI-powered product recommendations and advanced search",
//   generator: "v0.app",
// };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Provider store={store}>
          <CompareProvider>
            <AuthBootstrap />
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
            <ChatBot />
            <CompareBar />
          </CompareProvider>
        </Provider>
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
