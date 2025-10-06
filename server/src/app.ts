import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { globalErrorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import clubRoutes from './routes/clubs';
import eventRoutes from './routes/events';
import profileRoutes from './routes/profile';
import adminRoutes from './routes/admin';

import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);



// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);

// API documentation route (development only)
if (process.env.NODE_ENV === 'development') {
  app.get('/api/docs', (req, res) => {
    res.json({
      message: 'ClubHub API Documentation',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        clubs: '/api/clubs',
        events: '/api/events',
        profile: '/api/profile',
        admin: '/api/admin'
      },
      swagger: 'Coming soon...'
    });
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'ClubHub API Server',
    version: '1.0.0',
    status: 'Running',
    documentation: process.env.NODE_ENV === 'development' ? '/api/docs' : 'Contact admin'
  });
});

// Global error handler (must be last)
app.use(globalErrorHandler);

export default app;