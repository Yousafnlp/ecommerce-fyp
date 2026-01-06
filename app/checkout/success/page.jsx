import { CheckoutSuccessContent } from "@/components/checkout/checkout-success-content";
import { AuthenticatedHeader } from "@/components/layout/authenticated-header";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedHeader />
      <CheckoutSuccessContent />
    </div>
  );
}
