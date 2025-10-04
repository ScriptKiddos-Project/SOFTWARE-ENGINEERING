import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { 
  verifyAccessToken, 
  extractTokenFromHeader,
  TokenError,
  TokenExpiredError,
  InvalidTokenError
} from '../utils/jwt';

const prisma = new PrismaClient();

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: 'student' | 'club_admin' | 'super_admin';
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
      };
      userId?: string;
      userRole?: 'student' | 'club_admin' | 'super_admin';
    }
  }
}

type UserRole = 'student' | 'club_admin' | 'super_admin';

const AuthErrorCodes = {
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  ACCOUNT_NOT_VERIFIED: 'ACCOUNT_NOT_VERIFIED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
};

interface ApiResponse {
  success: boolean;
  message: string;
  error?: string;
  errors?: any;
}

/**
 * Extract and verify JWT token from request
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token is required',
        error: AuthErrorCodes.INVALID_TOKEN
      } as ApiResponse);
      return;
    }

    let payload;
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

    const user = await prisma.user.findFirst({
      where: { 
        id: payload.userId
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
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

    if (user.isVerified === false && req.path !== '/auth/verify-email' && req.path !== '/auth/resend-verification') {
      res.status(403).json({
        success: false,
        message: 'Email verification required',
        error: AuthErrorCodes.ACCOUNT_NOT_VERIFIED
      } as ApiResponse);
      return;
    }

    req.user = user as any;
    req.userId = user.id;
    req.userRole = user.role as UserRole;

    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() }
    }).catch(() => {});

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

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractTokenFromHeader(req.headers.authorization);
  
  if (!token) {
    return next();
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findFirst({
      where: { 
        id: payload.userId
      }
    });

    if (user) {
      req.user = user as any;
      req.userId = user.id;
      req.userRole = user.role as UserRole;
    }
  } catch (error) {
    console.warn('Optional auth warning:', error);
  }

  next();
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !req.userRole) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: AuthErrorCodes.INVALID_TOKEN
      } as ApiResponse);
      return;
    }

    if (!roles.includes(req.userRole)) {
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

export const requireClubAdminOrEventCreator = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user || !req.userId) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  if (req.userRole === 'super_admin' || req.userRole === 'club_admin') {
    return next();
  }

  const eventId = req.params.id || req.params.eventId;
  if (eventId) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { createdBy: true }
    });

    if (event && event.createdBy === req.userId) {
      return next();
    }
  }

  res.status(403).json({
    success: false,
    message: 'Insufficient permissions'
  });
};

export const requireAdmin = requireRole('club_admin', 'super_admin');
export const requireSuperAdmin = requireRole('super_admin');

export const requireOwnershipOrAdmin = (getUserIdFromParams: (req: Request) => string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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
    const isAdmin = ['club_admin', 'super_admin'].includes(req.userRole as string);

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

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    error: AuthErrorCodes.RATE_LIMIT_EXCEEDED
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = req.body?.email || '';
    return `${req.ip}-${email}`;
  },
  skipSuccessfulRequests: true,
});

export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
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