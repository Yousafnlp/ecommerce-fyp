import { Headphones, Search, Zap } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import FeatureHighlights from "./feature-highlights";
const HeroSection = () => {
  return <section className="py-20 px-4">
      <div className="container mx-auto text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6">
          <Zap className="w-4 h-4" />
          AI-Powered Product Intelligence
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
          Find Your Perfect
          <span className="text-primary"> Tech Match</span>
        </h1>

        <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto">
          Compare specs, get AI recommendations, and make smarter tech purchases
          with our intelligent product scoring system.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/products">
            <Button size="lg" className="text-lg px-8">
              <Search className="w-5 h-5 mr-2" />
              Start Shopping
            </Button>
          </Link>
        </div>

        <FeatureHighlights />
      </div>
    </section>;
};
export default HeroSection;