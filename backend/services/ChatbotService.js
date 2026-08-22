import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDB } from "../config/database.js";
import { searchProductsPipeline } from "./ProductSearchService.js";
import {
  formatProductForPrompt,
  vectorStoreService,
  DEFAULT_TOP_K,
} from "./VectorStoreService.js";

const SYSTEM_PROMPT = `You are a helpful customer support assistant for SpecSmart, a premium electronics store.
Your job is to help customers find products, understand specifications, compare options, and get pricing information.

STRICT RULES:
1. ONLY answer questions using the product database provided below. Never invent products, prices, or policies.
2. If the requested information is not in the database, respond exactly: "I could not find that information in the company database."
3. Never hallucinate warranties, return policies, promotions, or specifications not present in the data.
4. Keep responses professional, helpful, and concise (2-4 sentences when possible).
5. When mentioning a specific product, always include its ID in this exact format: [Product ID: <id>]
   This allows us to show the customer a direct link to the product.
6. Format all prices with a dollar sign (e.g., $999).
7. If asked about topics unrelated to our products, politely redirect to product-related questions.

The products below were retrieved as the most relevant matches for the customer's latest question.
Only these products (and none others) are currently in the database context.

COMPANY PRODUCT DATABASE:
`;

const MAX_HISTORY_TURNS = 10; // 10 exchanges = 20 messages
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
const CONTEXT_TTL_MS = 5 * 60 * 1000; // 5 minutes cache for the raw product list
const MAX_MESSAGE_LENGTH = 1000;

