import { Database } from "@/lib/database";
import { ProductsHeader } from "@/components/products/products-header";
import { CategoryNav } from "@/components/products/category-nav";
import { ProductsLayout } from "@/components/products/products-layout";
import { categories } from "@/config/categories";
import { getSortValue, getSortParams } from "@/config/sorting";

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const sort = getSortParams(getSortValue(params.sortBy, params.sortOrder));
  const filters = {
    category: params.category,
    brand: params.brand ? [params.brand] : undefined,
    features: params.features ? params.features.split(",") : undefined,
    priceRange:
      params.minPrice || params.maxPrice
        ? {
            min: Number(params.minPrice) || 0,
            max: Number(params.maxPrice) || 10000,
          }
        : undefined,
    rating: params.rating ? Number(params.rating) : undefined,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
  };

  const products = await Database.getProducts(filters);

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductsHeader />
      <CategoryNav categories={categories} activeCategory={params.category} />
      <ProductsLayout products={products} filters={filters} />
    </div>
  );
}