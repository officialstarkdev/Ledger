import app from "../server/server.js";
import connectDB from "../server/config/db.js";

export default async function handler(req, res) {
  try {
    await connectDB();
    console.log('Database verification successful, proceeding to app...');
    return app(req, res);
  } catch (error) {
    console.error('Vercel Handler Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}