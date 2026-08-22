import { apiClient } from "./api-client";

/**
 * Data access layer for the frontend.
 * Wraps the backend API client and provides typed, safe access with
 * graceful fallbacks when the API is unavailable.
 */
export class Database {
  // Product operations
  static async getProducts(filters) {
    try {
      const apiFilters = {};
      if (filters?.category) apiFilters.category = filters.category;
      if (filters?.brand && filters.brand.length > 0) {
        apiFilters.brand = filters.brand;
      }
      if (filters?.features && filters.features.length > 0) {
        apiFilters.features = filters.features;
      }
      if (filters?.priceRange) {
        apiFilters.minPrice = filters.priceRange.min;
        apiFilters.maxPrice = filters.priceRange.max;
      }
      if (filters?.rating !== undefined) apiFilters.rating = filters.rating;
      if (filters?.inStock !== undefined) apiFilters.inStock = filters.inStock;
      if (filters?.sortBy) apiFilters.sortBy = filters.sortBy;
      if (filters?.sortOrder) apiFilters.sortOrder = filters.sortOrder;

      const products = await apiClient.getProducts(apiFilters);
      return products || [];
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  }

  static async getProductById(id) {
    try {
      const product = await apiClient.getProductById(id);
      return product || null;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      return null;
    }
  }

  static async getProductsByIds(ids) {
    try {
      const productPromises = ids.map((id) => apiClient.getProductById(id));
      const products = await Promise.all(productPromises);
      return products.filter((p) => p !== null);
    } catch (error) {
      console.error("Error fetching products by IDs:", error);
      return [];
    }
  }

  static async searchProductsAdvanced(query, filters = {}) {
    try {
      if (!query || query.trim() === "") {
        return [];
      }
      const apiFilters = {
        category: filters.category,
        brand: filters.brand,
        features: filters.features,
        minPrice: filters.priceRange?.min ?? filters.minPrice,
        maxPrice: filters.priceRange?.max ?? filters.maxPrice,
        rating: filters.rating,
        inStock: filters.inStock,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };
      const products = await apiClient.searchProducts(query, apiFilters);
      return products || [];
    } catch (error) {
      console.error("Error searching products:", error);
      return [];
    }
  }

  static async getFeaturedProducts() {
    try {
      const products = await apiClient.getFeaturedProducts();
      return products || [];
    } catch (error) {
      console.error("Error fetching featured products:", error);
      return [];
    }
  }

  static async getPopularProducts() {
    try {
      const products = await apiClient.getPopularProducts();
      return products || [];
    } catch (error) {
      console.error("Error fetching popular products:", error);
      return [];
    }
  }

  // User commerce operations
  static async getCommerceData() {
    try {
      return await apiClient.getCommerce();
    } catch (error) {
      console.error("Error fetching commerce data:", error);
      return {
        cart: [],
        wishlist: [],
        orders: [],
        cartProducts: [],
        wishlistProducts: [],
        orderedProducts: [],
      };
    }
  }

  static async toggleWishlist(productId) {
    return apiClient.toggleWishlist(productId);
  }

  static async createOrder(payload) {
    return apiClient.placeOrder(payload);
  }

  // Admin operations
  static async getAdminOrderedProducts() {
    try {
      return await apiClient.getAdminOrderedProducts();
    } catch (error) {
      console.error("Error fetching admin ordered products:", error);
      return [];
    }
  }

  static async getAdminOrderSummary() {
    try {
      return await apiClient.getAdminOrderSummary();
    } catch (error) {
      console.error("Error fetching admin order summary:", error);
      return {
        totalOrders: 0,
        totalItems: 0,
        totalRevenue: 0,
        totalCustomers: 0,
      };
    }
  }

  static async createProduct(payload) {
    return apiClient.createProduct(payload);
  }
}