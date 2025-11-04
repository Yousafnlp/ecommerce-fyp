import type { Product, User, SearchFilters, ComparisonProduct } from "./types";
import { mockProducts, mockUser } from "./mock-data";

// Mock database functions - replace with real database calls later
export class Database {
  // Product operations
  static async getProducts(filters?: SearchFilters): Promise<Product[]> {
    let products = [...mockProducts];

    if (filters) {
      products = await this.filterProducts(products, filters);
    }
    return products;
  }

  static async filterProducts(
    products: Product[],
    filters?: SearchFilters
  ): Promise<Product[]> {
    if (filters) {
      if (filters.category) {
        products = products.filter(
          (p) => p.category.toLowerCase() === filters.category?.toLowerCase()
        );
      }

      if (filters.brand && filters.brand.length > 0) {
        const lowerBrands = filters.brand.map((b) => b.toLowerCase());
        products = products.filter((p) =>
          lowerBrands.includes(p.brand.toLowerCase())
        );
      }

      if (filters.priceRange) {
        products = products.filter(
          (p) =>
            p.price >= filters.priceRange!.min &&
            p.price <= filters.priceRange!.max
        );
      }

      if (filters.rating) {
        products = products.filter((p) => p.rating >= filters.rating!);
      }

      if (filters.inStock !== undefined) {
        products = products.filter((p) => p.inStock === filters.inStock);
      }

      // Sort products
      if (filters.sortBy) {
        this.sortProducts(products, filters.sortBy, filters?.sortOrder);
      }
    }

    return products;
  }
  static async sortProducts(
    products: Product[],
    sortBy: string,
    sortOrder: "asc" | "desc" | undefined
  ): Promise<Product[]> {
    products.sort((a, b) => {
      let aValue: number, bValue: number;

      switch (sortBy.toLowerCase()) {
        case "price":
          aValue = a.price;
          bValue = b.price;
          break;
        case "rating":
          aValue = a.rating;
          bValue = b.rating;
          break;
        case "score":
          aValue = a.score;
          bValue = b.score;
          break;
        case "newest":
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        default:
          return 0;
      }

      return sortOrder === "desc" ? bValue - aValue : aValue - bValue;
    });
    return products;
  }
  static async getProductById(id: string): Promise<Product | null> {
    return mockProducts.find((p) => p.id === id) || null;
  }

  static async getProductsByIds(ids: string[]): Promise<Product[]> {
    return mockProducts.filter((p) => ids.includes(p.id));
  }

  static async searchProducts(query: string): Promise<Product[]> {
    const searchTerm = query.toLowerCase();
    return mockProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.brand.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.features.some((f) => f.toLowerCase().includes(searchTerm))
    );
  }

  static async getComparisonProducts(
    ids: string[]
  ): Promise<ComparisonProduct[]> {
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
  }

  // User operations
  static async getUserById(id: string): Promise<User | null> {
    return id === "1" ? mockUser : null;
  }

  static async createUser(
    userData: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<User> {
    // Mock user creation
    return {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Utility functions
  static calculateProductScore(product: Product): number {
    // Mock scoring algorithm - replace with actual scoring logic
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
    const avgPrice = 800; // Mock average price
    if (product.price < avgPrice) {
      score += (avgPrice - product.price) / 100;
    }

    return Math.min(Math.round(score), 100);
  }

  static async getFeaturedProducts(): Promise<Product[]> {
    return mockProducts.filter((p) => p.score >= 90).slice(0, 4);
  }

  static async getPopularProducts(): Promise<Product[]> {
    return mockProducts
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 6);
  }
}
