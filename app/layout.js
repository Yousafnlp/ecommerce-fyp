"use client";
import store from "@/store";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Provider } from "react-redux";
import { AuthBootstrap } from "@/components/root/AuthInit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// export const metadata = {
//   title: "SpecSmart - Smarter Choices. Sharper Tech",
//   description:
//     "Intelligent e-commerce platform for digital electronics with AI-powered product recommendations and advanced search",
//   generator: "v0.app",
// };
export default function RootLayout({ children }) {
  const queryClient = new QueryClient();
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <QueryClientProvider client={queryClient}>
          <AuthBootstrap /> {/* ✅ NOW SAFE */}
          <Provider store={store}>{children}</Provider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
