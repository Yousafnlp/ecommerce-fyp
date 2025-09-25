import { CheckoutPageContent } from "@/components/checkout/checkout-page-content";
import { AuthenticatedHeader } from "@/components/layout/authenticated-header";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <AuthenticatedHeader />
        <CheckoutPageContent />
      </div>
    </ProtectedRoute>
  );
}
