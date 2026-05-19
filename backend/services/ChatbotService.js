import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDB } from '../config/database.js';

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

COMPANY PRODUCT DATABASE:
`;

const MAX_HISTORY_TURNS = 10;  // 10 exchanges = 20 messages
const SESSION_TTL_MS = 30 * 60 * 1000;   // 30 minutes
const CONTEXT_TTL_MS = 5 * 60 * 1000;    // 5 minutes cache
const MAX_MESSAGE_LENGTH = 1000;

class ChatbotService {
  constructor() {
    this._genAI = null;
    this._sessions = new Map();     // sessionId -> { history, lastActivity, lastResponse }
    this._productContext = null;
    this._contextBuiltAt = 0;

    // Purge stale sessions every 10 minutes.
    setInterval(() => this._purgeStaleSessions(), 10 * 60 * 1000);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  // Returns the SDK client (no network call — just caches the JS object).
  _getGenAI() {
    if (this._genAI) return this._genAI;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');
    this._genAI = new GoogleGenerativeAI(apiKey);
    return this._genAI;
  }

  // systemInstruction MUST go on getGenerativeModel, not startChat.
  _buildModel(systemInstruction) {
    return this._getGenAI().getGenerativeModel({
      model: 'gemini-flash-latest',
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

  async _buildProductContext() {
    const now = Date.now();
    if (this._productContext && now - this._contextBuiltAt < CONTEXT_TTL_MS) {
      return this._productContext;
    }

    const db = getDB();
    const products = await db.collection('products').find({}).toArray();

    this._productContext = products
      .map((p) =>
        [
          `[Product ID: ${p.id}]`,
          `Name: ${p.name}`,
          `Brand: ${p.brand}`,
          `Category: ${p.category}`,
          `Price: $${p.price}${p.originalPrice ? ` (original $${p.originalPrice})` : ''}`,
          `Rating: ${p.rating}/5 (${p.reviewCount} reviews)`,
          `In Stock: ${p.inStock ? 'Yes' : 'No'}`,
          `Description: ${p.description || 'N/A'}`,
          `Features: ${(p.features || []).join('; ') || 'N/A'}`,
          `Specifications: ${JSON.stringify(p.specifications || {})}`,
        ].join('\n'),
      )
      .join('\n\n---\n\n');

    this._contextBuiltAt = now;
    return this._productContext;
  }

  _getSession(sessionId) {
    if (!this._sessions.has(sessionId)) {
      this._sessions.set(sessionId, {
        history: [],
        lastActivity: Date.now(),
        lastResponse: '',
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
      throw new Error('Invalid message');
    }

    const context = await this._buildProductContext();
    const model = this._buildModel(SYSTEM_PROMPT + context);
    const session = this._getSession(sessionId);

    // Trim history to prevent context overflow.
    if (session.history.length > MAX_HISTORY_TURNS * 2) {
      session.history = session.history.slice(-MAX_HISTORY_TURNS * 2);
    }

    const chat = model.startChat({ history: session.history });

    const result = await chat.sendMessageStream(userMessage);

    let fullResponse = '';
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        fullResponse += text;
        yield text;
      }
    }

    // Append completed exchange to history.
    session.history.push(
      { role: 'user', parts: [{ text: userMessage }] },
      { role: 'model', parts: [{ text: fullResponse }] },
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
        .collection('products')
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
   * Force-rebuild the product context cache (admin use).
   */
  async reindex() {
    this._productContext = null;
    this._contextBuiltAt = 0;
    const context = await this._buildProductContext();
    const count = (context.match(/\[Product ID:/g) || []).length;
    return { productCount: count, reindexedAt: new Date().toISOString() };
  }

  get activeSessions() {
    return this._sessions.size;
  }
}

// Singleton shared across all requests.
export const chatbotService = new ChatbotService();
