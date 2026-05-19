import { apiClient } from "./api-client";

/**
 * Database class - now uses backend API instead of mock data
 */
export class Database {
  static async createUser(user) {
    apiClient.signup(user);
  }

  static async login(user) {
    apiClient.login(user);
  }
  // Product operations
  static async getProducts(filters) {
    try {
      const apiFilters = {};
      if (filters?.category) apiFilters.category = filters.category;
      if (filters?.brand && filters.brand.length > 0) {
        apiFilters.brand = filters.brand;
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
      // Return empty array on error (you might want to throw or handle differently)
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
      // Fetch products in parallel
      const productPromises = ids.map((id) => apiClient.getProductById(id));
      const products = await Promise.all(productPromises);
      return products.filter((p) => p !== null);
    } catch (error) {
      console.error("Error fetching products by IDs:", error);
      return [];
    }
  }

  static async searchProducts(query) {
    try {
      if (!query || query.trim() === "") {
        return [];
      }
      const products = await apiClient.searchProducts(query);
      return products || [];
    } catch (error) {
      console.error("Error searching products:", error);
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

  // Utility functions
  static calculateProductScore(product) {
    // Scoring algorithm (client-side calculation if needed)
    let score = 0;

    // Base score from rating
    score += product.rating * 10;

    // Category-specific scoring
    if (product.category === "smartphone") {
      if (product.specifications.ram) {
        const ram = Number.parseInt(product.specifications.ram);
        score += Math.min(ram, 16) * 2;
      }
      if (product.specifications.storage) {
        const storage = Number.parseInt(product.specifications.storage);
        score += Math.min(storage / 64, 8) * 3;
      }
    }

    // Price-to-value ratio
    const avgPrice = 800;
    if (product.price < avgPrice) {
      score += (avgPrice - product.price) / 100;
    }

    return Math.min(Math.round(score), 100);
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

  static async saveCartItem(productId, quantity) {
    return apiClient.addCartItem({ productId, quantity });
  }

  static async deleteCartItem(productId) {
    return apiClient.removeCartItem(productId);
  }

  static async toggleWishlist(productId) {
    return apiClient.toggleWishlist(productId);
  }

  static async createOrder(payload) {
    return apiClient.placeOrder(payload);
  }

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

  // for dev purposes
  static async getUniqueAttributeValues(attributePath) {
    const pathKeys = attributePath.split(".");
    const products = await apiClient.getPopularProducts();

    const values = products
      .map((product) => {
        let value = product;
        for (const key of pathKeys) {
          if (value && typeof value === "object") {
            value = value[key];
          } else {
            return undefined;
          }
        }
        return value;
      })
      .filter((v) => v !== undefined && v !== null);

    const flattened = values.flatMap((v) => (Array.isArray(v) ? v : [v]));
    return Array.from(new Set(flattened));
  }
}
