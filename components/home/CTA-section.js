import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
const CTASection = () => {
  return <section className="relative py-20 px-4 overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-brand opacity-[0.07]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--color-background)_70%)]" />
      <div className="relative container mx-auto text-center max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Make <span className="text-gradient">Smarter Tech Choices?</span>
        </h2>
        <p className="text-xl text-muted-foreground mb-8">
          Join thousands of users who trust SpecSmart for their tech purchases
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products">
            <Button size="lg" className="text-lg px-8 shine">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    </section>;
};
export default CTASection;