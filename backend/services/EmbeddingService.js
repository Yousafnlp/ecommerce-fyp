import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_MODEL = "gemini-embedding-2"; // recommended embedding model
export const EMBEDDING_DIMENSIONS = 768; // truncated from 3072 via outputDimensionality
const BATCH_SIZE = 100; // max requests per batchEmbedContents call

/**
 * Thin wrapper around the Gemini text-embedding API.
 * Used by the RAG pipeline to embed product documents and chat queries.
 */
class EmbeddingService {
  constructor() {
    this._genAI = null;
  }

  get model() {
    return process.env.EMBEDDING_MODEL || DEFAULT_MODEL;
  }

  _getGenAI() {
    if (this._genAI) return this._genAI;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
    this._genAI = new GoogleGenerativeAI(apiKey);
    return this._genAI;
  }

  /** Embed a single text string. Returns an array of numbers. */
  async embedText(text) {
    const model = this._getGenAI().getGenerativeModel({ model: this.model });
    const result = await model.embedContent({
      content: { role: "user", parts: [{ text }] },
      outputDimensionality: EMBEDDING_DIMENSIONS,
    });
    return result.embedding.values;
  }

  /** Embed many texts in batches. Returns an array of vectors. */
  async embedTexts(texts) {
    if (!texts.length) return [];
    const model = this._getGenAI().getGenerativeModel({ model: this.model });
    const vectors = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      const result = await model.batchEmbedContents({
        requests: batch.map((text) => ({
          content: { role: "user", parts: [{ text }] },
          outputDimensionality: EMBEDDING_DIMENSIONS,
        })),
      });
      for (const embedding of result.embeddings) {
        vectors.push(embedding.values);
      }
    }

    return vectors;
  }
}

export const embeddingService = new EmbeddingService();
