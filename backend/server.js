import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './lib/prisma.js';
import authRoutes from './routes/auth.js';
import memberRoutes, { publicMembersRouter } from './routes/members.js';
import attendanceRoutes from './routes/attendance.js';
import exportRoutes from './routes/export.js';
import { authenticate } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.VERCEL_URL 
    ? [
        `https://${process.env.VERCEL_URL}`,
        'https://sunday-school-dashbaord.vercel.app',
        'https://sunda-school-dashbaord-git-master-moronis-projects-f99a0308.vercel.app',
        /\.vercel\.app$/
      ]
    : ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
prisma.$connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((err) => console.error('PostgreSQL connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
// Public members route(s) without auth
app.use('/api/members', publicMembersRouter);
// Authenticated members routes
app.use('/api/members', authenticate, memberRoutes);
app.use('/api/attendance', authenticate, attendanceRoutes);
app.use('/api/export', authenticate, exportRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sunday School Dashboard API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Only start server if not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
  // Graceful shutdown
  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Vercel serverless
export default app;
