const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/**
 * Generic API fetch function with error handling
 */
export async function apiFetch(endpoint, options) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      cache: "no-store",
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`,
      }));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || "API request failed");
    }

    return data.data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Build query string from object
 */
export function buildQueryString(params) {
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
    return apiFetch("/products/featured");
  },

  /**
   * Get popular products
   */
  async getPopularProducts() {
    return apiFetch("/products/popular");
  },

  /**
   * Search products
   */
  async searchProducts(query) {
    return apiFetch(`/products/search${buildQueryString({ q: query })}`);
  },

  /**
   * Get products with filters
   */
  async getProducts(filters) {
    const params = {};
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

    return apiFetch(`/products${buildQueryString(params)}`);
  },
  async getProductById(id) {
    return apiFetch(`/products/${encodeURIComponent(id)}`);
  },

  /**
   * Get products by category
   */
  async getProductsByCategory(category) {
    return apiFetch(`/products/category/${encodeURIComponent(category)}`);
  },

  /**
   * Get product by ID
   */
};
