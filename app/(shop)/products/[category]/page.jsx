import { Database } from "@/lib/database";
import { notFound } from "next/navigation";
import { CategoryHeader } from "@/components/products/category-header";
import { CategoryBreadcrumb } from "@/components/products/category-breadcrumbs";
import { CategoryProducts } from "@/components/products/category-products";
import { categoryInfo } from "@/config/categories";

export default async function CategoryPage({ params }) {
  const { category } = await params;

  if (!categoryInfo[category]) {
    notFound();
  }

  const products = await Database.getProducts({ category });
  const info = categoryInfo[category];

  return (
    <div className="container mx-auto px-4 py-8">
      <CategoryBreadcrumb title={info.title} />
      <CategoryHeader title={info.title} description={info.description} />
      <CategoryProducts products={products} />
    </div>
  );
}