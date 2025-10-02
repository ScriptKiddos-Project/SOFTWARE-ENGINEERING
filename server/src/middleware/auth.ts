import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { prisma } from '../config/database';
import { 
  verifyAccessToken, 
  extractTokenFromHeader,
  TokenError,
  TokenExpiredError,
  InvalidTokenError
} from '../utils/jwt';
import { 
  AuthenticatedRequest, 
  JwtPayload, 
  UserRole, 
  Permission,
  ROLE_PERMISSIONS,
  AuthErrorCodes 
} from '../types/auth';
import { ApiResponse } from '../types';

/**
 * Extract and verify JWT token from request
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token is required',
        error: AuthErrorCodes.INVALID_TOKEN
      } as ApiResponse);
      return;
    }

    // Verify token
    let payload: JwtPayload;
    try {
      payload = verifyAccessToken(token);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        res.status(401).json({
          success: false,
          message: 'Access token has expired',
          error: AuthErrorCodes.TOKEN_EXPIRED
        } as ApiResponse);
        return;
      } else if (error instanceof InvalidTokenError) {
        res.status(401).json({
          success: false,
          message: 'Invalid access token',
          error: AuthErrorCodes.INVALID_TOKEN
        } as ApiResponse);
        return;
      }
      throw error;
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { 
        id: payload.userId,
        isActive: true 
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found or inactive',
        error: AuthErrorCodes.INVALID_TOKEN
      } as ApiResponse);
      return;
    }

    // Check if user account is verified (for sensitive operations)
    if (!user.isVerified && req.path !== '/auth/verify-email' && req.path !== '/auth/resend-verification') {
      res.status(403).json({
        success: false,
        message: 'Email verification required',
        error: AuthErrorCodes.ACCOUNT_NOT_VERIFIED
      } as ApiResponse);
      return;
    }

    // Attach user data to request
    req.user = user as any;
    req.userId = user.id;
    req.userRole = user.role;

    // Update last activity timestamp (optional, for session tracking)
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActivityAt: new Date() }
    }).catch(() => {}); // Ignore errors for this non-critical operation

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: 'AUTHENTICATION_ERROR'
    } as ApiResponse);
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractTokenFromHeader(req.headers.authorization);
  
  if (!token) {
    return next();
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { 
        id: payload.userId,
        isActive: true 
      }
    });

    if (user) {
      req.user = user as any;
      req.userId = user.id;
      req.userRole = user.role;
    }
  } catch (error) {
    // Ignore authentication errors in optional auth
    console.warn('Optional auth warning:', error);
  }

  next();
};

/**
 * Check if user has required role
 */
export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.userRole) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: AuthErrorCodes.INVALID_TOKEN
      } as ApiResponse);
      return;
    }

    if (!roles.includes(req.userRole as UserRole)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        error: AuthErrorCodes.INSUFFICIENT_PERMISSIONS
      } as ApiResponse);
      return;
    }

    next();
  };
};

/**
 * Check if user has required permission
 */
export const requirePermission = (...permissions: Permission[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.userRole) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: AuthErrorCodes.INVALID_TOKEN
      } as ApiResponse);
      return;
    }

    const userRole = req.userRole as UserRole;
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];

    const hasPermission = permissions.some(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        error: AuthErrorCodes.INSUFFICIENT_PERMISSIONS
      } as ApiResponse);
      return;
    }

    next();
  };
};

/**
 * Check if user is admin (club_admin or super_admin)
 */
export const requireAdmin = requireRole(UserRole.CLUB_ADMIN, UserRole.SUPER_ADMIN);

/**
 * Check if user is super admin
 */
export const requireSuperAdmin = requireRole(UserRole.SUPER_ADMIN);

/**
 * Check if user owns the resource or is admin
 */
export const requireOwnershipOrAdmin = (getUserIdFromParams: (req: Request) => string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: AuthErrorCodes.INVALID_TOKEN
      } as ApiResponse);
      return;
    }

    const resourceUserId = getUserIdFromParams(req);
    const isOwner = req.userId === resourceUserId;
    const isAdmin = [UserRole.CLUB_ADMIN, UserRole.SUPER_ADMIN].includes(req.userRole as UserRole);

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
        error: AuthErrorCodes.INSUFFICIENT_PERMISSIONS
      } as ApiResponse);
      return;
    }

    next();
  };
};

/**
 * Rate limiting for authentication endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    error: AuthErrorCodes.RATE_LIMIT_EXCEEDED
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
  // Custom key generator to rate limit by IP + email
  keyGenerator: (req) => {
    const email = req.body?.email || '';
    return `${req.ip}-${email}`;
  },
  // Skip successful requests
  skipSuccessfulRequests: true,
});

/**
 * Rate limiting for password reset
 */
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reset attempts per hour
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later',
    error: AuthErrorCodes.RATE_LIMIT_EXCEEDED
  } as ApiResponse,
  keyGenerator: (req) => {
    const email = req.body?.email || '';
    return `password-reset-${req.ip}-${email}`;
  }
});

/**
 * Rate limiting for email verification
 */
export const emailVerificationRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // 3 verification attempts per window
  message: {
    success: false,
    message: 'Too many verification attempts, please try again later',
    error: AuthErrorCodes.RATE_LIMIT_EXCEEDED
  } as ApiResponse
});

/**
 * Middleware to check if user's account is locked
 */
export const checkAccountLock = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const email = req.body?.email;
  
  if (!email) {
    return next();
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        isActive: true,
        loginAttempts: true,
        lockedUntil: true
      }
    });

    if (user && user.lockedUntil && user.lockedUntil > new Date()) {
      res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts',
        error: AuthErrorCodes.ACCOUNT_LOCKED,
        data: {
          lockedUntil: user.lockedUntil
        }
      } as ApiResponse);
      return;
    }

    next();
  } catch (error) {
    console.error('Account lock check error:', error);
    next(); // Continue on error to avoid blocking legitimate requests
  }
};

/**
 * Middleware to validate request body against schema
 */
export const validateSchema = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors?.reduce((acc: any, err: any) => {
          acc[err.path.join('.')] = err.message;
          return acc;
        }, {}) || { validation: 'Invalid request data' }
      } as ApiResponse);
    }
  };
};

/**
 * Middleware to log authentication events
 */
export const logAuthEvent = (eventType: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // Store event info in res.locals to be logged after response
    res.locals.authEvent = {
      type: eventType,
      userId: req.userId,
      email: req.body?.email,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date()
    };

    next();
  };
};

/**
 * Middleware to ensure HTTPS in production
 */
export const requireHTTPS = (req: Request, res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    res.status(400).json({
      success: false,
      message: 'HTTPS is required',
      error: 'INSECURE_CONNECTION'
    } as ApiResponse);
    return;
  }
  next();
};

/**
 * Middleware to check API version compatibility
 */
export const checkApiVersion = (req: Request, res: Response, next: NextFunction): void => {
  const clientVersion = req.get('X-API-Version') || req.get('X-Client-Version');
  const minVersion = process.env.MIN_API_VERSION || '1.0.0';
  
  // For now, just log the version - implement actual version checking later
  if (clientVersion) {
    console.log(`Client API Version: ${clientVersion}`);
  }
  
  next();
};