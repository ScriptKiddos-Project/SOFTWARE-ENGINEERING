// Authentication-related types and interfaces

// Frontend type (camelCase)
export interface AuthUser {
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

// Backend type (snake_case from API/Store)
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  student_id?: string;
  phone?: string;
  department?: string;
  year_of_study?: number;
  role: UserRole;
  is_verified: boolean;
  profile_image?: string;
  total_points: number;
  total_volunteer_hours: number;
  created_at: string;
  updated_at: string;
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

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  department?: string;
  yearOfStudy?: number;
  profileImage?: string;
}

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

// ✅ Utility: Map backend User (snake_case) to frontend AuthUser (camelCase)
export const mapUserToAuthUser = (user: User): AuthUser => ({
  id: user.id,
  email: user.email,
  firstName: user.first_name,
  lastName: user.last_name,
  studentId: user.student_id,
  phone: user.phone,
  department: user.department,
  yearOfStudy: user.year_of_study,
  role: user.role,
  isVerified: user.is_verified,
  profileImage: user.profile_image,
  totalPoints: user.total_points,
  totalVolunteerHours: user.total_volunteer_hours,
  createdAt: new Date(user.created_at),
  updatedAt: new Date(user.updated_at),
});

// ✅ Utility: Convert frontend RegisterRequest to backend payload format
export const toBackendRegisterPayload = (data: RegisterRequest) => ({
  email: data.email,
  password: data.password,
  first_name: data.firstName,
  last_name: data.lastName,
  student_id: data.studentId,
  phone: data.phone,
  department: data.department,
  year_of_study: data.yearOfStudy,
});
