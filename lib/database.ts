import type { Product, User, SearchFilters, ComparisonProduct } from "./types";
import { mockUser } from "./mock-data";
import { apiClient } from "./api-client";

/**
 * Database class - now uses backend API instead of mock data
 */
export class Database {
  // Product operations
  static async getProducts(filters?: SearchFilters): Promise<Product[]> {
    try {
      const apiFilters: {
        category?: string;
        brand?: string | string[];
        minPrice?: number;
        maxPrice?: number;
        rating?: number;
        inStock?: boolean;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
      } = {};

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

  static async getProductById(id: string): Promise<Product | null> {
    try {
      const product = await apiClient.getProductById(id);
      return product || null;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      return null;
    }
  }

  static async getProductsByIds(ids: string[]): Promise<Product[]> {
    try {
      // Fetch products in parallel
      const productPromises = ids.map((id) => apiClient.getProductById(id));
      const products = await Promise.all(productPromises);
      return products.filter((p) => p !== null) as Product[];
    } catch (error) {
      console.error("Error fetching products by IDs:", error);
      return [];
    }
  }

  static async searchProducts(query: string): Promise<Product[]> {
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

  static async getComparisonProducts(
    ids: string[]
  ): Promise<ComparisonProduct[]> {
    try {
      const products = await this.getProductsByIds(ids);
      return products.map((p) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        price: p.price,
        score: p.score,
        specifications: p.specifications,
        image: p.image,
      }));
    } catch (error) {
      console.error("Error getting comparison products:", error);
      return [];
    }
  }

  // User operations (still using mock - auth excluded as requested)
  static async getUserById(id: string): Promise<User | null> {
    return id === "1" ? mockUser : null;
  }

  static async createUser(
    userData: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<User> {
    // Mock user creation - auth excluded as requested
    return {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Utility functions
  static calculateProductScore(product: Product): number {
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

  static async getFeaturedProducts(): Promise<Product[]> {
    try {
      const products = await apiClient.getFeaturedProducts();
      return products || [];
    } catch (error) {
      console.error("Error fetching featured products:", error);
      return [];
    }
  }

  static async getPopularProducts(): Promise<Product[]> {
    try {
      const products = await apiClient.getPopularProducts();
      return products || [];
    } catch (error) {
      console.error("Error fetching popular products:", error);
      return [];
    }
  }
}
