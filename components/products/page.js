import { Database } from "@/lib/database";
import { AuthenticatedHeader } from "@/components/layout/authenticated-header";
import { ProductsHeader } from "@/components/products/products-header";
import { CategoryNav } from "@/components/products/category-nav";
import { ProductsLayout } from "@/components/products/products-layout";
export default async function ProductsPage({
  searchParams
}) {
  const params = await searchParams;
  const filters = {
    category: params.category,
    brand: params.brand ? [params.brand] : undefined,
    priceRange: params.minPrice || params.maxPrice ? {
      min: Number(params.minPrice) || 0,
      max: Number(params.maxPrice) || 10000
    } : undefined,
    rating: params.rating ? Number(params.rating) : undefined,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder
  };
  const products = await Database.getProducts(filters);
  const categories = ["smartphone", "laptop", "tablet", "smartwatch", "headphones", "camera"];
  return <div className="min-h-screen bg-background">
      <AuthenticatedHeader />
      <div className="container mx-auto px-4 py-8">
        <ProductsHeader />
        <CategoryNav categories={categories} activeCategory={params.category} />
        <ProductsLayout products={products} filters={filters} />
      </div>
    </div>;
}