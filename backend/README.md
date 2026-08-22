# Backend API

Node.js/Express backend with MongoDB for the e-commerce application.

## Features

- ✅ Featured Products API
- ✅ Popular Products API
- ✅ Search Products API
- ✅ Products Page API (with filters)
- ✅ Category Page API
- ✅ Get Product by ID API
- ✅ AI Advisor Chat API (streamed Gemini replies)
- ✅ RAG pipeline with semantic retrieval (Qdrant vector index + Gemini embeddings)
- ✅ Admin vector index rebuild endpoint

## Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- Qdrant (vector database for RAG) — see [Vector Index Setup](#vector-index-setup)
- Gemini API key (for AI advisor chat and product embeddings)

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB connection string and AI services:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/my-app
NODE_ENV=development

# Gemini (chat + embeddings)
GEMINI_API_KEY=your-google-ai-studio-api-key
EMBEDDING_MODEL=gemini-embedding-2

# Qdrant vector store (RAG)
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=
QDRANT_COLLECTION=specsmart_products

# RAG retrieval tuning
RAG_TOP_K=8
RAG_MIN_SCORE=0.3
```
See `.env.example` for all available options.

### Database Setup

1. Start MongoDB (if running locally):
```bash
mongod
```

2. Seed the database with mock data:
```bash
npm run seed
```

### Vector Index Setup (RAG)

The AI advisor uses retrieval-augmented generation: product documents are embedded with Gemini and stored in a Qdrant vector index, then the most relevant products are retrieved for each chat message.

1. Start Qdrant (Docker):
```bash
docker run -p 6333:6333 qdrant/qdrant
```
For a managed cluster, set `QDRANT_URL` and `QDRANT_API_KEY` in `.env` instead.

2. (Optional) Pre-build the vector index from the current catalogue:
```bash
npm run index:vectors
```
The index is also created and verified automatically on the first chat message, and is rebuilt when the product count in the catalogue changes. `POST /api/chatbot/reindex` forces a rebuild as an admin.

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### Health Check
- **GET** `/health`
  - Returns server status

### Featured Products
- **GET** `/api/products/featured`
  - Returns products with score >= 90 (limit: 4)
  - Response: `{ success: true, data: [...], count: number }`

### Popular Products
- **GET** `/api/products/popular`
  - Returns products sorted by reviewCount (limit: 6)
  - Response: `{ success: true, data: [...], count: number }`

### Search Products
- **GET** `/api/products/search?q=query`
  - Searches products by name, brand, description, or features
  - Query parameter: `q` (required) - search query string
  - Response: `{ success: true, data: [...], count: number, query: string }`

### Get Products (with filters)
- **GET** `/api/products`
  - Query parameters:
    - `category` - Filter by category
    - `brand` - Filter by brand (comma-separated or array)
    - `minPrice` - Minimum price
    - `maxPrice` - Maximum price
    - `rating` - Minimum rating
    - `inStock` - Filter by stock status (true/false)
    - `sortBy` - Sort field (price, rating, score, newest)
    - `sortOrder` - Sort order (asc, desc)
  - Response: `{ success: true, data: [...], count: number, filters: {...} }`

### Get Products by Category
- **GET** `/api/products/category/:category`
  - Returns all products in a specific category
  - Response: `{ success: true, data: [...], count: number, category: string }`

### Get Product by ID
- **GET** `/api/products/:id`
  - Returns a single product by ID
  - Response: `{ success: true, data: {...} }`
  - Error: `{ success: false, message: "Product not found" }` (404)

### Chat with the AI Advisor (RAG)
- **POST** `/api/chatbot/chat`
  - Streams a catalogue-grounded Gemini reply as Server-Sent Events (SSE)
  - Body: `{ message: string, sessionId: string }` (message max 1000 characters)
  - Retrieval is semantic (Qdrant vector index) with an automatic keyword-search fallback
  - Emits `data:` events: `{ type: "chunk", text }` and a final `{ type: "done", sources }` with cited products
  - Rate limited to 30 messages per minute
  - Errors: `400` for missing/invalid `message` or `sessionId`

### Clear Chat Session
- **DELETE** `/api/chatbot/session`
  - Body: `{ sessionId: string }` (optional)
  - Clears the in-memory conversation history for a session
  - Response: `{ success: true, data: { cleared: true } }`

### Rebuild Vector Index (Admin)
- **POST** `/api/chatbot/reindex`
  - Requires a valid JWT access token (`Authorization: Bearer <token>`) and admin role
  - Rebuilds the Qdrant vector index from the current product catalogue
  - Response: `{ success: true, data: { collection, productCount, vectorCount, reindexedAt } }`
  - Errors: `403` for non-admin users

### Chatbot Status
- **GET** `/api/chatbot/status`
  - Health probe for the chatbot and vector store
  - Response: `{ success: true, data: { configured, vectorSearch: {...}, activeSessions } }`

## Example Requests

### Get Featured Products
```bash
curl http://localhost:3001/api/products/featured
```

### Get Popular Products
```bash
curl http://localhost:3001/api/products/popular
```

### Search Products
```bash
curl "http://localhost:3001/api/products/search?q=iphone"
```

### Get Products with Filters
```bash
curl "http://localhost:3001/api/products?category=smartphone&minPrice=500&maxPrice=1500&sortBy=price&sortOrder=asc"
```

### Get Products by Category
```bash
curl http://localhost:3001/api/products/category/laptop
```

### Get Product by ID
```bash
curl http://localhost:3001/api/products/1
```

### Chat with the AI Advisor
```bash
curl -N -X POST http://localhost:3001/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"best phone under 800","sessionId":"demo-session"}'
```

### Chatbot Status
```bash
curl http://localhost:3001/api/chatbot/status
```

### Rebuild Vector Index (Admin)
```bash
curl -X POST http://localhost:3001/api/chatbot/reindex \
  -H "Authorization: Bearer <jwt-access-token>"
