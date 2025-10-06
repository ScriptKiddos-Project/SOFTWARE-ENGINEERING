import { ApiService } from './api';

// Types
interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  student_id?: string;
  phone?: string;
  department?: string;
  year_of_study?: number;
  role: 'student' | 'club_admin' | 'super_admin';
  is_verified: boolean;
  profile_image?: string;
  total_points: number;
  total_volunteer_hours: number;
  created_at: string;
  updated_at: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  student_id?: string;
  phone?: string;
  department?: string;
  year_of_study?: number;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

class AuthService {
  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return ApiService.post<AuthResponse>('/auth/login', credentials);
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return ApiService.post<AuthResponse>('/auth/register', userData);
  }

  async logout(): Promise<void> {
    return ApiService.post<void>('/auth/logout');
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    return ApiService.post<AuthResponse>('/auth/refresh', { refreshToken });
  }

  // User profile endpoints - FIXED: Changed from /auth/me to /profile/me
  async getCurrentUser(): Promise<User> {
    return ApiService.get<User>('/profile/me');
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return ApiService.patch<User>('/profile/me', data);
  }

  // Password management
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    return ApiService.post<void>('/auth/change-password', data);
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>('/auth/forgot-password', data);
  }

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>('/auth/reset-password', data);
  }

  // Email verification
  async sendVerificationEmail(): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>('/auth/send-verification');
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>('/auth/verify-email', { token });
  }

  // Profile image upload - FIXED: Changed endpoint
  async uploadAvatar(file: File, onProgress?: (progress: number) => void): Promise<{ imageUrl: string }> {
    return ApiService.uploadFile<{ imageUrl: string }>('/profile/me/picture', file, onProgress);
  }

  // Account management
  async deleteAccount(password: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>('/profile/me', { confirmPassword: password });
  }

  async deactivateAccount(): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>('/auth/deactivate');
  }

  async reactivateAccount(email: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>('/auth/reactivate', { email });
  }

  // Session management
  async getSessions(): Promise<Array<{
    id: string;
    device: string;
    location: string;
    lastActive: string;
    current: boolean;
  }>> {
    return ApiService.get<Array<{
      id: string;
      device: string;
      location: string;
      lastActive: string;
      current: boolean;
    }>>('/auth/sessions');
  }

  async revokeSession(sessionId: string): Promise<{ message: string }> {
    return ApiService.delete<{ message: string }>(`/auth/sessions/${sessionId}`);
  }

  async revokeAllSessions(): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>('/auth/revoke-all-sessions');
  }

  // Admin functions (for super admins)
  async impersonateUser(userId: string): Promise<AuthResponse> {
    return ApiService.post<AuthResponse>(`/auth/impersonate/${userId}`);
  }

  async stopImpersonation(): Promise<AuthResponse> {
    return ApiService.post<AuthResponse>('/auth/stop-impersonation');
  }
}

// Create and export instance
export const authService = new AuthService();

// Utility functions for form validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { 
  isValid: boolean; 
  errors: string[] 
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateStudentId = (studentId: string): boolean => {
  // Adjust this regex based on your institution's student ID format
  const studentIdRegex = /^[A-Z0-9]{6,12}$/;
  return studentIdRegex.test(studentId);
};

export const validatePhone = (phone: string): boolean => {
  // Basic phone number validation (adjust as needed)
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

export const getPasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
} => {
  let score = 0;
  
  // Length
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  
  // Character variety
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  
  // Patterns
  if (!/(.)\1{2,}/.test(password)) score++; // No repeated characters
  if (!/123|abc|qwerty/i.test(password)) score++; // No common patterns
  
  let label = 'Very Weak';
  let color = 'red';
  
  if (score >= 7) {
    label = 'Very Strong';
    color = 'green';
  } else if (score >= 5) {
    label = 'Strong';
    color = 'green';
  } else if (score >= 3) {
    label = 'Medium';
    color = 'yellow';
  } else if (score >= 1) {
    label = 'Weak';
    color = 'orange';
  }
  
  return { score, label, color };
};