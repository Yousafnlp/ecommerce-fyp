import test from "node:test";
import assert from "node:assert/strict";

import {
  buildProductDocument,
  formatProductForPrompt,
  cosineSimilarity,
  rankByCosine,
  productIdToPointId,
  flattenSpecifications,
} from "../services/VectorStoreService.js";
import { searchProductsPipeline } from "../services/ProductSearchService.js";

const catalog = [
  {
    id: "iphone-15-pro",
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
      display: { refreshRate: "120Hz", size: "6.1\"" },
    },
  },
  {
    id: "sony-xm5",
    name: "Sony WH-1000XM5",
    brand: "Sony",
    category: "headphone",
    price: 399,
    rating: 4.7,
    reviewCount: 980,
    inStock: false,
    description: "Wireless noise cancelling headphones with long battery life.",
    features: ["audio", "noise cancellation", "battery"],
    specifications: { battery: "30 hours", driverSize: "30mm" },
  },
];

test("RAG: buildProductDocument includes name, brand, category and flattened specs", () => {
  const doc = buildProductDocument(catalog[0]);

  assert.match(doc, /Product: Apple iPhone 15 Pro/);
  assert.match(doc, /Brand: Apple/);
  assert.match(doc, /Category: smartphone/);
  assert.match(doc, /display.refreshRate: 120Hz/);
  assert.match(doc, /ram: 8GB/);

  // Every spec value should be searchable text.
  const sonyDoc = buildProductDocument(catalog[1]);
  assert.match(sonyDoc, /driverSize: 30mm/);
});

test("RAG: flattenSpecifications handles nested objects", () => {
  const lines = flattenSpecifications({
    display: { refreshRate: "120Hz", size: "6.1\"" },
    ram: "8GB",
  });
  assert.deepEqual(lines, [
    "display.refreshRate: 120Hz",
    'display.size: 6.1"',
    "ram: 8GB",
  ]);
});

test("RAG: formatProductForPrompt keeps the [Product ID] contract and price", () => {
  const text = formatProductForPrompt(catalog[1]);

  assert.match(text, /\[Product ID: sony-xm5\]/);
  assert.match(text, /\$399/);
  assert.match(text, /In Stock: No/);
});

test("RAG: cosineSimilarity returns 1 for identical vectors and 0 for orthogonal", () => {
  assert.equal(cosineSimilarity([1, 2, 3], [1, 2, 3]), 1);
  assert.ok(Math.abs(cosineSimilarity([1, 0, 0], [0, 1, 0])) < 1e-12);
  assert.equal(cosineSimilarity([0, 0], [1, 1]), 0);
  assert.equal(cosineSimilarity([1, 2], [1, 2, 3]), 0); // length mismatch
});

test("RAG: rankByCosine orders by score desc and applies the minimum score", () => {
  const query = [1, 0, 0];
  const vectors = [
    { productId: "a", vector: [0, 1, 0] }, // 0.0
    { productId: "b", vector: [1, 0, 0] }, // 1.0
    { productId: "c", vector: [0.5, 0.5, 0] }, // ~0.707
  ];

  const ranked = rankByCosine(query, vectors, 0.5);
  assert.deepEqual(
    ranked.map((r) => r.productId),
    ["b", "c"],
  );
  assert.ok(ranked[0].score > ranked[1].score);
});

test("RAG: productIdToPointId is deterministic and UUID-shaped", () => {
  const first = productIdToPointId("iphone-15-pro");
  const second = productIdToPointId("iphone-15-pro");

  assert.equal(first, second);
  assert.match(first, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  assert.notEqual(first, productIdToPointId("sony-xm5"));
});

test("RAG: lexical fallback path returns top-K ranked products for the prompt", () => {
  // Mirrors ChatbotService._retrieveContext step 2: keyword pipeline → slice.
  const { products } = searchProductsPipeline(
    catalog,
    "wireless headphones with noise cancellation",
  );
  const topK = products.slice(0, 8);

  assert.ok(topK.length > 0);
  assert.equal(topK[0].id, "sony-xm5");
  assert.match(formatProductForPrompt(topK[0]), /\[Product ID: sony-xm5\]/);
});
