/**
 * API Client for backend communication
 */

import type { Product } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}

/**
 * Generic API fetch function with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      // For Next.js server components, we need to handle cache
      cache: "no-store", // Always fetch fresh data
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`,
      }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<T> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || "API request failed");
    }

    return data.data as T;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Build query string from object
 */
function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const apiClient = {
  /**
   * Get featured products
   */
  async getFeaturedProducts() {
    return apiFetch<Product[]>("/products/featured");
  },

  /**
   * Get popular products
   */
  async getPopularProducts() {
    return apiFetch<Product[]>("/products/popular");
  },

  /**
   * Search products
   */
  async searchProducts(query: string) {
    return apiFetch<Product[]>(`/products/search${buildQueryString({ q: query })}`);
  },

  /**
   * Get products with filters
   */
  async getProducts(filters?: {
    category?: string;
    brand?: string | string[];
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    inStock?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const params: Record<string, any> = {};
    
    if (filters?.category) params.category = filters.category;
    if (filters?.brand) {
      // Backend accepts comma-separated or multiple brand params
      if (Array.isArray(filters.brand)) {
        params.brand = filters.brand.join(",");
      } else {
        params.brand = filters.brand;
      }
    }
    if (filters?.minPrice !== undefined) params.minPrice = filters.minPrice;
    if (filters?.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
    if (filters?.rating !== undefined) params.rating = filters.rating;
    if (filters?.inStock !== undefined) params.inStock = filters.inStock;
    if (filters?.sortBy) params.sortBy = filters.sortBy;
    if (filters?.sortOrder) params.sortOrder = filters.sortOrder;

    return apiFetch<Product[]>(`/products${buildQueryString(params)}`);
  },

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string) {
    return apiFetch<Product[]>(`/products/category/${encodeURIComponent(category)}`);
  },

  /**
   * Get product by ID
   */
  async getProductById(id: string) {
    return apiFetch<Product>(`/products/${encodeURIComponent(id)}`);
  },
};
