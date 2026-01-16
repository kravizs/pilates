import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { Server } from 'socket.io';
import { createServer } from 'http';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables (override to avoid machine-level vars like DB_USER interfering)
dotenv.config({ override: true });

// Import middleware
import { errorHandler } from '@/middleware/errorHandler';
import { notFound } from '@/middleware/notFound';
import { rateLimiter } from '@/middleware/rateLimiter';
import { setupSwagger } from '@/config/swagger';

// Import routes
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';
import classRoutes from '@/routes/classes';
import bookingRoutes from '@/routes/bookings';
import membershipRoutes from '@/routes/memberships';
import instructorRoutes from '@/routes/instructors';
import reviewRoutes from '@/routes/reviews';
import contentRoutes from '@/routes/content';
import dashboardRoutes from '@/routes/dashboard';
import mindbodyRoutes from '@/routes/mindbody';
import paymentRoutes from '@/routes/payments';
import waitlistRoutes from '@/routes/waitlist';

// Import services
import { logger } from '@/utils/logger';
import { connectDatabase } from '@/config/database';
import { setupSocketIO } from '@/services/socketService';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(compression());

// Request parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
  }));
}

// Rate limiting
app.use(rateLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/mindbody', mindbodyRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/waitlist', waitlistRoutes);

// Setup Swagger documentation
setupSwagger(app);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Hi Studio Backend API'
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Setup Socket.IO
setupSocketIO(io);

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    
    server.listen(PORT, () => {
      logger.info(`🚀 Hi Studio Backend API running on port ${PORT}`);
      logger.info(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
      logger.info(`🏥 Health check available at http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, server, io };