```

## RAG Architecture

The AI advisor pipeline (`backend/services/ChatbotService.js`) works as follows:

1. **Embedding** (`EmbeddingService.js`) — product documents (name, brand, category, description, features, specifications) and chat queries are embedded with the Gemini `gemini-embedding-2` model (768 dimensions, batched).
2. **Vector index** (`VectorStoreService.js`) — the embedded products are stored as points in the Qdrant collection (`specsmart_products`, cosine distance) with deterministic UUIDs derived from product ids, so re-indexing never duplicates points. The index is verified against the catalogue on a TTL and rebuilt automatically when the product count changes.
3. **Retrieval** — each chat message (combined with the last two user turns for follow-up context) is embedded and searched in Qdrant (`RAG_TOP_K=8` results, `RAG_MIN_SCORE=0.3` minimum similarity). If the vector store is unreachable or returns nothing, retrieval falls back to the existing keyword search pipeline; if that also matches nothing, the model replies with the not-found message.
4. **Grounding** — the retrieved products are formatted and injected into the Gemini system prompt, so the reply can only reference products that exist in the catalogue. Product ids cited as `[Product ID: <id>]` are extracted into the `sources` payload sent with the `done` SSE event.

Sessions are kept in memory (30-minute TTL, 10-turn history) and cleared with `DELETE /api/chatbot/session`.

## Project Structure

```
backend/
├── config/
│   └── database.js       # MongoDB connection
├── models/
│   └── Product.js        # Product model with database operations
├── routes/
│   ├── products.js       # Product API routes
│   ├── auth.js           # Authentication routes
│   ├── users.js          # User routes (cart, wishlist, orders)
│   └── chatbot.js        # Chatbot / RAG API routes
├── services/
│   ├── ProductSearchService.js  # Keyword search pipeline (RAG fallback)
│   ├── EmbeddingService.js      # Gemini text embeddings
│   ├── VectorStoreService.js    # Qdrant vector index and semantic search
│   └── ChatbotService.js        # RAG retrieval + Gemini chat streaming
├── middleware/
│   ├── authenticateToken.js     # JWT access token checks
│   └── rateLimiter.js           # Per-route rate limiting
├── scripts/
│   ├── seed.js           # Database seed script
│   ├── index-vectors.js  # Rebuild the Qdrant vector index (npm run index:vectors)
│   └── mock-data.js      # Mock product data
├── tests/
│   ├── rag-retrieval.test.js    # RAG ranking / document builder unit tests
│   └── specsmart-docs.test.js
├── server.js             # Express server setup
├── package.json
└── README.md
```

## Error Handling

All endpoints return JSON responses with a consistent structure:
- Success: `{ success: true, data: ..., ... }`
- Error: `{ success: false, message: "...", error: "..." }`

## CORS

CORS is enabled by default. Update `server.js` to configure specific origins if needed.

