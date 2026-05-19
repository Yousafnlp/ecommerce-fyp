import { Database } from "@/lib/database";
import { AdvancedSearchInterface } from "@/components/search/advanced-search-interface";
import { SearchResults } from "@/components/search/search-results";
import { AuthenticatedHeader } from "@/components/layout/authenticated-header";
export default async function SearchPage({
  searchParams
}) {
  const params = await searchParams;
  const query = params.q || "";

  // Build search filters from URL params
  const hasMinPrice = params.minPrice !== undefined;
  const hasMaxPrice = params.maxPrice !== undefined;
  const filters = {
    category: params.category,
    brand: params.brand ? [params.brand] : undefined,
    priceRange: hasMinPrice || hasMaxPrice ? {
      min: hasMinPrice ? Number(params.minPrice) : undefined,
      max: hasMaxPrice ? Number(params.maxPrice) : undefined
    } : undefined,
    rating: params.rating ? Number(params.rating) : undefined,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder
  };

  // Get search results
  let products = [];
  if (query) {
    products = await Database.searchProductsAdvanced(query, filters);
  }
  return <div className="min-h-screen bg-background">
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
            <AdvancedSearchInterface initialQuery={query} initialFilters={filters} />
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            <SearchResults products={products} query={query} totalResults={products.length} />
          </div>
        </div>
      </div>
    </div>;
}
