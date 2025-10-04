import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
// import RedisStore from 'rate-limit-redis'; // Uncomment when Redis is configured
import { Request, Response } from 'express';
import { RATE_LIMIT_CONFIG, AUTH_RATE_LIMIT, HTTP_STATUS } from '@/utils/constants';
import { AppError } from '@/middleware/errorHandler';



// Redis client (optional - for production)
// Uncomment and configure if using Redis
// import { createClient } from 'redis';
// const redisClient = createClient({
//   url: process.env.REDIS_URL || 'redis://localhost:6379'
// });
// redisClient.connect().catch(console.error);

// Key generator function for rate limiting
const generateKey = (req: Request): string => {
  // Use IP address as default key
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  
  // If user is authenticated, use user ID for more accurate limiting
  if (req.user?.id) {
    return `rate_limit:user:${req.user.id}`;
  }
  
  return `rate_limit:ip:${ip}`;
};

// Custom handler for rate limit exceeded
const rateLimitHandler = (req: Request, res: Response) => {
  const error = new AppError(
    RATE_LIMIT_CONFIG.MESSAGE,
    HTTP_STATUS.TOO_MANY_REQUESTS
  );
  
  res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
    success: false,
    message: error.message,
    retryAfter: res.getHeader('Retry-After'),
    timestamp: new Date().toISOString()
  });
};

// Skip rate limiting for certain conditions
const skipRateLimiting = (req: Request): boolean => {
  // Skip for health check endpoints
  if (req.path === '/health' || req.path === '/api/health') {
    return true;
  }
  
  // Skip for super admins in development
  if (process.env.NODE_ENV === 'development' && req.user?.role === 'super_admin') {
    return true;
  }
  
  return false;
};

// Standard rate limiter (for general API endpoints)
export const rateLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.WINDOW_MS,
  max: RATE_LIMIT_CONFIG.MAX_REQUESTS,
  message: RATE_LIMIT_CONFIG.MESSAGE,
  standardHeaders: RATE_LIMIT_CONFIG.STANDARD_HEADERS,
  legacyHeaders: RATE_LIMIT_CONFIG.LEGACY_HEADERS,
  keyGenerator: generateKey,
  handler: rateLimitHandler,
  skip: skipRateLimiting,
  // Use Redis store in production (uncomment when Redis is configured)
  // store: new RedisStore({
  //   client: redisClient,
  //   prefix: 'rate_limit:'
  // })
});

// Strict rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: AUTH_RATE_LIMIT.WINDOW_MS,
  max: AUTH_RATE_LIMIT.MAX_REQUESTS,
  message: AUTH_RATE_LIMIT.MESSAGE,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // For auth endpoints, use both IP and email for more security
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const email = req.body?.email || 'no-email';
    return `auth_rate_limit:${ip}:${email}`;
  },
  handler: rateLimitHandler,
  skipSuccessfulRequests: false, // Count all requests, even successful ones
  skipFailedRequests: false
});

// Strict rate limiter for password reset endpoints
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 attempts per hour
  message: 'Too many password reset attempts. Please try again after an hour.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const email = req.body?.email || 'no-email';
    return `password_reset:${email}`;
  },
  handler: rateLimitHandler
});

// Rate limiter for registration endpoints
export const registrationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registrations per hour per IP
  message: 'Too many registration attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `registration:${ip}`;
  },
  handler: rateLimitHandler
});

// Rate limiter for file upload endpoints
export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 uploads per 15 minutes
  message: 'Too many file uploads. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: generateKey,
  handler: rateLimitHandler
});

// Rate limiter for email sending endpoints
export const emailRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 emails per hour
  message: 'Too many emails sent. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    if (req.user?.id) {
      return `email:user:${req.user.id}`;
    }
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `email:ip:${ip}`;
  },
  handler: rateLimitHandler
});

// Rate limiter for search endpoints
export const searchRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: 'Too many search requests. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: generateKey,
  handler: rateLimitHandler
});

// Rate limiter for QR code generation
export const qrCodeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 QR codes per 15 minutes
  message: 'Too many QR code generation requests.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: generateKey,
  handler: rateLimitHandler
});

// Rate limiter for event registration
export const eventRegistrationRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 event registrations per 5 minutes
  message: 'Too many event registration attempts. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: generateKey,
  handler: rateLimitHandler
});

// Rate limiter for attendance marking
export const attendanceRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 attendance marks per minute (for bulk operations)
  message: 'Too many attendance marking requests.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: generateKey,
  handler: rateLimitHandler
});

// Rate limiter for feedback submission
export const feedbackRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 feedback submissions per 15 minutes
  message: 'Too many feedback submissions. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: generateKey,
  handler: rateLimitHandler
});

// Dynamic rate limiter factory
export const createRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
  keyPrefix?: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || 'Too many requests',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      const key = generateKey(req);
      return options.keyPrefix ? `${options.keyPrefix}:${key}` : key;
    },
    handler: rateLimitHandler
  });
};

// Rate limiter for API routes based on user role
export const roleBasedRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: Request) => {
    // Different limits based on user role
    switch (req.user?.role) {
      case 'super_admin':
        return 1000; // 1000 requests per 15 minutes
      case 'club_admin':
        return 500; // 500 requests per 15 minutes
      case 'student':
        return 200; // 200 requests per 15 minutes
      default:
        return 100; // 100 requests per 15 minutes for unauthenticated
    }
  },
  message: 'Rate limit exceeded for your user role.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: generateKey,
  handler: rateLimitHandler
});

// Sliding window rate limiter (more accurate)
export const slidingWindowRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: RATE_LIMIT_CONFIG.MESSAGE,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: generateKey,
  handler: rateLimitHandler,
  // Enable sliding window (requires Redis store)
  // store: new RedisStore({
  //   client: redisClient,
  //   prefix: 'sliding_rate_limit:'
  // })
});

// Global rate limiter (applies to all routes)
export const globalRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // 200 requests per minute globally
  message: 'Too many requests from your IP. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `global:${ip}`;
  },
  handler: rateLimitHandler,
  skip: skipRateLimiting
});

// Export utility functions
export const getRateLimitInfo = (req: Request): {
  limit: number;
  remaining: number;
  reset: Date;
} | null => {
  const limit = req.rateLimit?.limit;
  const remaining = req.rateLimit?.remaining;
  const resetTime = req.rateLimit?.resetTime;

  if (limit && remaining !== undefined && resetTime) {
    return {
      limit,
      remaining,
      reset: new Date(resetTime)
    };
  }

  return null;
};

// Check if rate limit is close to being exceeded
export const isRateLimitWarning = (req: Request, threshold: number = 0.2): boolean => {
  const info = getRateLimitInfo(req);
  if (!info) return false;

  const percentageRemaining = info.remaining / info.limit;
  return percentageRemaining < threshold;
};

// Middleware to add rate limit info to response headers
export const addRateLimitHeaders = (req: Request, res: Response, next: Function) => {
  const info = getRateLimitInfo(req);
  
  if (info) {
    res.setHeader('X-RateLimit-Limit', info.limit.toString());
    res.setHeader('X-RateLimit-Remaining', info.remaining.toString());
    res.setHeader('X-RateLimit-Reset', info.reset.toISOString());
  }
  
  next();
};