# Backend API

Node.js/Express backend with MongoDB for the e-commerce application.

## Features

- ✅ Featured Products API
- ✅ Popular Products API
- ✅ Search Products API
- ✅ Products Page API (with filters)
- ✅ Category Page API
- ✅ Get Product by ID API

## Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)

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

3. Update `.env` with your MongoDB connection string:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/my-app
NODE_ENV=development
```

### Database Setup

1. Start MongoDB (if running locally):
```bash
mongod
```

2. Seed the database with mock data:
```bash
npm run seed
```

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

## Project Structure

```
backend/
├── config/
│   └── database.js       # MongoDB connection
├── models/
│   └── Product.js        # Product model with database operations
├── routes/
│   └── products.js       # Product API routes
├── scripts/
│   ├── seed.js           # Database seed script
│   └── mock-data.js      # Mock product data
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

