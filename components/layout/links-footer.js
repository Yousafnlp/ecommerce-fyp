import { Zap } from "lucide-react";
import Link from "next/link";
import React from "react";
const Footer = () => {
  return <footer className="relative py-14 px-4 border-t border-border/60 bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-brand opacity-40" />
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-gradient-brand rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">SpecSmart</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Smarter Choices. Sharper Tech.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-foreground">Products</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/products/smartphone" className="hover:text-primary transition-colors">
                  Smartphones
                </Link>
              </li>
              <li>
                <Link href="/products/laptop" className="hover:text-primary transition-colors">
                  Laptops
                </Link>
              </li>
              <li>
                <Link href="/products/headphones" className="hover:text-primary transition-colors">
                  Headphones
                </Link>
              </li>
              <li>
                <Link href="/products/camera" className="hover:text-primary transition-colors">
                  Cameras
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-foreground">Features</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/search" className="hover:text-primary transition-colors">
                  Advanced Search
                </Link>
              </li>
              <li>
                <Link href="/advisor" className="hover:text-primary transition-colors">
                  AI Advisor
                </Link>
              </li>
              <li>
                <Link href="/scores" className="hover:text-primary transition-colors">
                  Smart Scoring
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-foreground">Support</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/help" className="hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/60 mt-10 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 SpecSmart. All rights reserved.</p>
        </div>
      </div>
    </footer>;
};
export default Footer;