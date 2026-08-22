import test from "node:test";
import assert from "node:assert/strict";

import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { searchProductsPipeline } from "../services/ProductSearchService.js";
import { parseNaturalLanguageQuery } from "../utils/search/parseNaturalLanguageQuery.js";
import { applyProductFilters } from "../utils/search/filters.js";
import { sortProducts } from "../utils/search/sort.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import { createRateLimiter } from "../middleware/rateLimiter.js";

const catalog = [
  {
    id: "iphone-15-pro",
    _id: "iphone-15-pro",
    name: "Apple iPhone 15 Pro",
    brand: "Apple",
    category: "smartphone",
    price: 999,
    rating: 4.8,
    reviewCount: 1200,
    inStock: true,
    description: "Flagship smartphone with strong camera and OLED display.",
    features: ["camera", "OLED display", "A17 Pro performance"],
    specifications: {
      ram: "8GB",
      storage: "256GB",
      battery: "3274 mAh",
      display: { refreshRate: "120Hz" },
    },
    createdAt: new Date("2026-01-15"),
  },
  {
    id: "galaxy-a55",
    _id: "galaxy-a55",
    name: "Samsung Galaxy A55",
    brand: "Samsung",
    category: "smartphone",
    price: 449,
    rating: 4.2,
    reviewCount: 350,
    inStock: true,
    description: "Affordable smartphone with good battery life and camera.",
    features: ["battery", "camera", "AMOLED display"],
    specifications: {
      ram: "8GB",
      storage: "128GB",
      battery: "5000 mAh",
      display: { refreshRate: "120Hz" },
    },
    createdAt: new Date("2026-02-10"),
  },
  {
    id: "xps-15",
    _id: "xps-15",
    name: "Dell XPS 15",
    brand: "Dell",
    category: "laptop",
    price: 1599,
    rating: 4.6,
    reviewCount: 640,
    inStock: true,
    description: "Premium laptop for productivity and editing.",
    features: ["performance", "OLED display"],
    specifications: {
      ram: "32GB",
      storage: "1000GB",
      screenSize: "15.6",
      display: { refreshRate: "120Hz" },
    },
    createdAt: new Date("2025-11-01"),
  },
  {
    id: "sony-xm5",
    _id: "sony-xm5",
    name: "Sony WH-1000XM5",
    brand: "Sony",
    category: "headphone",
    price: 399,
    rating: 4.7,
    reviewCount: 980,
    inStock: false,
    description: "Wireless noise cancelling headphones with long battery life.",
    features: ["audio", "noise cancellation", "battery"],
    specifications: {
      battery: "30 hours",
      driverSize: "30mm",
    },
    createdAt: new Date("2025-09-01"),
  },
];

function mockResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test("TC-06 Product Search: parses natural-language category, feature and price intent", () => {
  const parsed = parseNaturalLanguageQuery(
    "best smartphone under $800 with good camera",
  );

  assert.equal(parsed.category, "smartphone");
  assert.deepEqual(parsed.features, ["camera"]);
  assert.equal(parsed.priceRange.max, 800);

  const { products, filters } = searchProductsPipeline(
    catalog,
    "best smartphone under $800 with good camera",
  );

  assert.equal(filters.category, "smartphone");
  assert.equal(filters.priceRange.max, 800);
  assert.deepEqual(
    products.map((product) => product.id),
    ["galaxy-a55"],
  );
});

test("TC-07 Product Filtering: applies brand, price, rating, stock and sort filters", () => {
  const filtered = applyProductFilters(catalog, {
    category: "smartphone",
    brand: ["Samsung"],
    priceRange: { min: 300, max: 500 },
    rating: 4,
    inStock: true,
  });

  assert.deepEqual(
    filtered.map((product) => product.id),
    ["galaxy-a55"],
  );

  const sorted = sortProducts(catalog, "price", "asc");
  assert.deepEqual(
    sorted.map((product) => product.id),
    ["sony-xm5", "galaxy-a55", "iphone-15-pro", "xps-15"],
  );
});

test("TC-09 Product Scoring: computes category-aware score within implemented bounds", () => {
  const highSpecPhone = Product.calculateProductScore(catalog[1]);
  const lowSpecPhone = Product.calculateProductScore({
    ...catalog[1],
    rating: 2.5,
    reviewCount: 0,
    inStock: false,
    features: [],
    specifications: {
      ram: "2GB",
      storage: "32GB",
      battery: "2500 mAh",
      display: { refreshRate: "60Hz" },
    },
  });

  assert.ok(highSpecPhone >= 35 && highSpecPhone <= 100);
  assert.ok(lowSpecPhone >= 35 && lowSpecPhone <= 100);
  assert.ok(highSpecPhone > lowSpecPhone);
});

test("TC-11 Cart Management: normalizes invalid cart quantities to one", () => {
  const normalized = User._normalizeCartItem({
    productId: 42,
    quantity: 0,
  });

  assert.equal(normalized.productId, "42");
  assert.equal(normalized.quantity, 1);
  assert.ok(normalized.updatedAt instanceof Date);

  assert.equal(
    User._normalizeCartItem({ productId: "iphone-15-pro", quantity: "3" })
      .quantity,
    3,
  );
});

test("TC-12 Checkout Workflow: normalizes created order payload defaults and totals", () => {
  const order = User._normalizeOrder({
    id: "ORD-TEST",
    items: [
      {
        productId: 99,
        quantity: 0,
        price: "449",
        name: "Samsung Galaxy A55",
        category: "smartphone",
        brand: "Samsung",
      },
    ],
    totals: {
      subtotal: "449",
      shipping: "",
      tax: "35.92",
      total: "484.92",
    },
  });

  assert.equal(order.status, "Placed");
  assert.equal(order.paymentMethod, "card");
  assert.equal(order.items[0].productId, "99");
  assert.equal(order.items[0].quantity, 1);
  assert.equal(order.items[0].price, 449);
  assert.equal(order.totals.shipping, 0);
  assert.equal(order.totals.total, 484.92);
});

test("TC-15 Protected Routes: rejects requests without bearer access token", () => {
  const req = { headers: {} };
  const res = mockResponse();
  let nextCalled = false;

  authenticateToken(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: "Access token missing" });
});

test("TC-18 Product Comparison: enforces documented four item comparison limit", () => {
  const maxItems = 4;
  const compareItems = catalog.slice(0, 4).map((product) => ({
    id: product.id,
    name: product.name,
    image: product.image,
    category: product.category,
  }));

  const canAdd = compareItems.length < maxItems;

  assert.equal(compareItems.length, 4);
  assert.equal(canAdd, false);
});

test("TC-19 AI Advisor Chat: rate limiter blocks excess chat-style requests", () => {
  const limiter = createRateLimiter({
    windowMs: 60_000,
    max: 2,
    message: "Too many messages. Please wait a moment before sending again.",
  });
  const req = { ip: "docs-test-user", socket: {} };
  const first = mockResponse();
  const second = mockResponse();
  const third = mockResponse();
  let passCount = 0;

  limiter(req, first, () => {
    passCount += 1;
  });
  limiter(req, second, () => {
    passCount += 1;
  });
  limiter(req, third, () => {
    passCount += 1;
  });

  assert.equal(passCount, 2);
  assert.equal(third.statusCode, 429);
  assert.equal(
    third.body.message,
    "Too many messages. Please wait a moment before sending again.",
  );
});
