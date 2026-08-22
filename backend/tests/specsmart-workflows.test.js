import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

import { User } from "../models/User.js";
import { Product } from "../models/Product.js";
import {
  signupHandler,
  signinHandler,
  signoutHandler,
  refreshHandler,
} from "../routes/auth.js";
import { buildOrderFromRequest } from "../routes/users.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import {
  authenticateRefreshToken,
} from "../middleware/authenticateRefreshToken.js";
import { validateSignupInput } from "../utils/signup-validation.js";
import {
  signAccessToken,
  signRefreshToken,
  ACCESS_SECRET,
  REFRESH_SECRET,
} from "../utils/jwt.js";
import jwt from "jsonwebtoken";

const HEX = (n) => String(n).padStart(24, "0").slice(-24).replace(/0/g, "a");

function objectId(n) {
  return new ObjectId(HEX(n));
}

function matchesFilter(doc, filter) {
  return Object.entries(filter || {}).every(([key, expected]) => {
    const actual = key
      .split(".")
      .reduce((node, part) => (node == null ? undefined : node[part]), doc);

    const isOperatorObject =
      expected !== null &&
      typeof expected === "object" &&
      !Array.isArray(expected) &&
      ("$in" in expected || "$ne" in expected || "$exists" in expected);

    if (!isOperatorObject) return looseEquals(actual, expected);

    if ("$in" in expected) return expected.$in.some((v) => looseEquals(actual, v));
    if ("$ne" in expected) return !looseEquals(actual, expected.$ne);
    return expected.$exists ? actual !== undefined : actual === undefined;
  });
}

function looseEquals(a, b) {
  if (a && typeof a.equals === "function") return a.equals(b);
  return a === b;
}

function fakeCollection(seedDocs = []) {
  const docs = seedDocs.map((doc) => ({ ...doc }));
  return {
    docs,
    async insertOne(doc) {
      const _id = doc._id ?? new ObjectId();
      docs.push({ ...doc, _id });
      return { insertedId: _id };
    },
    async findOne(query = {}) {
      return docs.find((doc) => matchesFilter(doc, query)) ?? null;
    },
    async updateOne(query, update) {
      const doc = docs.find((item) => matchesFilter(item, query));
      if (!doc) return { modifiedCount: 0 };
      Object.assign(doc, update.$set);
      return { modifiedCount: 1 };
    },
    find(query = {}) {
      const results = docs.filter((doc) => matchesFilter(doc, query));
      return {
        async toArray() {
          return results.map((doc) => ({ ...doc }));
        },
      };
    },
    async countDocuments(query = {}) {
      return docs.filter((doc) => matchesFilter(doc, query)).length;
    },
  };
}

function stubCollection(model, seedDocs) {
  const original = model.getCollection.bind(model);
  const collection = fakeCollection(seedDocs);
  model.getCollection = () => collection;
  return {
    collection,
    restore() {
      model.getCollection = original;
    },
  };
}

function mockResponse() {
  return {
    statusCode: 200,
    body: undefined,
    cookies: new Map(),
    clearedCookies: [],
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    cookie(name, value, options) {
      this.cookies.set(name, { value, options });
      return this;
    },
    clearCookie(name, options) {
      this.clearedCookies.push({ name, options });
      return this;
    },
    setHeader() {
      return this;
    },
    flushHeaders() {},
    write() {
      return true;
    },
    end() {},
  };
}

