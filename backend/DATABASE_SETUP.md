# Database Setup Guide

This guide explains how to set up MongoDB for the backend API.

## Option 1: MongoDB Atlas (Cloud - Recommended for Production)

### Step 1: Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (free tier available)

### Step 2: Create Database User

1. Go to **Database Access** → **Add New Database User**
2. Create a username and password
3. Set privileges to **Read and write to any database**

### Step 3: Whitelist IP Address

1. Go to **Network Access** → **Add IP Address**
2. For development: Click **Allow Access from Anywhere** (0.0.0.0/0)
3. For production: Add specific IP addresses

### Step 4: Get Connection String

1. Go to **Database** → Click **Connect**
2. Select **Connect your application**
3. Copy the connection string
   - Format: `mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority`

### Step 5: Configure .env File

Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.qtjnojc.mongodb.net/?retryWrites=true&w=majority
DB_NAME=my-app
PORT=3001
NODE_ENV=development
```

**Important:** Replace `your_username` and `your_password` with your actual credentials.

## Option 2: Local MongoDB (Development)

### Step 1: Install MongoDB

**macOS:**

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**

- Download from [MongoDB Downloads](https://www.mongodb.com/try/download/community)
- Run the installer
- MongoDB will start as a service

**Linux (Ubuntu/Debian):**

```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Step 2: Configure .env File

Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=mongodb://localhost:27017
DB_NAME=my-app
PORT=3001
NODE_ENV=development
```

## Step 3: Seed the Database

After setting up MongoDB and configuring the `.env` file, seed the database:

```bash
cd backend
npm run seed
```

This will populate the database with sample product data.

## Verify Connection

1. Start the backend server:

   ```bash
   npm run dev
   ```

2. You should see:

   ```
   ✅ Connected to MongoDB
   🚀 Server running on http://localhost:3001
   ```

3. Test an endpoint:
   ```bash
   curl http://localhost:3001/api/products/featured
   ```

## Connection String Format

### MongoDB Atlas (Cloud)

```
mongodb+srv://username:password@cluster.mongodb.net/databaseName?retryWrites=true&w=majority
```

### Local MongoDB

```
mongodb://localhost:27017/databaseName
```

### MongoDB with Authentication (Local)

```
mongodb://username:password@localhost:27017/databaseName?authSource=admin
```

## Troubleshooting

### Connection Timeout

- Check your internet connection (for Atlas)
- Verify IP address is whitelisted in Atlas
- Check firewall settings

### Authentication Failed

- Verify username and password in connection string
- Ensure database user has proper permissions
- Check if password contains special characters (URL encode them)

### Database Not Found

- MongoDB will automatically create the database on first write
- Ensure `DB_NAME` in `.env` matches what you expect

### Port Already in Use

- Check if MongoDB is already running: `mongosh` (for local)
- For Atlas, you don't need to worry about ports

## Security Best Practices

1. **Never commit `.env` file to git** (already in `.gitignore`)
2. **Use strong passwords** for database users
3. **Restrict IP access** in production
4. **Use environment variables** instead of hardcoding credentials
5. **Rotate credentials** regularly

## Current Configuration

The database configuration is in `backend/config/database.js`:

- Reads from `process.env.MONGODB_URI`
- Falls back to `mongodb://localhost:27017` if not set
- Database name from `process.env.DB_NAME` or defaults to `my-app`

## Qdrant Vector Database (RAG Setup)

The AI advisor uses [Qdrant](https://qdrant.tech/) as a vector database to store embedded product documents and perform semantic retrieval. It is separate from MongoDB and is only needed for the AI advisor chat feature.

### Option 1: Local Qdrant (Docker - Recommended)

```bash
docker run -p 6333:6333 qdrant/qdrant
```

### Option 2: Qdrant Cloud

1. Create a cluster at [Qdrant Cloud](https://cloud.qdrant.io/)
2. Copy the cluster URL (e.g. `https://xxx.aws.cloud.qdrant.io`)
3. Generate an API key from the dashboard

### Configure .env File

Add the following to `backend/.env`:

```env
# Qdrant vector store (RAG)
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=
QDRANT_COLLECTION=specsmart_products

# RAG retrieval tuning
RAG_TOP_K=8
RAG_MIN_SCORE=0.3
QDRANT_TIMEOUT_MS=3000

# Gemini (chat + embeddings)
GEMINI_API_KEY=your-google-ai-studio-api-key
EMBEDDING_MODEL=gemini-embedding-2
```

### Build the Vector Index

The index is created and verified automatically on the first chat message, and rebuilt when the product count changes. To pre-build it from the current catalogue:

```bash
cd backend
npm run index:vectors
```

You can also force a rebuild through the admin API: `POST /api/chatbot/reindex` (requires an admin JWT).

### Verify the Vector Store

```bash
curl http://localhost:3001/api/chatbot/status
```

The response includes a `vectorSearch` block with the collection name and point count, e.g.:

```
{ "configured": true, "vectorSearch": { "enabled": true, "collection": "specsmart_products", "points": 28, "url": "http://localhost:6333" } }
```

### Troubleshooting

- **Connection Refused** - Ensure Qdrant is running (`docker run -p 6333:6333 qdrant/qdrant`) or that `QDRANT_URL`/`QDRANT_API_KEY` point to your cloud cluster.
- **Chatbot still works without Qdrant** - This is expected: retrieval falls back to keyword search when the vector store is unreachable.
- **Index out of date** - Run `npm run index:vectors` or use `POST /api/chatbot/reindex` to rebuild it.
