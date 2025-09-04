import { Database } from "@/lib/database";
import { ProductGrid } from "@/components/product-grid";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

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
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  S
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">SpecSmart</h1>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/products"
                className="text-sm font-medium text-primary"
              >
                Products
              </Link>
              {/* <Link href="/compare" className="text-sm font-medium hover:text-primary transition-colors">
                Compare
              </Link> */}
              <Link
                href="/search"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Search
              </Link>
              <Link
                href="/advisor"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                AI Advisor
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
              <Button size="sm">Cart (0)</Button>
            </div>
          </div>
        </div>
      </header>

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
