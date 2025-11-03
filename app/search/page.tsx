import { Database } from "@/lib/database";
import type { Product, SearchFilters } from "@/lib/types";
import { AdvancedSearchInterface } from "@/components/search/advanced-search-interface";
import { SearchResults } from "@/components/search/search-results";
import { AuthenticatedHeader } from "@/components/layout/authenticated-header";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    rating?: string;
    features?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";

  // Build search filters from URL params
  const filters: SearchFilters = {
    category: params.category,
    brand: params.brand ? [params.brand] : undefined,
    priceRange:
      params.minPrice || params.maxPrice
        ? {
            min: Number(params.minPrice) || 0,
            max: Number(params.maxPrice) || 10000,
          }
        : undefined,
    rating: params.rating ? Number(params.rating) : undefined,
    sortBy: params.sortBy as SearchFilters["sortBy"],
    sortOrder: params.sortOrder as SearchFilters["sortOrder"],
  };

  // Get search results
  let products: Product[] = [];
  if (query) {
    products = await Database.searchProducts(query);
    // Apply additional filters
    if (
      filters.category ||
      filters.brand ||
      filters.priceRange ||
      filters.rating
    ) {
      const filteredProducts = await Database.getProducts(filters);
      products = products.filter((p) =>
        filteredProducts.some((fp) => fp.id === p.id)
      );
    }
  } else if (Object.values(filters).some((f) => f !== undefined)) {
    products = await Database.getProducts(filters);
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Advanced Search</h1>
          <p className="text-muted-foreground">
            Use voice search, natural language queries, and advanced filters to
            find your perfect tech
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Search Interface */}
          <div className="lg:col-span-1">
            <AdvancedSearchInterface
              initialQuery={query}
              initialFilters={filters}
            />
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            <SearchResults
              products={products}
              query={query}
              totalResults={products.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
