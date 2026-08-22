import { QdrantClient } from "@qdrant/js-client-rest";
import { createHash } from "node:crypto";
import { getDB } from "../config/database.js";
import { embeddingService, EMBEDDING_DIMENSIONS } from "./EmbeddingService.js";

export const COLLECTION_NAME = process.env.QDRANT_COLLECTION || "specsmart_products";
export const VECTOR_SIZE = EMBEDDING_DIMENSIONS; // gemini-embedding-2 truncated to 768 dims
export const DEFAULT_TOP_K = Number(process.env.RAG_TOP_K) || 8;
export const DEFAULT_MIN_SCORE = Number(process.env.RAG_MIN_SCORE) || 0.3;

const QDRANT_TIMEOUT_MS = Number(process.env.QDRANT_TIMEOUT_MS) || 3000;
// How long a verified vector index is trusted before re-checking the catalog.
const INDEX_VERIFY_TTL_MS = 5 * 60 * 1000;

// ─── Pure helpers (exported for unit tests) ──────────────────────────────────

/**
 * Deterministically maps a product id (e.g. "iphone-15-pro") to a valid
 * Qdrant point id (UUID format) so re-indexing never duplicates points.
 */
export function productIdToPointId(productId) {
  const hash = createHash("sha1").update(String(productId)).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

/** Flattens a (possibly nested) specifications object into readable lines. */
export function flattenSpecifications(specifications = {}) {
  const lines = [];
  const walk = (obj, prefix = "") => {
    for (const [key, value] of Object.entries(obj)) {
      const label = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === "object") walk(value, label);
      else lines.push(`${label}: ${value}`);
    }
  };
  walk(specifications);
  return lines;
}

/**
 * Builds the searchable text document used to embed a product.
 * Includes name, brand, category, description, features and every spec value,
 * so semantic search can match questions like "phone with 120Hz display".
 */
export function buildProductDocument(product) {
  const lines = [];
  if (product.name) lines.push(`Product: ${product.name}`);
  if (product.brand) lines.push(`Brand: ${product.brand}`);
  if (product.category) lines.push(`Category: ${product.category}`);
  if (product.price != null) lines.push(`Price: $${product.price}`);
  if (product.description) lines.push(`Description: ${product.description}`);
  if (product.features?.length) {
    lines.push(`Features: ${product.features.join(", ")}`);
  }
  lines.push(...flattenSpecifications(product.specifications));
  return lines.join("\n");
}

/** Formats a product for inclusion in the chatbot system prompt. */
export function formatProductForPrompt(product) {
  return [
    `[Product ID: ${product.id}]`,
    `Name: ${product.name}`,
    `Brand: ${product.brand}`,
    `Category: ${product.category}`,
    `Price: $${product.price}${product.originalPrice ? ` (original $${product.originalPrice})` : ""}`,
    `Rating: ${product.rating}/5 (${product.reviewCount} reviews)`,
    `In Stock: ${product.inStock ? "Yes" : "No"}`,
    `Description: ${product.description || "N/A"}`,
    `Features: ${(product.features || []).join("; ") || "N/A"}`,
    `Specifications: ${JSON.stringify(product.specifications || {})}`,
  ].join("\n");
}

