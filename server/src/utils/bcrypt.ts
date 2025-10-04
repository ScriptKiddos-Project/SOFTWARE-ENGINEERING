import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Configuration
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

// Password validation patterns
const PASSWORD_PATTERNS = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  digit: /\d/,
  special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
  noWhitespace: /^\S+$/,
};

// Error types
export class PasswordError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'PasswordError';
  }
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very_strong';
  score: number;
}

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    // Validate password before hashing
    const validation = validatePassword(password);
    if (!validation.isValid) {
      throw new PasswordError(
        `Invalid password: ${validation.errors.join(', ')}`,
        'INVALID_PASSWORD'
      );
    }

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    if (error instanceof PasswordError) {
      throw error;
    }
    throw new PasswordError('Failed to hash password', 'HASH_ERROR');
  }
};

/**
 * Verify a password against its hash
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new PasswordError('Failed to verify password', 'VERIFY_ERROR');
  }
};

/**
 * Validate password strength and requirements
 */
export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  let score = 0;

  // Check length
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
  } else if (password.length >= MIN_PASSWORD_LENGTH) {
    score += 1;
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    errors.push(`Password must not exceed ${MAX_PASSWORD_LENGTH} characters`);
  }

  // Check for whitespace
  if (!PASSWORD_PATTERNS.noWhitespace.test(password)) {
    errors.push('Password must not contain spaces');
  }

  // Check character requirements
  if (!PASSWORD_PATTERNS.uppercase.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  if (!PASSWORD_PATTERNS.lowercase.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  if (!PASSWORD_PATTERNS.digit.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  if (!PASSWORD_PATTERNS.special.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  // Additional strength checks
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if ((password.match(/[A-Z]/g) || []).length >= 2) score += 1;
  if ((password.match(/\d/g) || []).length >= 2) score += 1;
  if ((password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length >= 2) score += 1;

  // Check for common patterns
  if (isCommonPassword(password)) {
    errors.push('Password is too common');
    score = Math.max(0, score - 2);
  }

  if (hasRepeatingCharacters(password)) {
    errors.push('Password contains too many repeating characters');
    score = Math.max(0, score - 1);
  }

  if (isSequentialPattern(password)) {
    errors.push('Password contains sequential patterns');
    score = Math.max(0, score - 1);
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' | 'very_strong';
  if (score <= 2) strength = 'weak';
  else if (score <= 4) strength = 'medium';
  else if (score <= 6) strength = 'strong';
  else strength = 'very_strong';

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score,
  };
};

/**
 * Check if password is in common password list
 */
const isCommonPassword = (password: string): boolean => {
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'welcome', 'login', 'master',
    '1234567890', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
    'password1', 'password12', 'pass123', 'admin123',
    'welcome123', 'user123', 'test123', 'demo123'
  ];

  return commonPasswords.includes(password.toLowerCase());
};

/**
 * Check for repeating characters (more than 3 consecutive)
 */
const hasRepeatingCharacters = (password: string): boolean => {
  let consecutiveCount = 1;
  let previousChar = password[0];

  for (let i = 1; i < password.length; i++) {
    if (password[i] === previousChar) {
      consecutiveCount++;
      if (consecutiveCount > 3) {
        return true;
      }
    } else {
      consecutiveCount = 1;
      previousChar = password[i];
    }
  }

  return false;
};

/**
 * Check for sequential patterns (keyboard or numeric)
 */
const isSequentialPattern = (password: string): boolean => {
  const sequences = [
    'abcdefghijklmnopqrstuvwxyz',
    'qwertyuiopasdfghjklzxcvbnm',
    '1234567890',
    '0987654321'
  ];

  const lowerPassword = password.toLowerCase();

  for (const sequence of sequences) {
    for (let i = 0; i <= sequence.length - 4; i++) {
      const subseq = sequence.substring(i, i + 4);
      if (lowerPassword.includes(subseq)) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Generate a secure random password
 */
export const generateSecurePassword = (length: number = 16): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  // Ensure at least one character from each category
  let password = '';
  password += uppercase[crypto.randomInt(uppercase.length)];
  password += lowercase[crypto.randomInt(lowercase.length)];
  password += digits[crypto.randomInt(digits.length)];
  password += special[crypto.randomInt(special.length)];
  
  // Fill remaining length with random characters
  const allChars = uppercase + lowercase + digits + special;
  for (let i = 4; i < length; i++) {
    password += allChars[crypto.randomInt(allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Generate a temporary password for password reset
 */
export const generateTemporaryPassword = (): string => {
  return generateSecurePassword(12);
};

/**
 * Check if password needs rehashing (when salt rounds change)
 */
export const needsRehash = async (hash: string): Promise<boolean> => {
  try {
    // Extract salt rounds from hash
    const rounds = parseInt(hash.split('$')[2]);
    return rounds < SALT_ROUNDS;
  } catch {
    return true; // If we can't parse it, assume it needs rehashing
  }
};

/**
 * Hash multiple passwords in batch (for seeding)
 */
export const hashPasswordsBatch = async (passwords: string[]): Promise<string[]> => {
  const promises = passwords.map(password => hashPassword(password));
  return Promise.all(promises);
};

/**
 * Verify password with timing attack protection
 */
export const verifyPasswordSecure = async (password: string, hash: string): Promise<boolean> => {
  const startTime = process.hrtime.bigint();
  
  try {
    const result = await bcrypt.compare(password, hash);
    
    // Add consistent delay to prevent timing attacks
    const endTime = process.hrtime.bigint();
    const elapsedMs = Number(endTime - startTime) / 1000000;
    const minDelayMs = 100; // Minimum 100ms delay
    
    if (elapsedMs < minDelayMs) {
      await new Promise(resolve => setTimeout(resolve, minDelayMs - elapsedMs));
    }
    
    return result;
  } catch (error) {
    // Even on error, maintain consistent timing
    const endTime = process.hrtime.bigint();
    const elapsedMs = Number(endTime - startTime) / 1000000;
    const minDelayMs = 100;
    
    if (elapsedMs < minDelayMs) {
      await new Promise(resolve => setTimeout(resolve, minDelayMs - elapsedMs));
    }
    
    throw new PasswordError('Failed to verify password', 'VERIFY_ERROR');
  }
};

/**
 * Create password hash for database storage with metadata
 */
export const createPasswordEntry = async (password: string) => {
  const hash = await hashPassword(password);
  return {
    hash,
    algorithm: 'bcrypt',
    saltRounds: SALT_ROUNDS,
    createdAt: new Date(),
  };
};

/**
 * Validate password confirmation match
 */
export const validatePasswordConfirmation = (password: string, confirmPassword: string): boolean => {
  if (!password || !confirmPassword) {
    throw new PasswordError('Password and confirmation are required', 'MISSING_PASSWORD');
  }
  
  if (password !== confirmPassword) {
    throw new PasswordError('Passwords do not match', 'PASSWORD_MISMATCH');
  }
  
  return true;
};