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

  static async rankByNames(
    products: Product[],
    matchedNames: string[]
  ): Promise<Product[]> {
    const results = products.map((p) => {
      const name = p.name.toLowerCase();
      const desc = p.description.toLowerCase();

      let totalScore = 0;

      for (const q of matchedNames) {
        const query = q.toLowerCase();
        let score = 0;

        // Exact or partial match
        if (name === query) score = 1;
        else if (name.includes(query)) score = 0.9;
        else if (desc.includes(query)) score = 0.6;

        // Loose fuzzy overlap
        const terms = query.split(/\s+/);
        const overlap = terms.filter((t) => name.includes(t)).length;
        score = Math.max(score, overlap / terms.length);

        totalScore += score / matchedNames.length;
      }

      return { ...p, _nameMatchScore: totalScore };
    });

    // Filter and sort
    const filtered = results
      .filter((p) => p._nameMatchScore > 0.2)
      .sort((a, b) => b._nameMatchScore - a._nameMatchScore);
    return filtered;
  }

  static async sortByRelevance(
    products: Product[],
    query: string
  ): Promise<Product[]> {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

    const scored = products.map((p: any) => {
      const text =
        `${p.name} ${p.description} ${p.brand} ${p.category}`.toLowerCase();
      let score = 0;

      // Keyword overlap
      for (const term of terms) {
        if (text.includes(term)) score += 1;
      }

      // Slight boost for exact/partial name match
      if (p.name.toLowerCase().includes(query.toLowerCase())) score += 3;

      // Bonus if prior name match existed
      if (p._nameMatchScore) score += p._nameMatchScore * 2;

      return { ...p, _relevanceScore: score };
    });

    const sorted = scored.sort((a, b) => b._relevanceScore - a._relevanceScore);

    return sorted;
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
  static filterProductsLocal(
    products: Product[],
    filters: SearchFilters
  ): Product[] {
    let result = [...products];

    // Category
    if (filters.category) {
      result = result.filter((p) => p.category === filters.category);
    }

    // Brand (multiple allowed)
    if (filters.brand && filters.brand.length > 0) {
      result = result.filter((p) => filters.brand!.includes(p.brand));
    }

    // Price range
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      result = result.filter((p) => p.price >= min && p.price <= max);
    }

    // Minimum rating
    if (filters.rating !== undefined) {
      result = result.filter((p) => p.rating >= filters.rating!);
    }

    // In stock
    if (filters.inStock !== undefined) {
      result = result.filter((p) => p.inStock === filters.inStock);
    }

    // Features (must include ALL requested features)
    if (filters.features && filters.features.length > 0) {
      result = result.filter((p) =>
        filters.features!.every((feature) => p.features.includes(feature))
      );
    }

    return result;
  }

  static sortProductsLocal(products: Product[], sortBy, sortOrder): Product[] {
    // Sorting
    if (!sortBy) return products;
    const order = sortOrder === "desc" ? -1 : 1;

    return [...products].sort((a, b) => {
      switch (sortBy) {
        case "price":
          return (a.price - b.price) * order;
        case "rating":
          return (a.rating - b.rating) * order;
        case "score":
          return (a.score - b.score) * order;
        case "newest":
          return (a.createdAt.getTime() - b.createdAt.getTime()) * order;
        default:
          return 0;
      }
    });
  }

  // for dev purposes
  static async getUniqueAttributeValues(attributePath: string): any[] {
    const pathKeys = attributePath.split(".");

    const products = await apiClient.getPopularProducts();
    const values = products
      .map((product) => {
        let value: any = product;
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
