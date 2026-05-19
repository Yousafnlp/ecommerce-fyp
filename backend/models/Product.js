import { getDB } from '../config/database.js';
import { searchProductsPipeline } from "../services/ProductSearchService.js";
import { applyProductFilters } from "../utils/search/filters.js";
import { sortProducts } from "../utils/search/sort.js";

const COLLECTION_NAME = 'products';

const CATEGORY_SCORE_RULES = {
  smartphone: [
    { path: "specifications.ram", max: 16, weight: 1.8 },
    { path: "specifications.storage", max: 512, weight: 0.08 },
    { path: "specifications.battery", max: 6000, weight: 0.005 },
    { path: "specifications.display.refreshRate", max: 144, weight: 0.12 },
  ],
  laptop: [
    { path: "specifications.ram", max: 64, weight: 0.6 },
    { path: "specifications.storage", max: 2000, weight: 0.025 },
    { path: "specifications.display.refreshRate", max: 165, weight: 0.08 },
    { path: "specifications.screenSize", max: 18, weight: 1.2 },
  ],
  monitor: [
    { path: "specifications.display.size", max: 49, weight: 0.4 },
    { path: "specifications.display.refreshRate", max: 240, weight: 0.09 },
    { path: "specifications.display.responseTime", max: 10, weight: -0.8, invert: true },
  ],
  headphone: [
    { path: "specifications.battery", max: 60, weight: 1.2 },
    { path: "specifications.driverSize", max: 50, weight: 0.45 },
  ],
  earbuds: [
    { path: "specifications.battery", max: 16, weight: 2.5 },
  ],
  processor: [
    { path: "specifications.cores", max: 32, weight: 1.1 },
    { path: "specifications.boostClock", max: 6, weight: 8 },
    { path: "specifications.baseClock", max: 5, weight: 6 },
  ],
  tablet: [
    { path: "specifications.ram", max: 16, weight: 1.7 },
    { path: "specifications.storage", max: 512, weight: 0.08 },
    { path: "specifications.display.refreshRate", max: 144, weight: 0.12 },
    { path: "specifications.battery", max: 12000, weight: 0.0025 },
  ],
};

export class Product {
  static getCollection() {
    return getDB().collection(COLLECTION_NAME);
  }

