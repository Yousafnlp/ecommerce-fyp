import { getDB } from '../config/database.js';

const COLLECTION_NAME = 'products';

export class Product {
  static getCollection() {
    return getDB().collection(COLLECTION_NAME);
  }

  // Get featured products (score >= 90, limit 4)
  static async getFeaturedProducts() {
    try {
      const products = await this.getCollection()
        .find({ score: { $gte: 90 } })
        .sort({ score: -1 })
        .limit(4)
        .toArray();
      
      return products.map(product => this._transformDates(product));
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
        .sort({ reviewCount: -1 })
        .limit(6)
        .toArray();
      
      return products.map(product => this._transformDates(product));
    } catch (error) {
      console.error('Error getting popular products:', error);
      throw error;
    }
  }

  // Search products by query
  static async searchProducts(query) {
    try {
      const searchTerm = query.toLowerCase();
      const regex = new RegExp(searchTerm, 'i');
      
      const products = await this.getCollection()
        .find({
          $or: [
            { name: regex },
            { brand: regex },
            { description: regex },
            { 'features': regex }
          ]
        })
        .toArray();
      
      return products.map(product => this._transformDates(product));
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
        .sort(sort)
        .toArray();
      
      return products.map(product => this._transformDates(product));
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
        .sort({ createdAt: -1 })
        .toArray();
      
      return products.map(product => this._transformDates(product));
    } catch (error) {
      console.error('Error getting products by category:', error);
      throw error;
    }
  }

  // Get product by ID
  static async getProductById(id) {
    try {
      const product = await this.getCollection().findOne({ id });
      return product ? this._transformDates(product) : null;
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
}
