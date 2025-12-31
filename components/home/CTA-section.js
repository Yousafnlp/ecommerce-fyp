import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
const CTASection = () => {
  return <section className="py-20 px-4 bg-primary text-primary-foreground">
      <div className="container mx-auto text-center max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Make Smarter Tech Choices?
        </h2>
        <p className="text-xl opacity-90 mb-8">
          Join thousands of users who trust SpecSmart for their tech purchases
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Browse Products
            </Button>
          </Link>
          <Link href="/advisor">
            <Button size="lg" variant="outline" className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent">
              Try AI Advisor
            </Button>
          </Link>
        </div>
      </div>
    </section>;
};
export default CTASection;