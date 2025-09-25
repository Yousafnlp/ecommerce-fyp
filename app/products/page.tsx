import { Database } from "@/lib/database";
import { AuthenticatedHeader } from "@/components/layout/authenticated-header";
import { ProductsHeader } from "@/components/products/products-header";
import { CategoryNav } from "@/components/products/category-nav";
import { ProductsLayout } from "@/components/products/products-layout";

interface ProductsPageProps {
  searchParams: {
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    rating?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const filters = {
    category: searchParams.category,
    brand: searchParams.brand ? [searchParams.brand] : undefined,
    priceRange:
      searchParams.minPrice || searchParams.maxPrice
        ? {
            min: Number(searchParams.minPrice) || 0,
            max: Number(searchParams.maxPrice) || 10000,
          }
        : undefined,
    rating: searchParams.rating ? Number(searchParams.rating) : undefined,
    sortBy: searchParams.sortBy as any,
    sortOrder: searchParams.sortOrder as any,
  };

  const products = await Database.getProducts(filters);
  const categories = [
    "smartphone",
    "laptop",
    "tablet",
    "smartwatch",
    "headphones",
    "camera",
  ];

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedHeader />
      <div className="container mx-auto px-4 py-8">
        <ProductsHeader />
        <CategoryNav
          categories={categories}
          activeCategory={searchParams.category}
        />
        <ProductsLayout products={products} filters={filters} />
      </div>
    </div>
  );
}
