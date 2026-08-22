import { AuthenticatedHeader } from "@/components/layout/authenticated-header";
import Footer from "@/components/layout/links-footer";

export default function ShopLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedHeader />
      {children}
      <Footer />
    </div>
  );
}