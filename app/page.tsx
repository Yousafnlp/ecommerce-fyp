import CTASection from "@/components/home/CTA-section";
import FeatureProducts from "@/components/home/feature-products";
import HeroSection from "@/components/home/hero-section";
import PopularProducts from "@/components/home/popular-products";
import { AuthenticatedHeader } from "@/components/layout/authenticated-header";
import Footer from "@/components/layout/links-footer";

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedHeader />
      <HeroSection />
      <FeatureProducts />
      <PopularProducts />
      <CTASection />
      <Footer />
    </div>
  );
}
