import express from "express";
import { authenticateToken } from "../middleware/authenticateToken.js";
import { User } from "../models/User.js";
import { Product } from "../models/Product.js";

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

async function hydrateProducts(productIds) {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return [];
  }

  const uniqueIds = Array.from(new Set(productIds.map(String)));
  const products = await Promise.all(uniqueIds.map((id) => Product.getProductById(id)));
  return products.filter(Boolean);
}

router.get("/me/commerce", authenticateToken, async (req, res) => {
  try {
    const commerce = await User.getCommerce(req.user.id);
    if (!commerce) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const cartProducts = await hydrateProducts(commerce.cart.map((item) => item.productId));
    const wishlistProducts = await hydrateProducts(commerce.wishlist);
    const orderedProducts = await hydrateProducts(
      commerce.orders.flatMap((order) => order.items.map((item) => item.productId))
    );

    res.json({
      success: true,
      data: {
        ...commerce,
        cartProducts,
        wishlistProducts,
        orderedProducts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load commerce data",
      error: error.message,
    });
  }
});

router.get("/me/orders", authenticateToken, async (req, res) => {
  try {
    const commerce = await User.getCommerce(req.user.id);
    res.json({
      success: true,
      data: commerce?.orders || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load orders",
      error: error.message,
    });
  }
});

router.get("/me/wishlist", authenticateToken, async (req, res) => {
  try {
    const commerce = await User.getCommerce(req.user.id);
    const wishlistProducts = await hydrateProducts(commerce?.wishlist || []);

    res.json({
      success: true,
      data: wishlistProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load wishlist",
      error: error.message,
    });
  }
});

router.delete("/me/cart", authenticateToken, async (req, res) => {
  try {
    const commerce = await User.getCommerce(req.user.id);
    const cart = commerce?.cart || [];

    for (const item of cart) {
      await User.removeCartItem(req.user.id, item.productId);
    }

    res.json({
      success: true,
      data: [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error: error.message,
    });
  }
});

router.post("/me/cart", authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const cart = await User.upsertCartItem(req.user.id, { productId, quantity });

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update cart",
      error: error.message,
    });
  }
});

router.delete("/me/cart/:productId", authenticateToken, async (req, res) => {
  try {
    const cart = await User.removeCartItem(req.user.id, req.params.productId);

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove cart item",
      error: error.message,
    });
  }
});

router.post("/me/wishlist/toggle", authenticateToken, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const wishlist = await User.toggleWishlist(req.user.id, productId);

    res.json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update wishlist",
      error: error.message,
    });
  }
});

router.post("/me/orders", authenticateToken, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, totals } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one order item is required",
      });
    }

    const order = await User.createOrder(req.user.id, {
      items,
      shippingAddress,
      paymentMethod,
      totals,
    });

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to place order",
      error: error.message,
    });
  }
});

router.get("/admin/ordered-products", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const orderedProducts = await User.getAllOrderedProducts();

    res.json({
      success: true,
      data: orderedProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch ordered products",
      error: error.message,
    });
  }
});

router.get("/admin/orders-summary", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const summary = await User.getOrderSummary();

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch order summary",
      error: error.message,
    });
  }
});

export default router;
