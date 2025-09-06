import { Database } from "@/lib/database";
import { ProductGrid } from "@/components/product-grid";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthenticatedHeader } from "@/components/layout/authenticated-header";

interface CategoryPageProps {
  params: {
    category: string;
  };
}

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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = params;

  if (!categoryInfo[category as keyof typeof categoryInfo]) {
    notFound();
  }

  const products = await Database.getProducts({ category: category as any });
  const info = categoryInfo[category as keyof typeof categoryInfo];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AuthenticatedHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link href="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              All Products
            </Button>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">{info.title}</span>
        </div>

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{info.title}</h1>
          <p className="text-muted-foreground text-lg">{info.description}</p>
        </div>

        {/* Products Grid */}
        <ProductGrid products={products} />

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No products found in this category.
            </p>
            <Link href="/products">
              <Button>Browse All Products</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
