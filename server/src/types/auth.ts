import { User } from '@prisma/client';

// Authentication Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  studentId?: string;
  phone?: string;
  department?: string;
  yearOfStudy?: number;
}

export interface LoginResponse {
  user: Omit<User, 'passwordHash' | 'passwordResetToken' | 'emailVerificationToken'>;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  expiresIn: number;
}

export interface RegisterResponse {
  user: Omit<User, 'passwordHash' | 'passwordResetToken' | 'emailVerificationToken'>;
  message: string;
}

// Password Management
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// JWT Payload Structure
export interface JwtPayload {
  userId: string;
  email: string;
  role: 'student' | 'club_admin' | 'super_admin';
  firstName: string;
  lastName: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  iat?: number;
  exp?: number;
}

// Token Management
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Email Verification
export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

// Session Management
export interface SessionData {
  userId: string;
  email: string;
  role: string;
  loginTime: Date;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Account Status
export interface AccountStatus {
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: Date;
  loginAttempts: number;
  lockedUntil?: Date;
}

// Role and Permission Types
export enum UserRole {
  STUDENT = 'student',
  CLUB_ADMIN = 'club_admin',
  SUPER_ADMIN = 'super_admin'
}

export type UserRoleType = 'student' | 'club_admin' | 'super_admin';

export enum Permission {
  // User permissions
  READ_OWN_PROFILE = 'read_own_profile',
  UPDATE_OWN_PROFILE = 'update_own_profile',
  
  // Event permissions
  READ_EVENTS = 'read_events',
  REGISTER_FOR_EVENTS = 'register_for_events',
  CREATE_EVENTS = 'create_events',
  UPDATE_OWN_EVENTS = 'update_own_events',
  DELETE_OWN_EVENTS = 'delete_own_events',
  MANAGE_EVENT_ATTENDANCE = 'manage_event_attendance',
  
  // Club permissions
  READ_CLUBS = 'read_clubs',
  JOIN_CLUBS = 'join_clubs',
  CREATE_CLUBS = 'create_clubs',
  MANAGE_OWN_CLUBS = 'manage_own_clubs',
  
  // Admin permissions
  MANAGE_ALL_USERS = 'manage_all_users',
  MANAGE_ALL_CLUBS = 'manage_all_clubs',
  MANAGE_ALL_EVENTS = 'manage_all_events',
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_SYSTEM_SETTINGS = 'manage_system_settings'
}

// Role-Permission Mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.STUDENT]: [
    Permission.READ_OWN_PROFILE,
    Permission.UPDATE_OWN_PROFILE,
    Permission.READ_EVENTS,
    Permission.REGISTER_FOR_EVENTS,
    Permission.READ_CLUBS,
    Permission.JOIN_CLUBS
  ],
  [UserRole.CLUB_ADMIN]: [
    Permission.READ_OWN_PROFILE,
    Permission.UPDATE_OWN_PROFILE,
    Permission.READ_EVENTS,
    Permission.REGISTER_FOR_EVENTS,
    Permission.CREATE_EVENTS,
    Permission.UPDATE_OWN_EVENTS,
    Permission.DELETE_OWN_EVENTS,
    Permission.MANAGE_EVENT_ATTENDANCE,
    Permission.READ_CLUBS,
    Permission.JOIN_CLUBS,
    Permission.CREATE_CLUBS,
    Permission.MANAGE_OWN_CLUBS
  ],
  [UserRole.SUPER_ADMIN]: [
    ...Object.values(Permission)
  ]
};

// Security Configuration
export interface SecurityConfig {
  jwt: {
    accessTokenExpiry: string;
    refreshTokenExpiry: string;
    issuer: string;
    audience: string;
  };
  password: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    saltRounds: number;
  };
  rateLimiting: {
    windowMs: number;
    maxAttempts: number;
    lockoutDurationMs: number;
  };
  emailVerification: {
    tokenExpiry: string;
    resendDelay: number;
  };
  passwordReset: {
    tokenExpiry: string;
    maxAttempts: number;
  };
}

// Authentication Context
export interface AuthContext {
  user: User | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
}

// Middleware Types
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  permissions: Permission[];
}

// API Error Types
export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

export enum AuthErrorCodes {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_NOT_VERIFIED = 'ACCOUNT_NOT_VERIFIED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  STUDENT_ID_ALREADY_EXISTS = 'STUDENT_ID_ALREADY_EXISTS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  PASSWORD_MISMATCH = 'PASSWORD_MISMATCH',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

// Login Attempt Tracking
export interface LoginAttempt {
  email: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  timestamp: Date;
  failureReason?: string;
}

// Password History (for preventing reuse)
export interface PasswordHistory {
  userId: string;
  passwordHash: string;
  createdAt: Date;
}

// Two-Factor Authentication (for future implementation)
export interface TwoFactorAuth {
  userId: string;
  secret: string;
  isEnabled: boolean;
  backupCodes: string[];
  lastUsed?: Date;
}

export interface TwoFactorSetupRequest {
  token: string;
  backupCodes: string[];
}

export interface TwoFactorVerifyRequest {
  token: string;
  code: string;
}

// Additional Types
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  studentId: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ApiResponse {
  message: string;
  data?: any;
}

// Add missing properties to AuthUser type for controller compatibility
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  studentId: string;
  phone: string;
  department: string;
  yearOfStudy: number;
  isVerified: boolean;
  profileImage: string;
  totalPoints: number;
  totalVolunteerHours: number;
  createdAt: string;
  passwordHash: string;
  role: string;
}