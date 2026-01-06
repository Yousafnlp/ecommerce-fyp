import { Database } from "@/lib/database";
import { AdvancedSearchInterface } from "@/components/search/advanced-search-interface";
import { SearchResults } from "@/components/search/search-results";
import { AuthenticatedHeader } from "@/components/layout/authenticated-header";
import { mapNaturalQueryToFilters, parseNaturalLanguageQuery } from "@/lib/search-utils";
export default async function SearchPage({
  searchParams
}) {
  const params = await searchParams;
  const query = params.q || "";

  // Build search filters from URL params
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

  // Get search results
  let products = [];
  if (query) {
    const nlpFilters = parseNaturalLanguageQuery(query);
    const {
      sortBy,
      sortOrder,
      matchedNames,
      ...otherNlpFilters
    } = nlpFilters;
    const mappedFilters = mapNaturalQueryToFilters(otherNlpFilters);
    products = await Database.getProducts(mappedFilters);
    if (matchedNames?.length) {
      products = await Database.rankByNames(products, matchedNames.map(n => n.toLowerCase()));
    }
    if (filters.sortBy) {
      products = Database.sortProductsLocal(products, filters.sortBy, filters.sortOrder);
    } else {
      products = await Database.sortByRelevance(products, query);
    }

    // Apply additional f ilters from ui
    if (filters.category || filters.brand || filters.priceRange || filters.rating || filters.sortBy) {
      products = Database.filterProductsLocal(products, filters);
    }
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