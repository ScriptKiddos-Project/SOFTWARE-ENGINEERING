import jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { User } from '@prisma/client';
import { JwtPayload, RefreshTokenPayload, TokenPair } from '../types/auth';

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
    Object.setPrototypeOf(this, new.target.prototype);
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

/** Helpers */
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

/**
 * Generate a secure token ID
 */
export const generateTokenId = (): string => crypto.randomBytes(32).toString('hex');

/**
 * Create a secure hash for storing refresh tokens
 */
export const hashRefreshToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

/**
 * Blacklist token utility (for logout)
 */
export const blacklistToken = (token: string): string => hashRefreshToken(token);

/**
 * Decode token without verification (for debugging)
 * Returns a plain object or null.
 */
export const decodeToken = (token: string): Record<string, unknown> | null => {
  try {
    const decoded = jwt.decode(token);
    if (isObject(decoded)) return decoded;
    return null;
  } catch {
    return null;
  }
};

/**
 * Get user ID from token without verification
 */
export const getUserIdFromToken = (token: string): string | null => {
  const decoded = decodeToken(token);
  if (!decoded) return null;
  const userId = decoded['userId'];
  return typeof userId === 'string' ? userId : null;
};

/**
 * JWT payload from user data
 */
export const createJwtPayload = (user: User): JwtPayload => ({
  userId: user.id,
  email: user.email,
  role: user.role as JwtPayload['role'],
  firstName: user.firstName,
  lastName: user.lastName,
});

/**
 * Generate access token
 */
export const generateAccessToken = (user: User): string => {
  const payload = createJwtPayload(user);
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE as string,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    algorithm: 'HS256',
  } as jwt.SignOptions);
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (userId: string): string => {
  const tokenId = generateTokenId();
  const payload: RefreshTokenPayload = { userId, tokenId };
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRE as string,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    algorithm: 'HS256',
  } as jwt.SignOptions);
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokenPair = (user: User): TokenPair => ({
  accessToken: generateAccessToken(user),
  refreshToken: generateRefreshToken(user.id),
});

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: ['HS256'],
    });

    if (!isObject(decoded)) throw new InvalidTokenError('Invalid token payload');

    // Validate required properties
    if (typeof decoded['userId'] !== 'string') throw new InvalidTokenError('Missing userId in token');
    if (typeof decoded['email'] !== 'string') throw new InvalidTokenError('Missing email in token');

    return decoded as unknown as JwtPayload;
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) throw new TokenExpiredError();
    const msg = error instanceof Error ? error.message : 'Token verification failed';
    throw new InvalidTokenError(msg);
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: ['HS256'],
    });

    if (!isObject(decoded)) throw new InvalidTokenError('Invalid refresh token payload');

    if (typeof decoded['userId'] !== 'string') throw new InvalidTokenError('Missing userId in refresh token');
    if (typeof decoded['tokenId'] !== 'string') throw new InvalidTokenError('Missing tokenId in refresh token');

    return decoded as unknown as RefreshTokenPayload;
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) throw new TokenExpiredError();
    const msg = error instanceof Error ? error.message : 'Refresh token verification failed';
    throw new InvalidTokenError(msg);
  }
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader) return null;
  const prefix = 'Bearer ';
  if (!authHeader.startsWith(prefix)) return null;
  return authHeader.slice(prefix.length);
};

/**
 * Get token expiration date
 */
export const getTokenExpiration = (token: string): Date | null => {
  const decoded = decodeToken(token);
  if (!decoded) return null;
  const exp = decoded['exp'];
  if (typeof exp !== 'number') return null;
  return new Date(exp * 1000);
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const expiration = getTokenExpiration(token);
  return !expiration || expiration.getTime() < Date.now();
};

/**
 * Get token TTL in seconds
 */
export const getTokenTTL = (token: string): number | null => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return null;
  return Math.max(0, Math.floor((expiration.getTime() - Date.now()) / 1000));
};

/**
 * Generate email verification token
 */
export const generateEmailVerificationToken = (userId: string, email: string): string => {
  const payload = { userId, email, type: 'email_verification' };
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h',
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    algorithm: 'HS256',
  });
};

/**
 * Verify email verification token
 */
export const verifyEmailVerificationToken = (token: string): { userId: string; email: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: ['HS256'],
    });

    if (!isObject(decoded)) throw new InvalidTokenError('Invalid token payload');
    if (decoded['type'] !== 'email_verification') throw new InvalidTokenError('Invalid token type');
    if (typeof decoded['userId'] !== 'string' || typeof decoded['email'] !== 'string')
      throw new InvalidTokenError('Invalid token data');

    return { userId: decoded['userId'] as string, email: decoded['email'] as string };
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) throw new TokenExpiredError();
    const msg = error instanceof Error ? error.message : 'Email verification token verification failed';
    throw new InvalidTokenError(msg);
  }
};

/**
 * Generate password reset token
 */
export const generatePasswordResetToken = (userId: string, email: string): string => {
  const payload = { userId, email, type: 'password_reset', nonce: generateTokenId() };
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1h',
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    algorithm: 'HS256',
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
      algorithms: ['HS256'],
    });

    if (!isObject(decoded)) throw new InvalidTokenError('Invalid token payload');
    if (decoded['type'] !== 'password_reset') throw new InvalidTokenError('Invalid token type');
    if (typeof decoded['userId'] !== 'string' || typeof decoded['email'] !== 'string' || typeof decoded['nonce'] !== 'string')
      throw new InvalidTokenError('Invalid token data');

    return {
      userId: decoded['userId'] as string,
      email: decoded['email'] as string,
      nonce: decoded['nonce'] as string,
    };
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) throw new TokenExpiredError();
    const msg = error instanceof Error ? error.message : 'Password reset token verification failed';
    throw new InvalidTokenError(msg);
  }
};

/**
 * Generate API key
 */
export const generateApiKey = (userId: string, permissions: string[]): string => {
  const payload = { userId, permissions, type: 'api_key', keyId: generateTokenId() };
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1y',
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    algorithm: 'HS256',
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
      algorithms: ['HS256'],
    });

    if (!isObject(decoded)) throw new InvalidTokenError('Invalid API key payload');
    if (decoded['type'] !== 'api_key') throw new InvalidTokenError('Invalid API key type');
    if (typeof decoded['userId'] !== 'string' || !Array.isArray(decoded['permissions']) || typeof decoded['keyId'] !== 'string')
      throw new InvalidTokenError('Invalid API key data');

    return {
      userId: decoded['userId'] as string,
      permissions: (decoded['permissions'] as unknown[])?.map(String) ?? [],
      keyId: decoded['keyId'] as string,
    };
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) throw new TokenExpiredError();
    const msg = error instanceof Error ? error.message : 'API key verification failed';
    throw new InvalidTokenError(msg);
  }
};

/**
 * Verify token (for external use, e.g. authController)
 */
export function verifyToken(token: string, secret: string) {
  // TODO: implement real JWT verification
  return { userId: '1' };
}
