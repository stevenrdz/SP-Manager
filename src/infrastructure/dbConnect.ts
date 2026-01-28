import mongoose from 'mongoose';

const MONGODB_URI = process.env.DATABASE_URL;

// Check moved to dbConnect

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
   const MONGODB_URI = process.env.DATABASE_URL;

   if (!MONGODB_URI) {
     // Fallback for local development if not in Docker
     console.log('[DB] No DATABASE_URL found, falling back to local MongoDB');
     return mongoose.connect('mongodb://localhost:27017/sp-metadata').then((mongoose) => {
       return mongoose;
     });
   }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
