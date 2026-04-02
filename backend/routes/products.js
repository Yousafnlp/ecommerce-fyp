import express from 'express';
import { Product } from '../models/Product.js';
import { authenticateToken } from "../middleware/authenticateToken.js";

const router = express.Router();

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
  next();
}

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

    let products = await Product.searchProducts(q);

    if (req.query.category) {
      products = products.filter((product) => product.category === req.query.category);
    }

    if (req.query.brand) {
      const brands = Array.isArray(req.query.brand)
        ? req.query.brand
        : String(req.query.brand)
            .split(',')
            .map((brand) => brand.trim());
      products = products.filter((product) => brands.includes(product.brand));
    }

    if (req.query.minPrice) {
      products = products.filter((product) => product.price >= Number(req.query.minPrice));
    }

    if (req.query.maxPrice) {
      products = products.filter((product) => product.price <= Number(req.query.maxPrice));
    }

    if (req.query.rating) {
      products = products.filter((product) => product.rating >= Number(req.query.rating));
    }

    if (req.query.sortBy) {
      const fieldMap = { newest: 'createdAt' };
      const sortField = fieldMap[req.query.sortBy] || req.query.sortBy;
      const direction = req.query.sortOrder === 'asc' ? 1 : -1;
      products = [...products].sort((a, b) => {
        const left = a[sortField];
        const right = b[sortField];
        if (left instanceof Date && right instanceof Date) {
          return (left.getTime() - right.getTime()) * direction;
        }
        return ((left || 0) - (right || 0)) * direction;
      });
    }

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

router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
});

export default router;
