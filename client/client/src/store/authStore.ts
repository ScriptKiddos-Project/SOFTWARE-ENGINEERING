import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

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

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearAuth: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  student_id?: string;
  phone?: string;
  department?: string;
  year_of_study?: number;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authService.login({ email, password });
          
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false
          });

          toast.success(`Welcome back, ${response.user.first_name}!`);
        } catch (error: any) {
          set({ isLoading: false });
          const errorMessage = error.response?.data?.message || 'Login failed';
          toast.error(errorMessage);
          throw error;
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true });
        try {
          const response = await authService.register(userData);
          
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false
          });

          toast.success('Account created successfully!');
        } catch (error: any) {
          set({ isLoading: false });
          const errorMessage = error.response?.data?.message || 'Registration failed';
          toast.error(errorMessage);
          throw error;
        }
      },

      logout: async () => {
        const { token } = get();
        
        try {
          if (token) {
            await authService.logout();
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false
          });
          toast.success('Logged out successfully');
        }
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        
        if (!refreshToken) {
          get().clearAuth();
          return;
        }

        try {
          const response = await authService.refresh(refreshToken);
          
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true
          });
        } catch (error) {
          console.error('Token refresh failed:', error);
          get().clearAuth();
          throw error;
        }
      },

      checkAuth: async () => {
        const { token, refreshToken } = get();
        
        if (!token) {
          set({ isLoading: false });
          return;
        }

        set({ isLoading: true });

        try {
          // Try to get current user with existing token
          const user = await authService.getCurrentUser();
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error: any) {
          // If token is expired, try to refresh
          if (error.response?.status === 401 && refreshToken) {
            try {
              await get().refreshAuth();
            } catch (refreshError) {
              get().clearAuth();
            }
          } else {
            get().clearAuth();
          }
          set({ isLoading: false });
        }
      },

      updateProfile: async (data: Partial<User>) => {
        const { user } = get();
        if (!user) return;

        try {
          const updatedUser = await authService.updateProfile(data);
          
          set({
            user: updatedUser
          });

          toast.success('Profile updated successfully');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to update profile';
          toast.error(errorMessage);
          throw error;
        }
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// Utility functions
export const getAuthHeaders = () => {
  const { token } = useAuthStore.getState();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const isUserAdmin = () => {
  const { user } = useAuthStore.getState();
  return user?.role === 'club_admin' || user?.role === 'super_admin';
};

export const isUserSuperAdmin = () => {
  const { user } = useAuthStore.getState();
  return user?.role === 'super_admin';
};

export const getUserFullName = () => {
  const { user } = useAuthStore.getState();
  return user ? `${user.first_name} ${user.last_name}` : '';
};

export const getUserLevel = () => {
  const { user } = useAuthStore.getState();
  return user ? Math.floor(user.total_points / 100) + 1 : 1;
};