/** Cosine similarity between two equal-length numeric vectors. */
export function cosineSimilarity(a, b) {
  if (!a?.length || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Pure in-memory semantic ranking. Returns [{ productId, score }] sorted
 * descending. Used by unit tests (the live path queries Qdrant instead).
 */
export function rankByCosine(queryVector, productVectors, minScore = 0) {
  return productVectors
    .map(({ productId, vector }) => ({
      productId,
      score: cosineSimilarity(queryVector, vector),
    }))
    .filter((result) => result.score >= minScore)
    .sort((a, b) => b.score - a.score);
}

// ─── Qdrant-backed service ───────────────────────────────────────────────────

class VectorStoreService {
  constructor() {
    this._client = null;
    this._indexVerifiedAt = 0;
    this._lastIndexedCount = 0;
  }

  get collectionName() {
    return COLLECTION_NAME;
  }

  /** Lazy Qdrant client. Connection errors surface when methods are called. */
  _getClient() {
    if (this._client) return this._client;
    const url = process.env.QDRANT_URL || "http://localhost:6333";
    this._client = new QdrantClient({
      url,
      apiKey: process.env.QDRANT_API_KEY || undefined,
      // Fail fast so the chatbot can fall back to lexical search quickly
      // when the vector store is unreachable.
      timeout: QDRANT_TIMEOUT_MS,
    });
    return this._client;
  }

  async _collectionExists() {
    const response = await this._getClient().collectionExists(COLLECTION_NAME);
    return typeof response === "boolean" ? response : Boolean(response?.exists);
  }

  async ensureCollection() {
    if (await this._collectionExists()) return;
    await this._getClient().createCollection(COLLECTION_NAME, {
      vectors: { size: VECTOR_SIZE, distance: "Cosine" },
    });
  }

  /** Upsert every product as an embedded point. Returns number of points. */
  async indexProducts(products) {
    if (!products.length) return 0;

    const documents = products.map(buildProductDocument);
    const vectors = await embeddingService.embedTexts(documents);

    await this._getClient().upsert(COLLECTION_NAME, {
      wait: true,
      points: products.map((product, index) => ({
        id: productIdToPointId(product.id),
        vector: vectors[index],
        payload: {
          id: product.id,
          name: product.name,
          category: product.category,
        },
      })),
    });

    return products.length;
  }

  /**
   * Recreates the collection and re-indexes the whole catalog.
   * This keeps the index consistent even when products are removed.
   */
  async rebuild(products) {
    const client = this._getClient();
    try {
      await client.deleteCollection(COLLECTION_NAME);
    } catch {
      // Collection may not exist yet — fine.
    }
    await this.ensureCollection();
    const count = await this.indexProducts(products);
    this._indexVerifiedAt = Date.now();
    this._lastIndexedCount = products.length;
    return count;
  }

  /**
   * Makes sure the collection exists and matches the current catalog.
   * Safe to call on every chat: after a successful verification it short-circuits
   * for INDEX_VERIFY_TTL_MS, so the hot path makes no extra network calls.
   */
  async ensureIndexed() {
    const now = Date.now();
    if (this._indexVerifiedAt && now - this._indexVerifiedAt < INDEX_VERIFY_TTL_MS) {
      return { indexed: false, productCount: this._lastIndexedCount };
    }

    await this.ensureCollection();
    const products = await getDB().collection("products").find({}).toArray();

    const pointCount = await this.getPointCount();
    if (pointCount === products.length) {
      this._indexVerifiedAt = now;
      this._lastIndexedCount = products.length;
      return { indexed: false, productCount: products.length };
    }

    const vectorCount = await this.rebuild(products);
    return { indexed: true, productCount: products.length, vectorCount };
  }

  /**
   * Semantic retrieval: embed the query, search Qdrant, and return the
   * matching product ids with their similarity scores (best first).
   */
  async searchProductIds(query, topK = DEFAULT_TOP_K, minScore = DEFAULT_MIN_SCORE) {
    const vector = await embeddingService.embedText(query);
    const results = await this._getClient().search(COLLECTION_NAME, {
      vector,
      limit: topK,
      score_threshold: minScore,
      with_payload: true,
    });
    return results
      .filter((result) => result.payload?.id)
      .map((result) => ({ productId: result.payload.id, score: result.score }));
  }

  async getPointCount() {
    const result = await this._getClient().count(COLLECTION_NAME, { exact: true });
    return Number(result.count || 0);
  }

  /** Full rebuild from the database (admin / script use). */
  async reindex() {
    const products = await getDB().collection("products").find({}).toArray();
    const vectorCount = await this.rebuild(products);
    return {
      collection: COLLECTION_NAME,
      productCount: products.length,
      vectorCount,
      reindexedAt: new Date().toISOString(),
    };
  }

  /** Health probe for the /status endpoint. Never throws. */
  async getStatus() {
    try {
      const enabled = await this._collectionExists();
      return {
        enabled,
        collection: COLLECTION_NAME,
        points: enabled ? await this.getPointCount() : 0,
        url: process.env.QDRANT_URL || "http://localhost:6333",
      };
    } catch (error) {
      return {
        enabled: false,
        collection: COLLECTION_NAME,
        points: 0,
        url: process.env.QDRANT_URL || "http://localhost:6333",
        error: error.message,
      };
    }
  }
}

export const vectorStoreService = new VectorStoreService();
