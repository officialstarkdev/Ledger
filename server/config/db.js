import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error(
    'Please define the MONGO_URI environment variable inside your Vercel Project Settings'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and serverless invocations. This prevents creating new 
 * connections on every API call.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // If a connection is already established, reuse it.
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection promise is already in progress, wait for it.
  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false, // Turn off buffering for serverless performance
      maxPoolSize: 10,       // Keep pool size small in serverless environment
    };

    console.log('Connecting to MongoDB...');
    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      console.log('Connected to MongoDB');
      return mongoose;
    });
  }

  try {
    // Wait for the connection promise to resolve
    cached.conn = await cached.promise;
  } catch (e) {
    // If connection fails, clear the cached promise so we can try again on the next call
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;