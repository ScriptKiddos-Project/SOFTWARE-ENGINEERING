import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { AuthUser, User, RegisterRequest, ResetPasswordRequest } from '../types/auth';

type RegisterData = RegisterRequest;

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

// Helper function to convert User (snake_case) to AuthUser (camelCase)
const convertToAuthUser = (user: User | null): AuthUser | null => {
  if (!user) return null;
  
  return {
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
    updatedAt: new Date(user.updated_at)
  };
};

export const useAuth = (): UseAuthReturn => {
  const {
    user: storeUser,
    isAuthenticated,
    login: storeLogin,
    register: storeRegister,
    logout: storeLogout,
    clearAuth,
  } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert store user (User) to AuthUser for component use
  const user = useMemo(() => convertToAuthUser(storeUser), [storeUser]);

  // Initialize auth state on mount
  useEffect(() => {
    // Optionally, check auth on mount using store
    // useAuthStore.getState().checkAuth?.();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await storeLogin(email, password);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storeLogin]);

  const register = useCallback(async (data: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      // Convert camelCase to snake_case for backend/store
      const payload = {
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        student_id: data.studentId,
        phone: data.phone,
        department: data.department,
        year_of_study: data.yearOfStudy,
      };
      // @ts-ignore: storeRegister expects snake_case keys
      await storeRegister(payload);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storeRegister]);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await storeLogout();
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [storeLogout]);

  const refreshUser = useCallback(async () => {
    // Optionally, call checkAuth from store
    // await useAuthStore.getState().checkAuth?.();
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.verifyEmail(token);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.forgotPassword({ email });
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const payload: ResetPasswordRequest = { token, password, confirmPassword: password };
      await authService.resetPassword(payload);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    clearError,
    refreshUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
  };
};