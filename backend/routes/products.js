import express from 'express';
import { Product } from '../models/Product.js';

const router = express.Router();

// GET /api/products/featured - Get featured products
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.getFeaturedProducts();
    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Error in /featured:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products',
      error: error.message
    });
  }
});

// GET /api/products/popular - Get popular products
router.get('/popular', async (req, res) => {
  try {
    const products = await Product.getPopularProducts();
    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Error in /popular:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular products',
      error: error.message
    });
  }
});

// GET /api/products/search?q=query - Search products
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const products = await Product.searchProducts(q);
    res.json({
      success: true,
      data: products,
      count: products.length,
      query: q
    });
  } catch (error) {
    console.error('Error in /search:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products',
      error: error.message
    });
  }
});

// GET /api/products/category/:category - Get products by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.getProductsByCategory(category);
    
    res.json({
      success: true,
      data: products,
      count: products.length,
      category
    });
  } catch (error) {
    console.error('Error in /category/:category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products by category',
      error: error.message
    });
  }
});

// GET /api/products/:id - Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.getProductById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error in /:id:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
});

// GET /api/products - Get products with filters
router.get('/', async (req, res) => {
  try {
    const filters = {};

    // Parse query parameters
    if (req.query.category) {
      filters.category = req.query.category;
    }

    if (req.query.brand) {
      // Support multiple brands (comma-separated or array)
      filters.brand = Array.isArray(req.query.brand) 
        ? req.query.brand 
        : req.query.brand.split(',').map(b => b.trim());
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filters.priceRange = {};
      if (req.query.minPrice) {
        filters.priceRange.min = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filters.priceRange.max = parseFloat(req.query.maxPrice);
      }
    }

    if (req.query.rating) {
      filters.rating = parseFloat(req.query.rating);
    }

    if (req.query.inStock !== undefined) {
      filters.inStock = req.query.inStock === 'true';
    }

    if (req.query.sortBy) {
      filters.sortBy = req.query.sortBy;
    }

    if (req.query.sortOrder) {
      filters.sortOrder = req.query.sortOrder;
    }

    const products = await Product.getProducts(filters);
    
    res.json({
      success: true,
      data: products,
      count: products.length,
      filters
    });
  } catch (error) {
    console.error('Error in /:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

export default router;
