"use client";

import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Provider } from "react-redux";
import store from "@/store";
import Script from "next/script";
import { AuthBootstrap } from "@/components/root/auth-init";
import ChatBot from "@/components/chatbot/chat-bot";
import { CompareBar } from "@/components/compare/compare-bar";
import { CompareHydration } from "@/components/compare/compare-hydration";
import { ToastProvider } from "@/components/ui/toast";
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Provider store={store}>
          <ToastProvider>
            <AuthBootstrap />
            <CompareHydration />
            {children}
            <ChatBot />
            <CompareBar />
          </ToastProvider>
        </Provider>
        <Analytics />
      </body>
    </html>
  );
}
