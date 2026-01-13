import app from '../backend/server.js';

// Vercel serverless function export
export default async (req, res) => {
  return app(req, res);
};
