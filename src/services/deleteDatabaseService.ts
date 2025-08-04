import mongoose from 'mongoose';

/**
 * Drops the entire MongoDB database connected via the current mongoose connection.
 *
 * WARNING: This operation is irreversible and will delete all collections and data in the database.
 *
 * @returns {Promise<void>} Resolves when the database has been dropped.
 * @throws {Error} If the drop operation fails.
 *
 * @example
 * await deleteDatabase();
 */
export async function deleteDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Mongoose is not connected.');
  }
  await mongoose.connection.dropDatabase();
}

/**
 * If this file is run directly, connect to MongoDB, delete the database, and close the connection.
 * Usage: ts-node src/services/deleteDatabaseService.ts (or node after build)
 */
if (require.main === module) {
  (async () => {
    // Load environment variables
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('dotenv').config();
    const mongoose = require('mongoose');
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI environment variable is required');
      process.exit(1);
    }
    try {
      await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ Connected to MongoDB');
      await deleteDatabase();
      console.log('🗑️  Database deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting database:', error);
    } finally {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed');
      process.exit(0);
    }
  })();
} 