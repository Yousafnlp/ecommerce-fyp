import { getDB } from '../config/database.js';

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

  // Search products by query
  static async searchProducts(query) {
    try {
      const searchTerm = query.toLowerCase().trim();
      const tokens = searchTerm.split(/\s+/).filter(Boolean);
      const intent = this._extractSearchIntent(searchTerm);

      const products = await this.getCollection().find({}).toArray();

      return products
        .map(product => this._decorateProduct(product))
        .filter(product => this._matchesIntent(product, intent))
        .map(product => ({
          ...product,
          _searchScore: this._calculateSearchScore(product, searchTerm, tokens, intent),
        }))
        .filter(product => product._searchScore > 0)
        .sort((a, b) => b._searchScore - a._searchScore)
        .map(({ _searchScore, ...product }) => product);
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  // Get products with filters
  static async getProducts(filters = {}) {
    try {
      const query = {};

      // Category filter
      if (filters.category) {
        query.category = filters.category;
      }

      // Brand filter
      if (filters.brand && Array.isArray(filters.brand) && filters.brand.length > 0) {
        query.brand = { $in: filters.brand };
      }

      // Price range filter
      if (filters.priceRange) {
        query.price = {};
        if (filters.priceRange.min !== undefined) {
          query.price.$gte = filters.priceRange.min;
        }
        if (filters.priceRange.max !== undefined) {
          query.price.$lte = filters.priceRange.max;
        }
      }

      // Rating filter
      if (filters.rating !== undefined) {
        query.rating = { $gte: filters.rating };
      }

      // In stock filter
      if (filters.inStock !== undefined) {
        query.inStock = filters.inStock;
      }

      // Build sort object
      const sort = {};
      if (filters.sortBy) {
        let sortField = filters.sortBy;
        
        if (filters.sortBy === 'newest') {
          sortField = 'createdAt';
        }
        
        const sortOrder = filters.sortOrder === 'desc' ? -1 : 1;
        sort[sortField] = sortOrder;
      } else {
        // Default sort by createdAt descending
        sort.createdAt = -1;
      }

      const products = await this.getCollection()
        .find(query)
        .toArray();

      return products
        .map(product => this._decorateProduct(product))
        .sort((a, b) => {
          const [sortField, direction] = Object.entries(sort)[0] || ["createdAt", -1];
          const left = a[sortField];
          const right = b[sortField];

          if (left instanceof Date && right instanceof Date) {
            return (left.getTime() - right.getTime()) * direction;
          }

          return ((left || 0) - (right || 0)) * direction;
        });
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

  static _extractSearchIntent(query) {
    const categoryMatchers = [
      { category: "smartphone", pattern: /\b(phone|phones|mobile|mobiles|smartphone|smartphones)\b/ },
      { category: "tablet", pattern: /\b(tablet|tablets|ipad|ipads|tab|tabs)\b/ },
      { category: "earbuds", pattern: /\b(earbud|earbuds|buds)\b/ },
      { category: "headphone", pattern: /\b(headphone|headphones|headset|headsets)\b/ },
      { category: "laptop", pattern: /\b(laptop|laptops|notebook|notebooks|macbook|macbooks)\b/ },
      { category: "monitor", pattern: /\b(monitor|monitors|display|displays)\b/ },
      { category: "smartwatch", pattern: /\b(watch|watches|smartwatch|smartwatches)\b/ },
    ];

    const category = categoryMatchers.find((entry) => entry.pattern.test(query))?.category;
    const requiresBattery = /\b(battery|battery life|long battery|good battery|all day)\b/.test(query);
    const requiresCamera = /\b(camera|camera quality|photo|photos|photography)\b/.test(query);
    const recommendsBest = /\b(best|top|recommended|recommend)\b/.test(query);
    const year = query.match(/\b20\d{2}\b/)?.[0];

    return {
      category,
      requiresBattery,
      requiresCamera,
      recommendsBest,
      year: year ? Number(year) : null,
    };
  }

  static _matchesIntent(product, intent) {
    if (intent.category && product.category !== intent.category) {
      return false;
    }

    if (intent.year && product.createdAt instanceof Date) {
      const productYear = product.createdAt.getFullYear();
      if (productYear < intent.year - 1) {
        return false;
      }
    }

    return true;
  }

  static _calculateSearchScore(product, query, tokens, intent = {}) {
    const productScore = Number(product.score) || this.calculateProductScore(product);
    const haystack = [
      product.name,
      product.brand,
      product.category,
      product.description,
      ...(product.features || []),
      JSON.stringify(product.specifications || {}),
    ]
      .join(" ")
      .toLowerCase();

    let score = 0;

    if (product.name.toLowerCase() === query) score += 80;
    if (product.name.toLowerCase().includes(query)) score += 45;
    if (product.description?.toLowerCase().includes(query)) score += 20;
    if (product.brand?.toLowerCase() === query) score += 20;

    for (const token of tokens) {
      if (product.name.toLowerCase().includes(token)) score += 18;
      else if (product.brand.toLowerCase().includes(token)) score += 12;
      else if (product.category.toLowerCase().includes(token)) score += 10;
      else if (haystack.includes(token)) score += 6;
    }

    if (/\b(best|top|recommended|recommend)\b/.test(query)) {
      score += productScore * 0.2;
    }

    if (intent.category && product.category === intent.category) {
      score += 35;
    }

    if (intent.requiresBattery) {
      const batteryValue = this._extractNumber(this._getNestedValue(product, "specifications.battery"));
      if (batteryValue !== null) {
        score += Math.min(24, batteryValue / 250);
      } else if ((product.features || []).some((feature) => /battery/i.test(feature))) {
        score += 12;
      } else {
        score -= 8;
      }
    }

    if (intent.requiresCamera) {
      const cameraValue = this._extractNumber(this._getNestedValue(product, "specifications.camera.main"));
      if (cameraValue !== null) {
        score += Math.min(20, cameraValue / 6);
      } else {
        score -= 6;
      }
    }

    if (intent.recommendsBest) {
      score += product.rating * 4;
      score += product.reviewCount > 0 ? Math.min(12, Math.log10(product.reviewCount + 1) * 4) : 0;
    }

    const underMatch = query.match(/\bunder\s+\$?(\d+)/);
    if (underMatch && product.price <= Number(underMatch[1])) {
      score += 15;
    }

    const aboveMatch = query.match(/\b(over|above)\s+\$?(\d+)/);
    if (aboveMatch && product.price >= Number(aboveMatch[2])) {
      score += 10;
    }

    return Math.round(score);
  }
}
