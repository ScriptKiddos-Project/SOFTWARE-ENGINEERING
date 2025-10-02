// password-utils.ts
import bcrypt, { compare as bcryptCompare } from 'bcrypt';
import * as crypto from 'crypto';

const DEFAULT_SALT_ROUNDS = 12;
const parsed = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS ?? `${DEFAULT_SALT_ROUNDS}`, 10);
export const SALT_ROUNDS: number = Number.isNaN(parsed) ? DEFAULT_SALT_ROUNDS : parsed;

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

const PASSWORD_PATTERNS = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  digit: /\d/,
  special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
  noWhitespace: /^\S+$/,
};

export class PasswordError extends Error {
  public code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = 'PasswordError';
    this.code = code;
    // Ensure instanceof works across transpilation targets
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very_strong';
  score: number;
}

/**
 * Validate password before any other operation.
 * Returns a structured result (never throws).
 */
export const validatePassword = (password: unknown): PasswordValidationResult => {
  const errors: string[] = [];
  let score = 0;

  if (typeof password !== 'string') {
    errors.push('Password must be a string');
    return { isValid: false, errors, strength: 'weak', score: 0 };
  }

  // Quick length checks
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
  } else {
    score += 1;
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    errors.push(`Password must not exceed ${MAX_PASSWORD_LENGTH} characters`);
  }

  // Whitespace
  if (!PASSWORD_PATTERNS.noWhitespace.test(password)) {
    errors.push('Password must not contain spaces');
  } else {
    score += 0; // no extra score but keep structure clear
  }

  // Character classes
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

  // Extra strength checks
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if ((password.match(/[A-Z]/g) || []).length >= 2) score += 1;
  if ((password.match(/\d/g) || []).length >= 2) score += 1;
  if ((password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length >= 2) score += 1;

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

  let strength: PasswordValidationResult['strength'];
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

const commonPasswords = new Set([
  'password', '123456', '123456789', 'qwerty', 'abc123',
  'password123', 'admin', 'welcome', 'login', 'master',
  '1234567890', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
  'password1', 'password12', 'pass123', 'admin123',
  'welcome123', 'user123', 'test123', 'demo123'
]);

const isCommonPassword = (pwd: string): boolean => commonPasswords.has(pwd.toLowerCase());

const hasRepeatingCharacters = (password: string): boolean => {
  if (!password) return false;
  let consecutiveCount = 1;
  let previousChar = password[0];
  for (let i = 1; i < password.length; i++) {
    if (password[i] === previousChar) {
      consecutiveCount++;
      if (consecutiveCount > 3) return true;
    } else {
      previousChar = password[i];
      consecutiveCount = 1;
    }
  }
  return false;
};

const isSequentialPattern = (password: string): boolean => {
  if (!password) return false;
  const sequences = [
    'abcdefghijklmnopqrstuvwxyz',
    'qwertyuiopasdfghjklzxcvbnm',
    '0123456789',
    '9876543210'
  ];
  const lower = password.toLowerCase();
  for (const seq of sequences) {
    for (let i = 0; i <= seq.length - 4; i++) {
      const sub = seq.substring(i, i + 4);
      if (lower.includes(sub)) return true;
    }
  }
  return false;
};

/**
 * Securely shuffle an array/string using Fisher-Yates and crypto.randomInt
 */
const secureShuffle = (input: string): string => {
  const arr = input.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
};

/**
 * Generate a secure random password
 */
export const generateSecurePassword = (length = 16): string => {
  if (typeof length !== 'number' || !Number.isFinite(length)) {
    throw new PasswordError('Invalid length provided', 'INVALID_LENGTH');
  }

  // Enforce minimum of 4 to allow at least one char from each class
  if (length < 4) length = 4;

  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  // pick one from each category
  let pw = '';
  pw += uppercase[crypto.randomInt(0, uppercase.length)];
  pw += lowercase[crypto.randomInt(0, lowercase.length)];
  pw += digits[crypto.randomInt(0, digits.length)];
  pw += special[crypto.randomInt(0, special.length)];

  const all = uppercase + lowercase + digits + special;
  for (let i = 4; i < length; i++) {
    pw += all[crypto.randomInt(0, all.length)];
  }

  // secure shuffle
  return secureShuffle(pw);
};

export const generateTemporaryPassword = (): string => generateSecurePassword(12);

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const validation = validatePassword(password);
  if (!validation.isValid) {
    throw new PasswordError(`Invalid password: ${validation.errors.join(', ')}`, 'INVALID_PASSWORD');
  }
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (err) {
    throw new PasswordError('Failed to hash password', 'HASH_ERROR');
  }
};

/**
 * Verify a password against its hash
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  if (typeof password !== 'string') throw new PasswordError('Password must be a string', 'INVALID_TYPE');
  try {
    return await bcryptCompare(password, hash);
  } catch (err) {
    throw new PasswordError('Failed to verify password', 'VERIFY_ERROR');
  }
};

/**
 * Verify password with timing attack protection
 */
export const verifyPasswordSecure = async (password: string, hash: string): Promise<boolean> => {
  if (typeof password !== 'string') throw new PasswordError('Password must be a string', 'INVALID_TYPE');

  const minDelayMs = 100;
  const start = process.hrtime.bigint();

  try {
    const res = await bcryptCompare(password, hash);
    const end = process.hrtime.bigint();
    const elapsed = Number(end - start) / 1_000_000;
    if (elapsed < minDelayMs) await new Promise(r => setTimeout(r, Math.ceil(minDelayMs - elapsed)));
    return res;
  } catch (err) {
    const end = process.hrtime.bigint();
    const elapsed = Number(end - start) / 1_000_000;
    if (elapsed < minDelayMs) await new Promise(r => setTimeout(r, Math.ceil(minDelayMs - elapsed)));
    throw new PasswordError('Failed to verify password', 'VERIFY_ERROR');
  }
};

/**
 * Check if a bcrypt hash needs rehash (rounds changed)
 */
export const needsRehash = async (hash: string): Promise<boolean> => {
  try {
    const parts = hash.split('$');
    const rounds = Number.parseInt(parts[2], 10);
    if (Number.isNaN(rounds)) return true;
    return rounds < SALT_ROUNDS;
  } catch {
    return true;
  }
};

/**
 * Batch hash helper
 */
export const hashPasswordsBatch = async (passwords: string[]): Promise<string[]> => {
  return Promise.all(passwords.map(pw => hashPassword(pw)));
};

/**
 * Create DB friendly password entry
 */
export const createPasswordEntry = async (password: string): Promise<{ hash: string; algorithm: string; saltRounds: number; createdAt: Date }> => {
  const hash = await hashPassword(password);
  return {
    hash,
    algorithm: 'bcrypt',
    saltRounds: SALT_ROUNDS,
    createdAt: new Date(),
  };
};

export const validatePasswordConfirmation = (password: string, confirmPassword: string): boolean => {
  if (!password || !confirmPassword) {
    throw new PasswordError('Password and confirmation are required', 'MISSING_PASSWORD');
  }
  if (password !== confirmPassword) throw new PasswordError('Passwords do not match', 'PASSWORD_MISMATCH');
  return true;
};

export function compare(password: string, hash: string): boolean {
  // TODO: implement real bcrypt logic
  return password === hash;
}
