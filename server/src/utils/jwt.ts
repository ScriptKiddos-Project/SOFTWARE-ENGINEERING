// import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JwtPayload, RefreshTokenPayload, TokenPair } from '../types/auth';
import { User } from '@prisma/client';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import type { StringValue } from 'ms';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '15m';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';
const JWT_ISSUER = process.env.JWT_ISSUER || 'clubhub-api';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'clubhub-client';

// Error classes
export class TokenError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'TokenError';
  }
}

export class TokenExpiredError extends TokenError {
  constructor() {
    super('Token has expired', 'TOKEN_EXPIRED');
  }
}

export class InvalidTokenError extends TokenError {
  constructor(message = 'Invalid token') {
    super(message, 'INVALID_TOKEN');
  }
}

/**
 * Generate a secure token ID
 */
export const generateTokenId = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Create a secure hash for storing refresh tokens
 */
export const hashRefreshToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Blacklist token utility (for logout)
 */
export const blacklistToken = (token: string): string => {
  // This would typically store the token hash in a blacklist
  // For now, we'll just return the hashed version
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Decode token without verification (for debugging)
 */
export const decodeToken = (token: string): any | null => {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
};

/**
 * Get user ID from token without verification
 */
export const getUserIdFromToken = (token: string): string | null => {
  const decoded = decodeToken(token);
  return decoded?.userId || null;
}; /**
* Create JWT payload from user data
 */
export const createJwtPayload = (user: User): JwtPayload => {
  return {
    userId: user.id,
    email: user.email,
    role: user.role as 'student' | 'club_admin' | 'super_admin',
    firstName: user.firstName,
    lastName: user.lastName,
  };
};

/**
 * Generate access token
 */
export const generateAccessToken = (user: User): string => {
  const payload = createJwtPayload(user);
  
  // return jwt.sign(payload, JWT_SECRET, {
  //   expiresIn: JWT_EXPIRE,
  //   issuer: JWT_ISSUER,
  //   audience: JWT_AUDIENCE,
  //   algorithm: 'HS256',
  // });
  const options: SignOptions = {
  expiresIn: JWT_EXPIRE  as StringValue,
  issuer: JWT_ISSUER,
  audience: JWT_AUDIENCE,
  algorithm: 'HS256',
};

return jwt.sign(payload, JWT_SECRET as Secret, options);
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (userId: string): string => {
  const tokenId = generateTokenId();
  
  const payload: RefreshTokenPayload = {
    userId,
    tokenId,
  };
  
  const options: SignOptions = {
  expiresIn: JWT_EXPIRE as StringValue,
  issuer: JWT_ISSUER,
  audience: JWT_AUDIENCE,
  algorithm: 'HS256',
  };

  return jwt.sign(payload, JWT_SECRET as Secret, options);
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokenPair = (user: User): TokenPair => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user.id),
  };
};

/**
 * Verify and decode access token
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: ['HS256'],
    }) as JwtPayload;
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new TokenExpiredError();
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new InvalidTokenError(error.message);
    } else {
      throw new InvalidTokenError('Token verification failed');
    }
  }
};

/**
 * Verify and decode refresh token
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: ['HS256'],
    }) as RefreshTokenPayload;
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new TokenExpiredError();
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new InvalidTokenError(error.message);
    } else {
      throw new InvalidTokenError('Refresh token verification failed');
    }
  }
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};

/**
 * Get token expiration date
 */
export const getTokenExpiration = (token: string): Date | null => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) {
      return null;
    }
    
    return new Date(decoded.exp * 1000);
  } catch {
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const expiration = getTokenExpiration(token);
  if (!expiration) {
    return true;
  }
  
  return expiration.getTime() < Date.now();
};

/**
 * Get token time until expiration in seconds
 */
export const getTokenTTL = (token: string): number | null => {
  const expiration = getTokenExpiration(token);
  if (!expiration) {
    return null;
  }
  
  const ttl = Math.floor((expiration.getTime() - Date.now()) / 1000);
  return Math.max(0, ttl);
};

/**
 * Generate email verification token
 */
// export const generateEmailVerificationToken = (userId: string, email: string): string => {
//   const payload = {
//     userId,
//     email,
//     type: 'email_verification',
//   };
  
//   return jwt.sign(payload, JWT_SECRET, {
//     expiresIn: '24h',
//     issuer: JWT_ISSUER,
//     audience: JWT_AUDIENCE,
//   });
// };

// /**
//  * Verify email verification token
//  */
// export const verifyEmailVerificationToken = (token: string): { userId: string; email: string } => {
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET, {
//       issuer: JWT_ISSUER,
//       audience: JWT_AUDIENCE,
//     }) as any;
    
//     if (decoded.type !== 'email_verification') {
//       throw new InvalidTokenError('Invalid token type');
//     }
    
//     return {
//       userId: decoded.userId,
//       email: decoded.email,
//     };
//   } catch (error) {
//     if (error instanceof jwt.TokenExpiredError) {
//       throw new TokenExpiredError();
//     } else if (error instanceof jwt.JsonWebTokenError) {
//       throw new InvalidTokenError(error.message);
//     } else {
//       throw error;
//     }
//   }
// };

// Email verification tokens
const JWT_EMAIL_SECRET = process.env.JWT_EMAIL_SECRET || JWT_SECRET;

export const generateEmailVerificationToken = (userId: string, email: string): string => {
  const payload = { userId, email, type: 'email_verification' };
  return jwt.sign(payload, JWT_EMAIL_SECRET, { expiresIn: '24h', issuer: JWT_ISSUER, audience: JWT_AUDIENCE });
};

export const verifyEmailVerificationToken = (token: string): { userId: string; email: string } => {
  try {
    const decoded = jwt.verify(token, JWT_EMAIL_SECRET, { issuer: JWT_ISSUER, audience: JWT_AUDIENCE }) as any;
    if (decoded.type !== 'email_verification') throw new InvalidTokenError('Invalid token type');
    return { userId: decoded.userId, email: decoded.email };
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) throw new TokenExpiredError();
    throw new InvalidTokenError('Invalid or expired verification token');
  }
};

/**
 * Generate password reset token
 */
export const generatePasswordResetToken = (userId: string, email: string): string => {
  const payload = {
    userId,
    email,
    type: 'password_reset',
    nonce: generateTokenId(), // Add nonce for single-use
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1h',
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
};

/**
 * Verify password reset token
 */
export const verifyPasswordResetToken = (token: string): { userId: string; email: string; nonce: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as any;
    
    if (decoded.type !== 'password_reset') {
      throw new InvalidTokenError('Invalid token type');
    }
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      nonce: decoded.nonce,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new TokenExpiredError();
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new InvalidTokenError(error.message);
    } else {
      throw error;
    }
  }
};

/**
 * Generate API key for external integrations
 */
export const generateApiKey = (userId: string, permissions: string[]): string => {
  const payload = {
    userId,
    permissions,
    type: 'api_key',
    keyId: generateTokenId(),
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1y', // API keys have longer expiry
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
};

/**
 * Verify API key
 */
export const verifyApiKey = (apiKey: string): { userId: string; permissions: string[]; keyId: string } => {
  try {
    const decoded = jwt.verify(apiKey, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as any;
    
    if (decoded.type !== 'api_key') {
      throw new InvalidTokenError('Invalid API key');
    }
    
    return {
      userId: decoded.userId,
      permissions: decoded.permissions || [],
      keyId: decoded.keyId,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new TokenExpiredError();
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new InvalidTokenError(error.message);
    } else {
      throw error;
    }
  }
};
