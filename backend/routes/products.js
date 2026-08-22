import express from 'express';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { authenticateToken } from "../middleware/authenticateToken.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { normalizeList } from "../utils/search/filters.js";

const router = express.Router();

function sendValidationError(res, errors) {
  const summary = Object.entries(errors)
    .map(([field, message]) => `${field}: ${message}`)
    .join("; ");
  return res.status(400).json({
    success: false,
    message: `Validation failed — ${summary}`,
    errors,
  });
}


function parseNumericParam(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function buildUiFilters(query) {
  const filters = {};

  if (query.category) filters.category = String(query.category);

  const brand = normalizeList(query.brand);
  if (brand.length > 0) filters.brand = brand;

  const minPrice = parseNumericParam(query.minPrice);
  const maxPrice = parseNumericParam(query.maxPrice);
  if (minPrice !== undefined || maxPrice !== undefined) {
    filters.priceRange = {};
    if (minPrice !== undefined) filters.priceRange.min = minPrice;
    if (maxPrice !== undefined) filters.priceRange.max = maxPrice;
  }

const rating = parseNumericParam(query.rating);
  if (rating !== undefined) filters.rating = rating;

  const features = normalizeList(query.features);
  if (features.length > 0) filters.features = features;

  if (query.inStock !== undefined) filters.inStock = query.inStock === "true";
  if (query.sortBy) filters.sortBy = String(query.sortBy);
  if (query.sortOrder) filters.sortOrder = String(query.sortOrder);

  return filters;
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

    const uiFilters = buildUiFilters(req.query);
    const { products, filters, parsedQuery } = await Product.searchProductsWithMeta(q, uiFilters);

    res.json({
      success: true,
      data: products,
      count: products.length,
      query: q,
      filters,
      parsedQuery,
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

// GET /api/products/suggestions?q=query - Lightweight autocomplete suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    const query = String(q || "").trim();

    if (query.length < 2) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        query,
      });
    }

    const suggestions = await Product.getProductSuggestions(query, 5);

    res.json({
      success: true,
      data: suggestions,
      count: suggestions.length,
      query,
    });
  } catch (error) {
    console.error('Error in /suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product suggestions',
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
    const filters = buildUiFilters(req.query);

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
    const { valid, errors, data } = Product.validateProductInput(req.body);
    if (!valid) {
      return sendValidationError(res, errors);
    }

    const product = await Product.create(data);
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

// PUT /api/products/:id - Update a product (admin only)
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const existing = await Product.getProductById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const { valid, errors, data } = Product.validateProductInput(req.body, {
      partial: true,
    });
    if (!valid) {
      return sendValidationError(res, errors);
    }

    // originalPrice: null means "clear the field" — move it to $unset.
    const patch = { ...data };
    const unset = {};
    if (patch.originalPrice === null) {
      delete patch.originalPrice;
      unset.originalPrice = "";
    }

    const product = await Product.updateById(req.params.id, patch, { unset });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
});

// DELETE /api/products/:id - Delete a product (admin only)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const deleted = await Product.deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Orders embed denormalized copies of item data, so order history stays
    // intact. Carts and wishlists hold live product references — remove them
    // so users never see dangling entries.
    const cleanedUsers = await User.removeProductReferences(deleted.id);

    res.json({
      success: true,
      data: { id: deleted.id, name: deleted.name },
      meta: { cartsAndWishlistsCleaned: cleanedUsers.modifiedCount },
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
});

export default router;
