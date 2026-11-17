import mongoose from 'mongoose';
import { env } from './env.js';
import { seedDatabase } from '../scripts/seed.js';

let mongod: any = null;

export async function connectDatabase(): Promise<void> {
  // If already connected, skip
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    console.log(`[Database] Connecting to MongoDB at ${env.MONGODB_URI}...`);
    // Try connecting to configured MongoDB (local or Atlas) with a 2-second timeout
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log('[Database] MongoDB connection established successfully.');
  } catch (err: any) {
    console.warn(`[Database] Could not connect to external MongoDB at ${env.MONGODB_URI}: ${err.message}`);
    
    // In dev or test environments, start an in-memory MongoDB instance for zero-config operation
    if (env.NODE_ENV !== 'production') {
      try {
        console.log('[Database] Starting zero-config MongoMemoryServer instance...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        await mongoose.connect(uri);
        console.log(`[Database] MongoMemoryServer connected at ${uri}`);
      } catch (memErr: any) {
        console.error('[Database] Fatal: Failed to start in-memory MongoDB instance:', memErr);
        throw memErr;
      }
    } else {
      throw err;
    }
  }

  if (env.AUTO_SEED_IF_EMPTY) {
    try {
      await seedDatabase(false);
    } catch (seedErr: any) {
      console.error('[Database] Auto-seed warning:', seedErr.message);
    }
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongod) {
      await mongod.stop();
      mongod = null;
    }
    console.log('[Database] MongoDB disconnected cleanly.');
  } catch (err: any) {
    console.error('[Database] Error disconnecting MongoDB:', err);
  }
}