  // Get featured products (score >= 90, limit 4)
  static async getFeaturedProducts() {
    try {
      const products = await this.getCollection().find({}).toArray();

      return products
        .map(product => this._decorateProduct(product))
        .filter(product => product.score >= 90)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);
    } catch (error) {
      console.error('Error getting featured products:', error);
      throw error;
    }
  }

  // Get popular products (sorted by reviewCount, limit 6)
  static async getPopularProducts() {
    try {
      const products = await this.getCollection()
        .find({})
        .toArray();

      return products
        .map(product => this._decorateProduct(product))
        .sort((a, b) => b.reviewCount - a.reviewCount)
        .slice(0, 6);
    } catch (error) {
      console.error('Error getting popular products:', error);
      throw error;
    }
  }

  // Search products by natural language query and optional UI filters.
  static async searchProducts(query, uiFilters = {}) {
    try {
      const products = await this.getCollection().find({}).toArray();
      const decoratedProducts = products.map(product => this._decorateProduct(product));
      return searchProductsPipeline(decoratedProducts, query, uiFilters).products;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  static async searchProductsWithMeta(query, uiFilters = {}) {
    try {
      const products = await this.getCollection().find({}).toArray();
      const decoratedProducts = products.map(product => this._decorateProduct(product));
      return searchProductsPipeline(decoratedProducts, query, uiFilters);
    } catch (error) {
      console.error("Error searching products with metadata:", error);
      throw error;
    }
  }

  static async getProductSuggestions(query, limit = 5) {
    try {
      const trimmedQuery = String(query || "").trim();
      if (trimmedQuery.length < 2) return [];

      const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const matcher = new RegExp(escapedQuery, "i");
      const lowerQuery = trimmedQuery.toLowerCase();

      const products = await this.getCollection()
        .find({
          $or: [
            { name: matcher },
            { brand: matcher },
            { category: matcher },
          ],
        })
        .project({
          _id: 0,
          id: 1,
          name: 1,
          brand: 1,
          price: 1,
          image: 1,
          category: 1,
        })
        .limit(25)
        .toArray();

      return products
        .sort((a, b) => {
          const score = (product) => {
            const name = String(product.name || "").toLowerCase();
            const brand = String(product.brand || "").toLowerCase();
            const category = String(product.category || "").toLowerCase();

            if (name === lowerQuery) return 0;
            if (name.startsWith(lowerQuery)) return 1;
            if (brand.startsWith(lowerQuery)) return 2;
            if (category.startsWith(lowerQuery)) return 3;
            if (name.includes(lowerQuery)) return 4;
            if (brand.includes(lowerQuery)) return 5;
            return 6;
          };

          return score(a) - score(b);
        })
        .slice(0, limit)
        .map(({ id, name, brand, price, image }) => ({
          id,
          name,
          brand,
          price,
          image,
        }));
    } catch (error) {
      console.error("Error getting product suggestions:", error);
      throw error;
    }
  }

  // Get products with filters
  static async getProducts(filters = {}) {
    try {
      const products = await this.getCollection()
        .find({})
        .toArray();

      const decoratedProducts = products.map(product => this._decorateProduct(product));
      const filteredProducts = applyProductFilters(decoratedProducts, filters);
      return sortProducts(filteredProducts, filters.sortBy || "newest", filters.sortOrder || "desc");
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  }

  // Get products by category
  static async getProductsByCategory(category) {
    try {
      const products = await this.getCollection()
        .find({ category })
        .toArray();

      return products
        .map(product => this._decorateProduct(product))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting products by category:', error);
      throw error;
    }
  }

  // Get product by ID
  static async getProductById(id) {
    try {
      const product = await this.getCollection().findOne({ id });
      return product ? this._decorateProduct(product) : null;
    } catch (error) {
      console.error('Error getting product by ID:', error);
      throw error;
    }
  }

  // Insert multiple products (for seeding)
  static async insertMany(products) {
    try {
      const result = await this.getCollection().insertMany(products);
      return result;
    } catch (error) {
      console.error('Error inserting products:', error);
      throw error;
    }
  }

  static async create(productInput) {
    try {
      const now = new Date();
      const nextProduct = {
        id: productInput.id || `${Date.now()}`,
        name: productInput.name,
        brand: productInput.brand,
        category: productInput.category,
        price: Number(productInput.price) || 0,
        originalPrice: productInput.originalPrice
          ? Number(productInput.originalPrice)
          : undefined,
        image: productInput.image || "/placeholder.svg",
        images: Array.isArray(productInput.images)
          ? productInput.images.filter(Boolean)
          : [],
        specifications: productInput.specifications || {},
        rating: Number(productInput.rating) || 0,
        reviewCount: Number(productInput.reviewCount) || 0,
        inStock: Boolean(productInput.inStock),
        description: productInput.description || "",
        features: Array.isArray(productInput.features)
          ? productInput.features.filter(Boolean)
          : [],
        createdAt: now,
        updatedAt: now,
      };

      await this.getCollection().insertOne(nextProduct);
      return this._decorateProduct(nextProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  // Delete all products (for seeding)
  static async deleteAll() {
    try {
      const result = await this.getCollection().deleteMany({});
      return result;
    } catch (error) {
      console.error('Error deleting products:', error);
      throw error;
    }
  }

  // Transform MongoDB dates to proper Date objects
  static _transformDates(product) {
    if (product.createdAt) {
      product.createdAt = new Date(product.createdAt);
    }
    if (product.updatedAt) {
      product.updatedAt = new Date(product.updatedAt);
    }
    return product;
  }

  static _decorateProduct(product) {
    const withDates = this._transformDates(product);
    return {
      ...withDates,
      score: this.calculateProductScore(withDates),
    };
  }

  static _getNestedValue(source, path) {
    return path.split(".").reduce((current, key) => current?.[key], source);
  }

  static _extractNumber(value) {
    if (typeof value === "number") return value;
    if (typeof value !== "string") return null;

    const match = value.replace(/,/g, "").match(/(\d+(\.\d+)?)/);
    return match ? Number(match[1]) : null;
  }

   static calculateProductScore(product) {
    const baseScore =
      Math.min(50, (Number(product.rating) || 0) * 10) +
      Math.min(20, (Number(product.reviewCount) || 0) / 150) +
      (product.inStock ? 5 : 0);

    const rules = CATEGORY_SCORE_RULES[product.category] || [];
    const specScore = rules.reduce((total, rule) => {
      const numericValue = this._extractNumber(this._getNestedValue(product, rule.path));
      if (numericValue === null) return total;

      const cappedValue = Math.min(numericValue, rule.max);
      if (rule.invert) {
        return total + Math.max(0, (rule.max - cappedValue)) * Math.abs(rule.weight);
      }
      return total + cappedValue * rule.weight;
    }, 0);

    const featureBoost = Math.min(10, (product.features?.length || 0) * 2);
    const pricePenalty = product.price > 0 ? Math.min(15, product.price / 400) : 0;

    return Math.max(
      35,
      Math.min(100, Math.round(baseScore + specScore + featureBoost - pricePenalty))
    );
  }
}

