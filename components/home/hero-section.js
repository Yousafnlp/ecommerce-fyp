import { Headphones, Search, Zap } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import FeatureHighlights from "./feature-highlights";
const HeroSection = () => {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Ambient gradient blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[52rem] h-[28rem] rounded-full bg-gradient-brand-soft blur-3xl animate-float-slow"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-24 -left-24 w-72 h-72 rounded-full bg-[oklch(0.66_0.2_285/0.14)] blur-3xl animate-float"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-10 -right-20 w-80 h-80 rounded-full bg-[oklch(0.75_0.12_205/0.12)] blur-3xl animate-float-slow"
      />

      <div className="container relative mx-auto text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 bg-gradient-brand-soft text-primary dark:text-primary-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-ring/20 backdrop-blur animate-fade-in">
          <Zap className="w-4 h-4" />
          AI-Powered Product Intelligence
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6 animate-fade-up">
          Find Your Perfect
          <span className="text-gradient"> Tech Match</span>
        </h1>

        <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "100ms" }}>
          Compare specs, get AI recommendations, and make smarter tech purchases
          with our intelligent product scoring system.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <Link href="/products">
            <Button size="lg" className="text-lg px-8 shine">
              <Search className="w-5 h-5 mr-2" />
              Start Shopping
            </Button>
          </Link>
        </div>

        <FeatureHighlights />
      </div>
    </section>
  );
};
export default HeroSection;