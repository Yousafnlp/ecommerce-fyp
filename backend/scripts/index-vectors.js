import { connectDB, closeDB } from "../config/database.js";
import { vectorStoreService } from "../services/VectorStoreService.js";

/**
 * CLI: rebuild the Qdrant vector index from the current product catalog.
 *
 *   npm run index:vectors
 *
 * Requires:
 *   - A running Qdrant instance (default http://localhost:6333)
 *   - GEMINI_API_KEY (used to embed product documents)
 */
async function indexVectors() {
  await connectDB();
  const result = await vectorStoreService.reindex();
  console.log(
    `✅ Vector index rebuilt: ${result.productCount} products → ${result.vectorCount} points in "${result.collection}"`,
  );
  await closeDB();
}

if (process.argv[1] && import.meta.url.includes(process.argv[1].replace(/\\/g, "/"))) {
  indexVectors()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Vector indexing failed:", error.message);
      process.exit(1);
    });
}

export { indexVectors };