class ChatbotService {
  constructor() {
    this._genAI = null;
    this._sessions = new Map(); // sessionId -> { history, lastActivity, lastResponse }
    this._productsCache = null; // raw product array (lexical fallback source)
    this._productsCacheAt = 0;
    this._vectorIndexing = null; // in-flight ensureIndexed() promise guard

    // Purge stale sessions every 10 minutes.
    // unref() keeps the timer from holding the event loop open in scripts/tests.
    setInterval(() => this._purgeStaleSessions(), 10 * 60 * 1000).unref();
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  // Returns the SDK client (no network call — just caches the JS object).
  _getGenAI() {
    if (this._genAI) return this._genAI;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
    this._genAI = new GoogleGenerativeAI(apiKey);
    return this._genAI;
  }

  // systemInstruction MUST go on getGenerativeModel, not startChat.
  _buildModel(systemInstruction) {
    return this._getGenAI().getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction,
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        // This model uses internal thinking tokens — the budget must be large
        // enough to cover both thinking AND the visible response.
        maxOutputTokens: 8192,
      },
    });
  }

  // Raw product list, cached briefly so the lexical fallback and hydration
  // don't hammer MongoDB on every message.
  async _getProductsCache() {
    const now = Date.now();
    if (this._productsCache && now - this._productsCacheAt < CONTEXT_TTL_MS) {
      return this._productsCache;
    }
    const db = getDB();
    this._productsCache = await db.collection("products").find({}).toArray();
    this._productsCacheAt = now;
    return this._productsCache;
  }

  // Hydrate product docs from the DB, preserving the order of the ids.
  async _hydrateProducts(ids) {
    if (!ids.length) return [];
    const db = getDB();
    const products = await db
      .collection("products")
      .find({ id: { $in: ids } })
      .toArray();
    const byId = new Map(products.map((p) => [p.id, p]));
    return ids.map((id) => byId.get(id)).filter(Boolean);
  }

  // Lazily make sure the Qdrant index exists and matches the catalog.
  // Errors are swallowed here — retrieval still falls back to lexical search.
  async _ensureVectorIndex() {
    if (this._vectorIndexing) return this._vectorIndexing;
    this._vectorIndexing = vectorStoreService
      .ensureIndexed()
      .catch((error) => {
        console.warn("[chatbot] vector index not ready:", error.message);
      })
      .finally(() => {
        this._vectorIndexing = null;
      });
    return this._vectorIndexing;
  }

  /**
   * RAG retrieval: returns the most relevant products for the user's message.
   *  1. Semantic — embed the query and search the Qdrant vector index.
   *  2. Lexical  — fall back to the existing keyword search pipeline.
   *  3. Empty    — nothing matched; the model replies with the not-found line.
   */
  async _retrieveContext(userMessage) {
    // 1) Semantic retrieval through the Qdrant vector index.
    try {
      await this._ensureVectorIndex();
      const matches = await vectorStoreService.searchProductIds(userMessage);
      if (matches.length > 0) {
        const products = await this._hydrateProducts(
          matches.map((m) => m.productId),
        );
        if (products.length > 0) {
          return { products, method: "semantic" };
        }
      }
    } catch (error) {
      console.warn(
        "[chatbot] semantic retrieval unavailable, using lexical fallback:",
        error.message,
      );
    }

    // 2) Lexical fallback through the existing keyword search pipeline.
    try {
      const all = await this._getProductsCache();
      const ranked = searchProductsPipeline(all, userMessage).products.slice(
        0,
        DEFAULT_TOP_K,
      );
      if (ranked.length > 0) {
        return { products: ranked, method: "lexical" };
      }
    } catch (error) {
      console.warn("[chatbot] lexical retrieval failed:", error.message);
    }

    // 3) No context available.
    return { products: [], method: "none" };
  }

  // Combine the current message with the previous user turns (if any) so the
  // retriever has the conversational context needed for follow-up questions.
  _buildRetrievalQuery(session, userMessage) {
    const recentUserTurns = session.history
      .filter((message) => message.role === "user")
      .slice(-2)
      .map((message) => message.parts.map((part) => part.text).join(" "));
    return [...recentUserTurns, userMessage].join("\n");
  }

  _getSession(sessionId) {
    if (!this._sessions.has(sessionId)) {
      this._sessions.set(sessionId, {
        history: [],
        lastActivity: Date.now(),
        lastResponse: "",
      });
    }
    const session = this._sessions.get(sessionId);
    session.lastActivity = Date.now();
    return session;
  }

  _purgeStaleSessions() {
    const cutoff = Date.now() - SESSION_TTL_MS;
    for (const [id, session] of this._sessions.entries()) {
      if (session.lastActivity < cutoff) this._sessions.delete(id);
    }
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /**
   * Async generator that yields text chunks from the Gemini stream.
   * Persists the exchange to session history when complete.
   */
  async *chatStream(sessionId, userMessage) {
    if (!userMessage || userMessage.length > MAX_MESSAGE_LENGTH) {
      throw new Error("Invalid message");
    }

    const session = this._getSession(sessionId);
    // Retrieve against the last few user turns so follow-up questions like
    // "what about the RAM on that one?" still find the referenced product.
    const retrievalQuery = this._buildRetrievalQuery(session, userMessage);
    const { products } = await this._retrieveContext(retrievalQuery);
    const context = products.map(formatProductForPrompt).join("\n\n---\n\n");
    const model = this._buildModel(SYSTEM_PROMPT + context);

    // Trim history to prevent context overflow.
    if (session.history.length > MAX_HISTORY_TURNS * 2) {
      session.history = session.history.slice(-MAX_HISTORY_TURNS * 2);
    }

    const chat = model.startChat({ history: session.history });

    const result = await chat.sendMessageStream(userMessage);

    let fullResponse = "";
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        fullResponse += text;
        yield text;
      }
    }

    // Append completed exchange to history.
    session.history.push(
      { role: "user", parts: [{ text: userMessage }] },
      { role: "model", parts: [{ text: fullResponse }] },
    );
    session.lastResponse = fullResponse;
  }

  /**
   * After a stream completes, extract products cited in the response.
   */
  async getSourceProducts(sessionId) {
    const session = this._sessions.get(sessionId);
    if (!session?.lastResponse) return [];

    const matches = [...session.lastResponse.matchAll(/\[Product ID:\s*([^\]]+)\]/gi)];
    const ids = [...new Set(matches.map((m) => m[1].trim()))];
    if (ids.length === 0) return [];

    try {
      const db = getDB();
      return await db
        .collection("products")
        .find({ id: { $in: ids } })
        .project({ _id: 0, id: 1, name: 1, brand: 1, price: 1, image: 1, category: 1 })
        .toArray();
    } catch {
      return [];
    }
  }

  clearSession(sessionId) {
    this._sessions.delete(sessionId);
  }

  /**
   * Force-rebuild the Qdrant vector index (admin use).
   */
  async reindex() {
    this._productsCache = null;
    this._productsCacheAt = 0;
    return vectorStoreService.reindex();
  }

  /** Health probe for the /status endpoint. Never throws. */
  async getStatus() {
    return {
      configured: Boolean(process.env.GEMINI_API_KEY),
      vectorSearch: await vectorStoreService.getStatus(),
    };
  }

  get activeSessions() {
    return this._sessions.size;
  }
}

// Singleton shared across all requests.
export const chatbotService = new ChatbotService();
