import { CheckoutPageContent } from "@/components/checkout/checkout-page-content";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutPageContent />
    </ProtectedRoute>
  );
}