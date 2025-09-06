import { CartPageContent } from "@/components/cart/cart-page-content";
import { AuthenticatedHeader } from "@/components/layout/authenticated-header";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedHeader />
      <CartPageContent />
    </div>
  );
}
