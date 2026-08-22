import express from "express";
import { ObjectId } from "mongodb";
import { authenticateToken } from "../middleware/authenticateToken.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { User } from "../models/User.js";
import { Product } from "../models/Product.js";

const router = express.Router();

const VALID_ROLES = ["user", "admin"];
const VALID_STATUSES = ["active", "disabled"];

function isValidObjectId(id) {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === String(id);
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
    await User.clearCart(req.user.id);

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

const MAX_ITEM_QUANTITY = 99;
const FREE_SHIPPING_THRESHOLD = 100;
const SHIPPING_FEE = 15;
const TAX_RATE = 0.08;

// Prices, product details and totals are always derived from the database.
// Client-supplied prices/totals are never trusted (prevents price tampering).
export async function buildOrderFromRequest(rawItems) {
  const products = await hydrateProducts(
    rawItems.map((item) => item?.productId)
  );
  const catalog = new Map(products.map((product) => [String(product.id), product]));

  const items = [];
  for (const rawItem of rawItems) {
    const product = catalog.get(String(rawItem?.productId));
    if (!product) {
      return { error: `Product not found: ${rawItem?.productId}` };
    }
    if (!product.inStock) {
      return { error: `Product out of stock: ${product.name}` };
    }

    const quantity = Math.max(
      1,
      Math.min(Number(rawItem?.quantity) || 1, MAX_ITEM_QUANTITY)
    );

    items.push({
      productId: String(product.id),
      quantity,
      price: Number(product.price) || 0,
      name: product.name || "",
      image: product.image || "",
      category: product.category || "",
      brand: product.brand || "",
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = subtotal * TAX_RATE;

  return {
    order: {
      items,
      totals: {
        subtotal,
        shipping,
        tax,
        total: subtotal + shipping + tax,
      },
    },
  };
}

router.post("/me/orders", authenticateToken, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one order item is required",
      });
    }

    const { order, error } = await buildOrderFromRequest(items);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const createdOrder = await User.createOrder(req.user.id, {
      ...order,
      shippingAddress,
      paymentMethod,
    });

    res.json({
      success: true,
      data: createdOrder,
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

// GET /admin/users?q=&role=&status= - List accounts (admin only).
// Response fields are limited to safe display data — no hashes or tokens.
router.get("/admin/users", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.listUsers({
      q: req.query.q,
      role: req.query.role,
      status: req.query.status,
    });

    res.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
});

// GET /admin/stats - Account counts for the admin dashboard.
router.get("/admin/stats", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await User.getAdminUserStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user stats",
      error: error.message,
    });
  }
});

// PATCH /admin/users/:id/role - Promote/demote an account (admin only).
router.patch("/admin/users/:id/role", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Role must be one of: ${VALID_ROLES.join(", ")}`,
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const target = await User.findById(id);
    if (!target) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Self-lockout guard: an admin can never change their own role.
    if (target.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    // Last-admin guard: never leave the store without an active admin.
    if (target.role === "admin" && role !== "admin") {
      const otherActiveAdmins = await User.countActiveAdmins(id);
      if (otherActiveAdmins === 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot demote the last administrator. Promote another admin first.",
        });
      }
    }

    const updated = await User.updateRole(id, role);
    res.json({
      success: true,
      data: { id: updated.id, email: updated.email, role: updated.role },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update role",
      error: error.message,
    });
  }
});

// PATCH /admin/users/:id/status - Enable/disable an account (admin only).
router.patch("/admin/users/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const target = await User.findById(id);
    if (!target) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Self-lockout guard: an admin can never disable their own account.
    if (target.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own account status",
      });
    }

    // Last-admin guard: disabling the final active admin would lock everyone
    // out of the admin area.
    if (
      status === "disabled" &&
      target.role === "admin" &&
      target.status !== "disabled"
    ) {
      const otherActiveAdmins = await User.countActiveAdmins(id);
      if (otherActiveAdmins === 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot disable the last administrator.",
        });
      }
    }

    const updated = await User.updateStatus(id, status);
    res.json({
      success: true,
      data: { id: updated.id, email: updated.email, status: updated.status },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update account status",
      error: error.message,
    });
  }
});

// DELETE /admin/users/:id - Permanently remove an account (admin only).
router.delete("/admin/users/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const target = await User.findById(id);
    if (!target) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Self-lockout guards.
    if (target.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    if (target.role === "admin") {
      const otherActiveAdmins = await User.countActiveAdmins(id);
      if (otherActiveAdmins === 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete the last administrator.",
        });
      }
    }

    await User.deleteById(id);

    res.json({
      success: true,
      data: { id: target.id, email: target.email },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
});

export default router;