function userDoc(overrides = {}) {
  const now = new Date("2026-01-01");
  return {
    _id: undefined,
    email: "fardeen@example.com",
    passwordHash: bcrypt.hashSync("unused-placeholder", 8),
    name: "Fardeen",
    role: "user",
    status: "active",
    preferences: { notifications: true },
    cart: [],
    wishlist: [],
    orders: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

const CATALOG_SEED = [
  {
    id: "flagship-one",
    name: "SpecSmart Ultra 1",
    brand: "Acme",
    category: "smartphone",
    price: 1299,
    rating: 5,
    reviewCount: 30000,
    inStock: true,
    features: ["camera", "display", "battery", "performance", "audio"],
    specifications: {
      ram: "16GB",
      storage: "1000GB",
      battery: "6000 mAh",
      display: { refreshRate: "165Hz" },
    },
    createdAt: new Date("2026-03-01"),
  },
  {
    id: "budget-two",
    name: "Budget Lite",
    brand: "Acme",
    category: "smartphone",
    price: 149,
    rating: 3.2,
    reviewCount: 25,
    inStock: true,
    features: ["battery"],
    specifications: { ram: "4GB", storage: "64GB", battery: "3000 mAh" },
    createdAt: new Date("2026-05-11"),
  },
  {
    id: "laptop-three",
    name: "WorkBook Pro",
    brand: "Dell",
    category: "laptop",
    price: 1899,
    rating: 4.9,
    reviewCount: 900,
    inStock: true,
    features: ["performance"],
    specifications: {
      ram: "32GB",
      storage: "1000GB",
      screenSize: "16",
      display: { refreshRate: "120Hz" },
    },
    createdAt: new Date("2025-12-02"),
  },
];

function catalogSeedWithIds() {
  return CATALOG_SEED.map((product, index) => ({
    ...product,
    _id: objectId(index + 1),
  }));
}

test("TC-01 Register Valid Customer Account: creates normalized account with safe response", async () => {
  const stub = stubCollection(User);
  try {
    const res = mockResponse();
    await signupHandler(
      {
        body: {
          name: "Fardeen",
          email: "  Fardeen@Example.COM ",
          password: "secret123",
        },
      },
      res,
    );

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);

    const { user, token } = res.body.data;
    assert.equal(user.email, "fardeen@example.com");
    assert.equal(user.name, "Fardeen");
    assert.equal("passwordHash" in user, false);
    assert.ok(token);

    const cookie = res.cookies.get("refreshToken");
    assert.ok(cookie);
    assert.equal(cookie.options.httpOnly, true);
    assert.equal(cookie.options.path, "/api/auth/refresh");

    const stored = stub.collection.docs.at(-1);
    assert.equal(stored.email, "fardeen@example.com");
    assert.equal(stored.role, "user");
    assert.equal(stored.status, "active");
    assert.notEqual(stored.passwordHash, "secret123");
    assert.deepEqual(stored.cart, []);
    assert.deepEqual(stored.wishlist, []);
    assert.equal(await bcrypt.compare("secret123", stored.passwordHash), true);

    assert.equal(
      await bcrypt.compare("wrong-password", stored.passwordHash),
      false,
    );
  } finally {
    stub.restore();
  }
});

test("TC-02 Reject Invalid Signup Data: mirrors documented validation rules", async () => {
  assert.equal(validateSignupInput({ name: "F", email: "f@x.com", password: "123456" }), null);

  const invalidCases = [
    [{ email: "f@x.com", password: "123456" }, "Name is required"],
    [{ name: "", email: "f@x.com", password: "123456" }, "Name is required"],
    [{ name: "F", password: "123456" }, "Email is required"],
    [{ name: "F", email: "not-an-email", password: "123456" }, "Please enter a valid email"],
    [{ name: "F", email: "f@x.com" }, "Password is required"],
    [{ name: "F", email: "f@x.com", password: "123" }, "Password must be at least 6 characters"],
  ];

  for (const [body, message] of invalidCases) {
    assert.equal(validateSignupInput(body), message);
  }

  const stub = stubCollection(User);
  try {
    const res = mockResponse();
    await signupHandler({ body: { name: "F", email: "bad-email", password: "123456" } }, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, "Please enter a valid email");
    assert.equal(stub.collection.docs.length, 0);

    const duplicateStub = stubCollection(User, [
      userDoc({ email: "taken@example.com", _id: objectId(50) }),
    ]);
    try {
      const duplicate = mockResponse();
      await signupHandler(
        { body: { name: "F", email: "Taken@Example.com", password: "123456" } },
        duplicate,
      );
      assert.equal(duplicate.statusCode, 400);
      assert.equal(duplicate.body.error, "User already exists");
    } finally {
      duplicateStub.restore();
    }
  } finally {
    stub.restore();
  }
});

test("TC-03 Sign In: accepts valid credentials and rejects invalid, unknown or disabled accounts", async () => {
  const passwordHash = await bcrypt.hash("correct-horse", 10);
  const seed = [
    userDoc({
      _id: objectId(60),
      email: "fardeen@example.com",
      passwordHash,
    }),
    userDoc({
      _id: objectId(61),
      email: "disabled@example.com",
      passwordHash,
      status: "disabled",
    }),
  ];
  const stub = stubCollection(User, seed);
  try {
    const ok = mockResponse();
    await signinHandler(
      { body: { email: "Fardeen@Example.com", password: "correct-horse" } },
      ok,
    );
    assert.equal(ok.statusCode, 200);
    assert.equal(ok.body.success, true);
    assert.equal(ok.body.data.user.email, "fardeen@example.com");
    assert.equal("passwordHash" in ok.body.data.user, false);
    assert.ok(ok.body.data.token);
    assert.ok(ok.cookies.get("refreshToken"));

    const wrongPassword = mockResponse();
    await signinHandler(
      { body: { email: "fardeen@example.com", password: "nope-nope" } },
      wrongPassword,
    );
    assert.equal(wrongPassword.statusCode, 400);
    assert.equal(wrongPassword.body.error, "Invalid credentials");

    const unknownEmail = mockResponse();
    await signinHandler(
      { body: { email: "ghost@example.com", password: "correct-horse" } },
      unknownEmail,
    );
    assert.equal(unknownEmail.statusCode, 400);
    assert.equal(unknownEmail.body.error, "Invalid credentials");

    const disabled = mockResponse();
    await signinHandler(
      { body: { email: "disabled@example.com", password: "correct-horse" } },
      disabled,
    );
    assert.equal(disabled.statusCode, 403);
    assert.match(disabled.body.error, /disabled/i);
  } finally {
    stub.restore();
  }
});

test("TC-04 Restore and End Session: refresh token lifecycle and signout clears cookie", () => {
  const signed = signRefreshToken({ id: "64b000000000000000000061" });
  const claims = jwt.verify(signed, REFRESH_SECRET);
  assert.equal(claims.id, "64b000000000000000000061");
  assert.ok(claims.exp > claims.iat);

  const accessClaims = jwt.verify(signAccessToken({ id: "x" }), ACCESS_SECRET);

  assert.ok(accessClaims.exp > accessClaims.iat);

  const accepted = mockResponse();
  let nextCalled = false;
  authenticateRefreshToken(
    { cookies: { refreshToken: signed } },
    accepted,
    () => {
      nextCalled = true;
    },
  );
  assert.equal(nextCalled, true);
  assert.equal(accepted.statusCode, 200);

  const missingCookie = mockResponse();
  let blockedNext = false;
  authenticateRefreshToken({ cookies: {} }, missingCookie, () => {
    blockedNext = true;
  });
  assert.equal(blockedNext, false);
  assert.equal(missingCookie.statusCode, 401);

  const tampered = mockResponse();
  authenticateRefreshToken(
    { cookies: { refreshToken: `${signed}-tampered` } },
    tampered,
    () => {},
  );
  assert.equal(tampered.statusCode, 403);

  const cleared = mockResponse();
  signoutHandler({}, cleared);
  assert.equal(cleared.body.success, true);
  assert.equal(cleared.clearedCookies[0].name, "refreshToken");
  assert.equal(cleared.clearedCookies[0].options.path, "/api/auth/refresh");
});

test("TC-04 Refresh Handler: issues access tokens only for active accounts", async () => {
  const passwordHash = await bcrypt.hash("irrelevant", 10);
  const userId = objectId(70);
  const stub = stubCollection(User, [
    userDoc({ _id: userId, email: "active@example.com", passwordHash }),
    userDoc({
      _id: objectId(71),
      email: "banned@example.com",
      passwordHash,
      status: "disabled",
    }),
  ]);
  try {
    const refreshed = mockResponse();
    await refreshHandler({ refresh: { id: userId.toString() } }, refreshed);
    assert.equal(refreshed.statusCode, 200);
    assert.ok(refreshed.body.data.token);
    const decoded = jwt.verify(refreshed.body.data.token, ACCESS_SECRET);
    assert.equal(decoded.email, "active@example.com");

    const banned = mockResponse();
    await refreshHandler(
      { refresh: { id: objectId(71).toString() } },
      banned,
    );
    assert.equal(banned.statusCode, 403);
    assert.match(banned.body.error, /disabled/i);

    const ghost = mockResponse();
    await refreshHandler({ refresh: { id: objectId(99).toString() } }, ghost);
    assert.equal(ghost.statusCode, 400);
  } finally {
    stub.restore();
  }
});

test("TC-05 Browse Products: featured selection, popular ordering, category listing and detail lookup", async () => {
  const stub = stubCollection(Product, catalogSeedWithIds());
  try {
    const featured = await Product.getFeaturedProducts();
    const featuredIds = featured.map((product) => product.id);
    assert.ok(!featuredIds.includes("budget-two"));
    assert.ok(featuredIds.includes("flagship-one"));
    assert.ok(featured.length <= 4);
    for (const product of featured) {
      assert.ok(product.score >= 90 && product.score <= 100);
    }
    for (let i = 1; i < featured.length; i += 1) {
      assert.ok(featured[i - 1].score >= featured[i].score);
    }

    const popular = await Product.getPopularProducts();
    assert.deepEqual(
      popular.map((product) => product.id),
      ["flagship-one", "laptop-three", "budget-two"],
    );
    const counts = popular.map((product) => product.reviewCount);
    for (let i = 1; i < counts.length; i += 1) {
      assert.ok(counts[i - 1] >= counts[i]);
    }
    assert.ok(popular.length <= 6);

    const laptops = await Product.getProductsByCategory("laptop");
    assert.deepEqual(laptops.map((product) => product.brand), ["Dell"]);
    assert.ok(laptops[0].createdAt instanceof Date);

    const detail = await Product.getProductById("flagship-one");
    assert.equal(detail.name, "SpecSmart Ultra 1");
    assert.equal(typeof detail.score, "number");
    assert.equal(await Product.getProductById("does-not-exist"), null);
  } finally {
    stub.restore();
  }
});

test("TC-10 Toggle Wishlist: adds then removes products and normalizes identifiers", async () => {
  const stub = stubCollection(User, [
    userDoc({ _id: objectId(80), wishlist: [] }),
  ]);
  try {
    const added = await User.toggleWishlist(objectId(80).toString(), 42);
    assert.deepEqual(added, ["42"]);

    const removed = await User.toggleWishlist(objectId(80).toString(), "42");
    assert.deepEqual(removed, []);

    const persisted = stub.collection.docs[0];
    assert.equal(persisted.updatedAt instanceof Date, true);
  } finally {
    stub.restore();
  }
});

test("TC-13 Checkout Empty or Guest Cart: server-side order guard and totals floor", async () => {
  const stub = stubCollection(Product, [
    {
      _id: objectId(90),
      id: "16",
      name: "Apple 20W USB-C Charger",
      category: "charger",
      brand: "Apple",
      price: 29,
      image: "/chargers/apple/apple-20w-front.webp",
      inStock: true,
    },
    {
      _id: objectId(91),
      id: "19",
      name: "Out of Stock Item",
      category: "charger",
      brand: "Acme",
      price: 49,
      inStock: false,
    },
  ]);
  try {
    const empty = await buildOrderFromRequest([]);
    assert.equal(empty.order.items.length, 0);
    assert.equal(empty.order.totals.total, 15);

    const unknownProduct = await buildOrderFromRequest([
      { productId: "ghost", quantity: 1 },
    ]);
    assert.match(unknownProduct.error, /not found/i);

    const outOfStock = await buildOrderFromRequest([
      { productId: "19", quantity: 1 },
    ]);
    assert.match(outOfStock.error, /out of stock/i);

    const order = await buildOrderFromRequest([
      { productId: "16", quantity: 2, price: 1 },
    ]);
    assert.equal(order.order.items[0].price, 29);
    assert.equal(order.order.totals.subtotal, 58);
    assert.equal(order.order.totals.shipping, 15);
    assert.equal(Math.round(order.order.totals.tax * 100) / 100, 4.64);
    assert.equal(order.order.totals.total, 77.64);

    const clamped = await buildOrderFromRequest([{ productId: "16", quantity: 5000 }]);
    assert.equal(clamped.order.items[0].quantity, 99);
  } finally {
    stub.restore();
  }
});

test("TC-14 Dashboard Commerce: returns normalized cart, wishlist and orders", async () => {
  const stub = stubCollection(User, [
    userDoc({
      _id: objectId(95),
      cart: [{ productId: 16, quantity: 2 }],
      wishlist: [7],
      orders: [],
    }),
  ]);
  try {
    const commerce = await User.getCommerce(objectId(95).toString());
    assert.equal(commerce.cart[0].productId, "16");
    assert.equal(commerce.cart[0].quantity, 2);
    assert.deepEqual(commerce.wishlist, ["7"]);
    assert.deepEqual(commerce.orders, []);
  } finally {
    stub.restore();
  }
});

test("TC-14 Admin Ordered Products: flattens every customer order item with metadata", async () => {
  const stub = stubCollection(User, [
    userDoc({
      _id: objectId(96),
      email: "a@example.com",
      name: "Alice",
      orders: [
        {
          id: "ORD-1",
          status: "Placed",
          createdAt: new Date("2026-02-01"),
          items: [{ productId: "16", name: "Charger", quantity: 1 }],
        },
      ],
    }),
    userDoc({
      _id: objectId(97),
      email: "b@example.com",
      name: "Bob",
      orders: [],
    }),
  ]);
  try {
    const rows = await User.getAllOrderedProducts();
    assert.equal(rows.length, 1);
    assert.equal(rows[0].orderId, "ORD-1");
    assert.equal(rows[0].customerEmail, "a@example.com");
    assert.equal(rows[0].orderStatus, "Placed");
    assert.equal(rows[0].productId, "16");
  } finally {
    stub.restore();
  }
});

test("TC-16 Restrict Admin Panel Actions: requireAdmin authorizes against live database", async () => {
  const passwordHash = await bcrypt.hash("x", 10);
  const stub = stubCollection(User, [
    userDoc({ _id: objectId(41), email: "admin@example.com", role: "admin", passwordHash }),
    userDoc({ _id: objectId(42), email: "user@example.com", passwordHash }),
    userDoc({ _id: objectId(43), email: "gone@example.com", status: "disabled", passwordHash }),
  ]);
  try {
    const allowed = mockResponse();
    let nextCalled = false;
    await requireAdmin(
      { user: { id: objectId(41).toString() } },
      allowed,
      () => {
        nextCalled = true;
      },
    );
    assert.equal(nextCalled, true);
    assert.equal(allowed.statusCode, 200);

    const notAdmin = mockResponse();
    await requireAdmin({ user: { id: objectId(42).toString() } }, notAdmin, () => {});
    assert.equal(notAdmin.statusCode, 403);
    assert.equal(notAdmin.body.message, "Admin access required");

    const disabled = mockResponse();
    await requireAdmin(
      { user: { id: objectId(43).toString() } },
      disabled,
      () => {},
    );
    assert.equal(disabled.statusCode, 403);
    assert.match(disabled.body.message, /disabled/i);

    const deleted = mockResponse();
    await requireAdmin({ user: { id: objectId(44).toString() } }, deleted, () => {});
    assert.equal(deleted.statusCode, 401);
  } finally {
    stub.restore();
  }
});

test("TC-16 Create Product From Admin Panel: applies defaults and sanitizes input", async () => {
  const stub = stubCollection(Product);
  try {
    const created = await Product.create({
      name: "Test Keyboard",
      brand: "Acme",
      category: "accessory",
      price: "59",
      images: ["/keyboards/a.png", "", false],
      features: ["RGB", null],
      description: "",
    });

    assert.ok(created.id);
    assert.notEqual(created.id, "");
    assert.equal(created.price, 59);
    assert.deepEqual(created.images, ["/keyboards/a.png"]);
    assert.deepEqual(created.features, ["RGB"]);
    assert.equal(created.image, "/placeholder.svg");
    assert.equal(created.inStock, false);
    assert.ok(created.createdAt instanceof Date);
    assert.equal(typeof created.score, "number");
  } finally {
    stub.restore();
  }
});

test("TC-17 Admin Order Summary: aggregates revenue, items and customers across orders", async () => {
  const stub = stubCollection(User, [
    userDoc({
      _id: objectId(81),
      email: "a@example.com",
      orders: [
        {
          id: "ORD-A1",
          totals: { total: 484.92 },
          items: [{ productId: "16", quantity: 2 }],
        },
        {
          id: "ORD-A2",
          totals: { total: 100 },
          items: [{ productId: "19", quantity: 1 }],
        },
      ],
    }),
    userDoc({
      _id: objectId(82),
      email: "b@example.com",
      orders: [
        {
          id: "ORD-B1",
          totals: { total: "77.64" },
          items: [{ productId: "16", quantity: 2 }],
        },
      ],
    }),
  ]);
  try {
    const summary = await User.getOrderSummary();
    assert.equal(summary.totalOrders, 3);
    assert.equal(summary.totalItems, 5);
    assert.ok(Math.abs(summary.totalRevenue - 662.56) < 1e-6);
    assert.equal(summary.totalCustomers, 2);

    const stats = await User.getAdminUserStats();
    assert.equal(stats.totalUsers, 2);
    assert.equal(stats.totalAdmins, 0);
    assert.equal(stats.disabledUsers, 0);
    assert.equal(stats.activeUsers, 2);
  } finally {
    stub.restore();
  }
});
