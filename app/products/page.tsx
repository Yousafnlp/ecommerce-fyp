import { Database } from "@/lib/database";
import { ProductGrid } from "@/components/product-grid";
import { ProductFilters } from "@/components/product-filters";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import Link from "next/link";

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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">All Products</h1>
          <p className="text-muted-foreground">
            Discover the latest tech with intelligent scoring and comparisons
          </p>
        </div>

        {/* Category Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Link href="/products">
              <Button
                variant={!searchParams.category ? "default" : "outline"}
                size="sm"
              >
                All Categories
              </Button>
            </Link>
            {categories.map((category) => (
              <Link key={category} href={`/products?category=${category}`}>
                <Button
                  variant={
                    searchParams.category === category ? "default" : "outline"
                  }
                  size="sm"
                  className="capitalize"
                >
                  {category}s
                </Button>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4" />
                <h2 className="font-semibold">Filters</h2>
              </div>
              <ProductFilters currentFilters={filters} />
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {products.length} products
              </p>

              <div className="flex items-center gap-2">
                <Link href="/search">
                  <Button variant="outline" size="sm">
                    <Search className="w-4 h-4 mr-2" />
                    Advanced Search
                  </Button>
                </Link>
                {/* <Link href="/compare">
                  <Button variant="outline" size="sm">
                    Compare Products
                  </Button>
                </Link> */}
              </div>
            </div>

            <ProductGrid products={products} />
          </main>
        </div>
      </div>
    </div>
  );
}
