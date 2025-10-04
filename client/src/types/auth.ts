// Authentication-related types and interfaces

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  studentId?: string;
  phone?: string;
  department?: string;
  yearOfStudy?: number;
  role: UserRole;
  isVerified: boolean;
  profileImage?: string;
  totalPoints: number;
  totalVolunteerHours: number;
  createdAt: Date;
  updatedAt: Date;
}

// snake_case compatibility
export interface User {
  first_name?: string;
  last_name?: string;
  profile_image?: string;
}

export type UserRole = 'student' | 'club_admin' | 'super_admin';

export interface LoginRequest {
  email: string;
  password: string;
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
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: ResetPasswordRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export interface EmailVerificationRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

// JWT Payload interface
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Profile update interface
export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  department?: string;
  yearOfStudy?: number;
  profileImage?: string;
}

// Auth error types
export type AuthError = 
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'EMAIL_ALREADY_EXISTS'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'EMAIL_NOT_VERIFIED'
  | 'WEAK_PASSWORD'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR';

export interface AuthErrorResponse {
  error: AuthError;
  message: string;
  details?: Record<string, string>;
}

// Password requirements
export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
}

export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: false,
};

// Session management
export interface SessionInfo {
  userId: string;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
}

export interface LogoutAllSessionsResponse {
  message: string;
  sessionsTerminated: number;
}

// Define and export the AuthUser type
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  // Add other fields as necessary
}