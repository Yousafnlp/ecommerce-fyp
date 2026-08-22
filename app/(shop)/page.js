import CTASection from "@/components/home/cta-section";
import FeatureProducts from "@/components/home/feature-products";
import HeroSection from "@/components/home/hero-section";
import PopularProducts from "@/components/home/popular-products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return (
    <>
      <HeroSection />
      <FeatureProducts />
      <PopularProducts />
      <CTASection />
    </>
  );
}