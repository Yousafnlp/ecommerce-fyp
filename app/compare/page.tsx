import { Database } from "@/lib/database";
import { ComparisonTable } from "@/components/comparison-table";
import { AuthenticatedHeader } from "@/components/layout/authenticated-header";
import { EmptyCompareCard } from "@/components/compare/EmptyCompareCard";
import { CompareBreadcrumb } from "@/components/compare/compare-breadcrum";
import { ComparePageHeader } from "@/components/compare/compare-page-header";

interface ComparePageProps {
  searchParams: {
    products?: string;
  };
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const productIds = searchParams.products?.split(",") ?? [];
  const [products, allProducts] = await Promise.all([
    productIds.length > 0 ? Database.getComparisonProducts(productIds) : [],
    Database.getProducts(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedHeader />
      <div className="container mx-auto px-4 py-8">
        <CompareBreadcrumb />
        <ComparePageHeader />

        {products.length === 0 ? (
          <EmptyCompareCard products={allProducts} />
        ) : (
          <ComparisonTable products={products} />
        )}
      </div>
    </div>
  );
}
