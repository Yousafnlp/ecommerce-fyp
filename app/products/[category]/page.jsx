import { Database } from "@/lib/database";
import { notFound } from "next/navigation";
import { AuthenticatedHeader } from "@/components/layout/authenticated-header";
import { CategoryHeader } from "@/components/products/category/category-header";
import { CategoryBreadcrumb } from "@/components/products/category/category-breadcrums";
import { CategoryProducts } from "@/components/products/category/category-products";


const categoryInfo = {
  smartphone: {
    title: "Smartphones",
    description:
      "Latest smartphones with cutting-edge features and performance",
  },
  laptop: {
    title: "Laptops",
    description: "Powerful laptops for work, gaming, and creative projects",
  },
  tablet: {
    title: "Tablets",
    description: "Versatile tablets for productivity and entertainment",
  },
  smartwatch: {
    title: "Smartwatches",
    description: "Smart wearables to track fitness and stay connected",
  },
  headphones: {
    title: "Headphones",
    description: "Premium audio devices for music lovers and professionals",
  },
  camera: {
    title: "Cameras",
    description: "Professional cameras for photography and videography",
  },
};

export default async function CategoryPage({ params }) {
  const { category } = await params;

  if (!categoryInfo[category as keyof typeof categoryInfo]) {
    notFound();
  }

  const products = await Database.getProducts({ category });
  const info = categoryInfo[category as keyof typeof categoryInfo];

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedHeader />

      <div className="container mx-auto px-4 py-8">
        <CategoryBreadcrumb title={info.title} />
        <CategoryHeader title={info.title} description={info.description} />
        <CategoryProducts products={products} />
      </div>
    </div>
  );
}
