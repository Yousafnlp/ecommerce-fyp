"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "../api-client";

// import { useQuery } from "@tanstack/react-query";
// import {
//   useGetFeaturedProducts as useGetFeaturedProductsFromApi,
//   useGetPopularProducts as useGetPopularProductsFromApi,
//   useSearchProducts as useSearchProductsFromApi,
//   useGetProducts as useGetProductsFromApi,
//   useGetProductById as useGetProductByIdFromApi,
//   useGetProductsByIds as useGetProductsByIdsFromApi,
//   useGetProductsByCategory as useGetProductsByCategoryFromApi,
//   queryKeys,
// } from "@/utils/api-client";
// import {
//   rankByNames,
//   sortByRelevance,
//   filterProductsLocal,
//   sortProductsLocal,
//   calculateProductScore,
//   getUniqueAttributeValues,
// } from "@/utils/products";

// /**
//  * Re-export query keys from api-client
//  */
// export const productKeys = queryKeys.products;

// /**
//  * Get products with filters
//  */
// export const useGetProducts = useGetProductsFromApi;

// /**
//  * Get product by ID
//  */
// export const useGetProductById = useGetProductByIdFromApi;

// /**
//  * Get multiple products by IDs
//  */
// export const useGetProductsByIds = useGetProductsByIdsFromApi;

// /**
//  * Search products
//  */
// export const useSearchProducts = useSearchProductsFromApi;

// /**
//  * Get featured products
//  */
// export const useGetFeaturedProducts = useGetFeaturedProductsFromApi;

// /**
//  * Get popular products
//  */
// export const useGetPopularProducts = useGetPopularProductsFromApi;

// /**
//  * Get products by category
//  */
// export const useGetProductsByCategory = useGetProductsByCategoryFromApi;

// /**
//  * Rank products by names (client-side)
//  */
// export function useRankByNames(products, matchedNames, options = {}) {
//   return useQuery({
//     queryKey: [...productKeys.all, "rank", matchedNames],
//     queryFn: () => rankByNames(products, matchedNames),
//     enabled:
//       !!products &&
//       products.length > 0 &&
//       !!matchedNames &&
//       matchedNames.length > 0,
//     ...options,
//   });
// }

// /**
//  * Sort products by relevance (client-side)
//  */
// export function useSortByRelevance(products, query, options = {}) {
//   return useQuery({
//     queryKey: [...productKeys.all, "relevance", query],
//     queryFn: () => sortByRelevance(products, query),
//     enabled:
//       !!products && products.length > 0 && !!query && query.trim() !== "",
//     ...options,
//   });
// }

// /**
//  * Get unique attribute values (for dev purposes)
//  * Note: This hook requires products to be passed or fetched separately
//  */
// export function useGetUniqueAttributeValues(
//   attributePath,
//   products,
//   options = {}
// ) {
//   return useQuery({
//     queryKey: [...productKeys.all, "uniqueAttributes", attributePath],
//     queryFn: () => getUniqueAttributeValues(products, attributePath),
//     enabled: !!attributePath && !!products && products.length > 0,
//     ...options,
//   });
// }

// // Export utility functions for direct use if needed
// export {
//   rankByNames,
//   sortByRelevance,
//   filterProductsLocal,
//   sortProductsLocal,
//   calculateProductScore,
//   getUniqueAttributeValues,
// };

export const useGetFeaturedProducts = () => {
  return useQuery({
    queryKey: ["featuredProducts"],
    queryFn: async () => {
      const response = await apiFetch("/products/featured");
      return response;
    },
  });
};
