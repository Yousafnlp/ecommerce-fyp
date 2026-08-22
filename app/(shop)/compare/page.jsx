import { Suspense } from "react";
import { ComparePageContent } from "@/components/compare/compare-page-content";

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <ComparePageContent />
    </Suspense>
  );
}
