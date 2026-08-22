# Frontend-Backend Integration Guide

This document explains how the frontend integrates with the backend API.

## Setup

### 1. Backend Setup

First, ensure the backend is running:

```bash
cd backend
npm install
npm run seed  # Seed the database
npm run dev   # Start the backend server (runs on http://localhost:3001)
```

The AI advisor chat additionally requires:
- A `GEMINI_API_KEY` in `backend/.env` (chat + embeddings)
- A running Qdrant vector store (default `http://localhost:6333`) — start with `docker run -p 6333:6333 qdrant/qdrant`, or set `QDRANT_URL`/`QDRANT_API_KEY` for a managed cluster

The vector index auto-builds on the first chat message; it can also be pre-built with `npm run index:vectors` (in `backend/`).

### 2. Frontend Configuration

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

For production, update this to your production backend URL.

### 3. Start Frontend

```bash
npm install
npm run dev  # Start Next.js dev server (runs on http://localhost:3000)
```

## Architecture

### API Client (`lib/api-client.ts`)

The API client handles all communication with the backend:

- Generic `apiFetch` function with error handling
- Type-safe API methods for all product endpoints
- Automatic query string building
- Consistent error handling

### Database Layer (`lib/database.ts`)

The Database class provides a clean interface that:

- Uses the API client to fetch data from the backend
- Maintains the same interface as before (no component changes needed)
- Handles errors gracefully
- Optimizes category requests by using dedicated endpoints when possible

## API Endpoints Used

| Frontend Method                   | Backend Endpoint                       | Description                              |
| --------------------------------- | -------------------------------------- | ---------------------------------------- |
| `getFeaturedProducts()`           | `GET /api/products/featured`           | Products with score >= 90 (limit 4)      |
| `getPopularProducts()`            | `GET /api/products/popular`            | Products sorted by reviewCount (limit 6) |
| `searchProducts(query)`           | `GET /api/products/search?q=query`     | Search products by query                 |
| `getProducts(filters)`            | `GET /api/products?...`                | Get products with filters                |
| `getProductsByCategory(category)` | `GET /api/products/category/:category` | Get products by category                 |
| `getProductById(id)`              | `GET /api/products/:id`                | Get single product                       |
| `chat(message, sessionId)`        | `POST /api/chatbot/chat`               | Stream a catalogue-grounded AI reply (SSE, RAG retrieval) |
| `clearSession(sessionId)`         | `DELETE /api/chatbot/session`          | Clear an in-memory chat session          |

## Error Handling

The frontend gracefully handles API errors:

- Failed requests return empty arrays (`[]`) or `null`
- Errors are logged to console for debugging
- Components continue to work even if API is unavailable

## Testing the Integration

1. **Start both servers:**

   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend
   npm run dev
   ```

2. **Test endpoints:**

   - Visit `http://localhost:3000` - Should show featured and popular products
   - Visit `http://localhost:3000/products` - Should show all products
   - Visit `http://localhost:3000/search?q=iphone` - Should search products
   - Visit `http://localhost:3000/products/smartphone` - Should show smartphones
   - Open the AI advisor chat widget and ask a product question - the reply should stream in and cited products should appear as reference cards

3. **Check browser console** for any API errors

## Troubleshooting

### CORS Issues

If you see CORS errors, ensure the backend has CORS enabled (it's already configured in `backend/server.js`).

### Connection Refused

- Verify backend is running on port 3001
- Check `NEXT_PUBLIC_API_URL` environment variable
- Verify MongoDB is running (for backend)

### Empty Results

- Ensure database is seeded: `cd backend && npm run seed`
- Check backend logs for errors
- Verify API endpoints return data: `curl http://localhost:3001/api/products/featured`

### AI Advisor Chat Not Responding

- Ensure `GEMINI_API_KEY` is set in `backend/.env`
- Check the vector store is reachable: `curl http://localhost:3001/api/chatbot/status` (the advisor falls back to keyword search if Qdrant is down)
- Verify Qdrant is running: `docker run -p 6333:6333 qdrant/qdrant`, or rebuild the index with `npm run index:vectors`

### Type Errors

- Ensure TypeScript types match between frontend and backend
- Run `npm run build` to check for type errors

## Production Deployment

1. **Set environment variables:**

   - `NEXT_PUBLIC_API_URL` - Your production API URL
   - Backend `MONGODB_URI` - Your production MongoDB URI
   - Backend `GEMINI_API_KEY` - Google AI Studio key for chat and embeddings
   - Backend `QDRANT_URL` - URL of your production Qdrant cluster (e.g. `https://xxx.cloud.qdrant.io`)
   - Backend `QDRANT_API_KEY` - API key for the Qdrant cluster

2. **Build frontend:**

   ```bash
   npm run build
   npm start
   ```

3. **Deploy backend:**
   - Deploy to your hosting platform (Heroku, Railway, etc.)
   - Ensure MongoDB is accessible
   - Update frontend `NEXT_PUBLIC_API_URL` to point to deployed backend
