import { parseNaturalLanguageQuery } from "../utils/search/parseNaturalLanguageQuery.js";
import { applyProductFilters, mergeSearchFilters } from "../utils/search/filters.js";
import { isSupportedSort, sortProducts } from "../utils/search/sort.js";
import { sortByRelevance } from "../utils/search/relevance.js";

export function searchProductsPipeline(products, query, uiFilters = {}) {
  const nlpFilters = parseNaturalLanguageQuery(query);
  const filters = mergeSearchFilters(nlpFilters, uiFilters);

  const filteredProducts = applyProductFilters(products, filters);

  const hasExplicitSort = Boolean(filters.sortBy && isSupportedSort(filters.sortBy));
  const rankedProducts = hasExplicitSort
    ? sortProducts(filteredProducts, filters.sortBy, filters.sortOrder)
    : sortByRelevance(filteredProducts, query, filters);

  return {
    products: rankedProducts.map(({ _nameMatchScore, _relevanceScore, ...product }) => product),
    filters,
    parsedQuery: nlpFilters,
  };
}
