import { Zap } from "lucide-react";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="py-12 px-4 border-t bg-card/50">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold">SpecSmart</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Smarter Choices. Sharper Tech.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Products</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/products/smartphone"
                  className="hover:text-foreground"
                >
                  Smartphones
                </Link>
              </li>
              <li>
                <Link href="/products/laptop" className="hover:text-foreground">
                  Laptops
                </Link>
              </li>
              <li>
                <Link
                  href="/products/headphones"
                  className="hover:text-foreground"
                >
                  Headphones
                </Link>
              </li>
              <li>
                <Link href="/products/camera" className="hover:text-foreground">
                  Cameras
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {/* <li>
                  <Link href="/compare" className="hover:text-foreground">
                    Product Compare
                  </Link>
                </li> */}
              <li>
                <Link href="/search" className="hover:text-foreground">
                  Advanced Search
                </Link>
              </li>
              <li>
                <Link href="/advisor" className="hover:text-foreground">
                  AI Advisor
                </Link>
              </li>
              <li>
                <Link href="/scores" className="hover:text-foreground">
                  Smart Scoring
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/help" className="hover:text-foreground">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 SpecSmart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
