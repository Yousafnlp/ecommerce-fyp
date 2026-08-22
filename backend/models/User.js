// models/User.js
import { ObjectId } from "mongodb";
import { getDB } from "../config/database.js";

const COLLECTION_NAME = "users";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "admin@specsmart.com")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export class User {
  /* Collection */

  static getCollection() {
    return getDB().collection(COLLECTION_NAME);
  }

  /* Helpers */

  static _defaultPreferences() {
    return {
      favoriteCategories: [],
      priceRange: { min: 0, max: 5000 },
      preferredBrands: [],
      notifications: true,
    };
  }

  static _defaultCommerce() {
    return {
      cart: [],
      wishlist: [],
      orders: [],
    };
  }

  static _normalizeCartItem(item) {
    return {
      productId: String(item.productId),
      quantity: Math.max(1, Number(item.quantity) || 1),
      updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
    };
  }

  static _normalizeOrder(order) {
    return {
      id: order.id,
      status: order.status || "Placed",
      createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
      items: Array.isArray(order.items)
        ? order.items.map((item) => ({
            productId: String(item.productId),
            quantity: Math.max(1, Number(item.quantity) || 1),
            price: Number(item.price) || 0,
            name: item.name || "",
            image: item.image || "",
            category: item.category || "",
            brand: item.brand || "",
          }))
        : [],
      totals: {
        subtotal: Number(order.totals?.subtotal) || 0,
        shipping: Number(order.totals?.shipping) || 0,
        tax: Number(order.totals?.tax) || 0,
        total: Number(order.totals?.total) || 0,
      },
      shippingAddress: order.shippingAddress || {},
      paymentMethod: order.paymentMethod || "card",
    };
  }

  static _transform(user) {
    if (!user) return null;

    const commerce = this._defaultCommerce();
    const cart = Array.isArray(user.cart)
      ? user.cart.map((item) => this._normalizeCartItem(item))
      : commerce.cart;
    const wishlist = Array.isArray(user.wishlist)
      ? user.wishlist.map((productId) => String(productId))
      : commerce.wishlist;
    const orders = Array.isArray(user.orders)
      ? user.orders.map((order) => this._normalizeOrder(order))
      : commerce.orders;

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role || "user",
      status: user.status || "active",
      passwordHash: user.passwordHash,
      preferences: user.preferences,
      cart,
      wishlist,
      orders,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /* Queries */

  static async findByEmail(email) {
    const user = await this.getCollection().findOne({
      email: email.toLowerCase().trim(),
    });
    return this._transform(user);
  }

  static async findById(id) {
    const user = await this.getCollection().findOne({
      _id: new ObjectId(id),
    });

    return this._transform(user);
  }

  static removePassword(user) {
    if (!user) return null;
    const { passwordHash, ...rest } = user;
    return rest;
  }

  /* Create */

  static async create({ email, passwordHash, name = "" }) {
    const now = new Date();
    const normalizedEmail = email.toLowerCase().trim();

    const userDoc = {
      email: normalizedEmail,
      passwordHash,
      name,
      avatar: "/placeholder.svg",
      role: ADMIN_EMAILS.includes(normalizedEmail) ? "admin" : "user",
      status: "active",
      preferences: this._defaultPreferences(),
      ...this._defaultCommerce(),
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.getCollection().insertOne(userDoc);

    return this._transform({
      _id: result.insertedId,
      ...userDoc,
    });
  }

  /* Update profile */

  static async updateProfile(id, updates) {
    const allowedFields = ["name", "avatar"];
    const safeUpdates = {};

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        safeUpdates[key] = updates[key];
      }
    }

    if (Object.keys(safeUpdates).length === 0) return null;

    safeUpdates.updatedAt = new Date();

    const result = await this.getCollection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: safeUpdates },
      { returnDocument: "after" }
    );

    if (!result) return null;
    const { passwordHash, ...safeUser } = result;
    return this._transform(safeUser);
  }

  /* Update preferences */

  static async updatePreferences(id, preferences) {
    const updates = {
      preferences: {
        ...this._defaultPreferences(),
        ...preferences,
      },
      updatedAt: new Date(),
    };

    const result = await this.getCollection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: "after" }
    );

    if (!result) return null;
    const { passwordHash, ...safeUser } = result;
    return this._transform(safeUser);
  }

  /* Password helpers */

  static async getPasswordHashByEmail(email) {
    return await this.getCollection().findOne(
      { email: email.toLowerCase().trim() },
      { projection: { passwordHash: 1 } }
    );
  }

  static async updatePassword(id, passwordHash) {
    await this.getCollection().updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          passwordHash,
          updatedAt: new Date(),
        },
      }
    );
  }

  /* Delete */

  static async deleteById(id) {
    return await this.getCollection().deleteOne({
      _id: new ObjectId(id),
    });
  }

  /* Admin user management */

  static escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Lists accounts for the admin Users screen.
   * The projection explicitly excludes passwordHash and other sensitive
   * fields — only safe, display-oriented data ever leaves this method.
   */
  static async listUsers({ q, role, status } = {}) {
    const filter = {};

    if (q && String(q).trim()) {
      const matcher = new RegExp(this.escapeRegExp(q.trim()), "i");
      filter.$or = [{ name: matcher }, { email: matcher }];
    }
    if (role === "admin" || role === "user") {
      // Legacy docs may lack a role field; treat missing as "user".
      filter.role = role === "user" ? { $in: [null, "user"] } : "admin";
    }
    if (status === "active" || status === "disabled") {
      filter.status = status === "active" ? { $in: [null, "active"] } : "disabled";
    }

    const users = await this.getCollection()
      .aggregate([
        { $match: filter },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            avatar: 1,
            role: { $ifNull: ["$role", "user"] },
            status: { $ifNull: ["$status", "active"] },
            createdAt: 1,
            orderCount: { $size: { $ifNull: ["$orders", []] } },
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    return users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      orderCount: user.orderCount || 0,
    }));
  }

  /** Number of administrators that are not disabled. */
  static async countActiveAdmins(excludeId) {
    const filter = {
      role: "admin",
      status: { $in: [null, "active"] },
    };
    if (excludeId) {
      filter._id = { $ne: new ObjectId(excludeId) };
    }
    return await this.getCollection().countDocuments(filter);
  }

  static async updateRole(id, role) {
    const result = await this.getCollection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { role, updatedAt: new Date() } },
      { returnDocument: "after", projection: { passwordHash: 0 } }
    );
    if (!result) return null;
    const { _id, ...rest } = result;
    return { id: _id.toString(), ...rest };
  }

  static async updateStatus(id, status) {
    const result = await this.getCollection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: "after", projection: { passwordHash: 0 } }
    );
    if (!result) return null;
    const { _id, ...rest } = result;
    return { id: _id.toString(), ...rest };
  }

  /**
   * Removes a deleted product from every user's cart and wishlist.
   * Orders are untouched — they embed denormalized snapshots.
   */
  static async removeProductReferences(productId) {
    return await this.getCollection().updateMany(
      {},
      {
        $pull: {
          wishlist: String(productId),
          cart: { productId: String(productId) },
        },
      }
    );
  }

  static async getAdminUserStats() {
    const collection = this.getCollection();
    const [totalUsers, totalAdmins, disabledUsers] = await Promise.all([
      collection.countDocuments({}),
      collection.countDocuments({ role: "admin" }),
      collection.countDocuments({ status: "disabled" }),
    ]);

    return {
      totalUsers,
      totalAdmins,
      activeUsers: totalUsers - disabledUsers,
      disabledUsers,
    };
  }

  static async getCommerce(id) {
    const user = await this.findById(id);
    if (!user) return null;

    return {
      cart: user.cart || [],
      wishlist: user.wishlist || [],
      orders: user.orders || [],
    };
  }

  static async upsertCartItem(id, { productId, quantity }) {
    const user = await this.findById(id);
    if (!user) return null;

    const cart = Array.isArray(user.cart) ? [...user.cart] : [];
    const normalizedProductId = String(productId);
    const normalizedQuantity = Math.max(1, Number(quantity) || 1);
    const index = cart.findIndex((item) => item.productId === normalizedProductId);

    const nextItem = {
      productId: normalizedProductId,
      quantity: normalizedQuantity,
      updatedAt: new Date(),
    };

    if (index >= 0) {
      cart[index] = nextItem;
    } else {
      cart.push(nextItem);
    }

    await this.getCollection().updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          cart,
          updatedAt: new Date(),
        },
      }
    );

    return cart.map((item) => this._normalizeCartItem(item));
  }

  static async removeCartItem(id, productId) {
    const user = await this.findById(id);
    if (!user) return null;

    const cart = (user.cart || []).filter(
      (item) => item.productId !== String(productId)
    );

    await this.getCollection().updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          cart,
          updatedAt: new Date(),
        },
      }
    );

    return cart.map((item) => this._normalizeCartItem(item));
  }

  static async clearCart(id) {
    await this.getCollection().updateOne(
      { _id: new ObjectId(id) },
      { $set: { cart: [], updatedAt: new Date() } }
    );
    return [];
  }

  static async toggleWishlist(id, productId) {
    const user = await this.findById(id);
    if (!user) return null;

    const normalizedProductId = String(productId);
    const wishlist = new Set(user.wishlist || []);

    if (wishlist.has(normalizedProductId)) {
      wishlist.delete(normalizedProductId);
    } else {
      wishlist.add(normalizedProductId);
    }

    const nextWishlist = Array.from(wishlist);

    await this.getCollection().updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          wishlist: nextWishlist,
          updatedAt: new Date(),
        },
      }
    );

    return nextWishlist;
  }

  static async createOrder(id, orderInput) {
    const user = await this.findById(id);
    if (!user) return null;

    const order = this._normalizeOrder({
      ...orderInput,
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      status: "Placed",
      createdAt: new Date(),
    });

    const orders = [order, ...(user.orders || [])];

    await this.getCollection().updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          orders,
          cart: [],
          updatedAt: new Date(),
        },
      }
    );

    return order;
  }

  static async getAllOrderedProducts() {
    const users = await this.getCollection()
      .find(
        { "orders.0": { $exists: true } },
        { projection: { name: 1, email: 1, orders: 1 } }
      )
      .toArray();

    return users.flatMap((user) =>
      (user.orders || []).flatMap((order) =>
        (order.items || []).map((item) => ({
          orderId: order.id,
          orderStatus: order.status || "Placed",
          orderedAt: order.createdAt,
          customerName: user.name,
          customerEmail: user.email,
          ...item,
        }))
      )
    );
  }

  static async getOrderSummary() {
    const users = await this.getCollection()
      .find(
        { "orders.0": { $exists: true } },
        { projection: { email: 1, orders: 1 } }
      )
      .toArray();

    let totalOrders = 0;
    let totalItems = 0;
    let totalRevenue = 0;

    for (const user of users) {
      for (const order of user.orders || []) {
        totalOrders += 1;
        totalRevenue += Number(order.totals?.total) || 0;
        totalItems += (order.items || []).reduce(
          (sum, item) => sum + (Number(item.quantity) || 0),
          0
        );
      }
    }

    return {
      totalOrders,
      totalItems,
      totalRevenue,
      totalCustomers: users.length,
    };
  }
}
