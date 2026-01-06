import { connectDB, closeDB } from '../config/database.js';
import { Product } from '../models/Product.js';
import { mockProducts } from './mock-data.js';

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');
    
    // Connect to database
    await connectDB();
    
    // Delete existing products
    console.log('🗑️  Deleting existing products...');
    await Product.deleteAll();
    console.log('✅ Existing products deleted');
    
    // Transform products for MongoDB
    const productsToInsert = mockProducts.map(product => ({
      ...product,
      // Ensure dates are properly formatted
      createdAt: product.createdAt instanceof Date ? product.createdAt : new Date(product.createdAt),
      updatedAt: product.updatedAt instanceof Date ? product.updatedAt : new Date(product.updatedAt)
    }));
    
    // Insert products
    console.log(`📦 Inserting ${productsToInsert.length} products...`);
    const result = await Product.insertMany(productsToInsert);
    console.log(`✅ Successfully inserted ${result.insertedCount} products`);
    
    // Verify insertion
    const count = await Product.getCollection().countDocuments();
    console.log(`📊 Total products in database: ${count}`);
    
    console.log('✨ Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await closeDB();
  }
}

// Run seed if called directly (using a more reliable check)
if (process.argv[1] && import.meta.url.includes(process.argv[1].replace(/\\/g, '/'))) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seed script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed script failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };
