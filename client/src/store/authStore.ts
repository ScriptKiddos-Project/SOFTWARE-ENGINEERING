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
  hydrated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearAuth: () => void;
}

// use camelCase in the frontend types
interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  studentId?: string;
  phone?: string;
  department?: string;
  yearOfStudy?: number;
}


export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      hydrated: false, // ✅ added here

      // login: async (email: string, password: string) => {
      //   set({ isLoading: true });
      //   try {
      //     const response = await authService.login({ email, password });
          
      //     // ✅ FIXED: Map backend field names to frontend
      //     const user = {
      //       id: response.user.id,
      //       email: response.user.email,
      //       first_name: response.user.first_name,
      //       last_name: response.user.last_name,
      //       student_id: response.user.student_id,
      //       phone: response.user.phone,
      //       department: response.user.department,
      //       year_of_study: response.user.year_of_study,
      //       role: response.user.role,
      //       is_verified: response.user.is_verified,
      //       profile_image: response.user.profile_image,
      //       total_points: response.user.total_points,
      //       total_volunteer_hours: response.user.total_volunteer_hours,
      //       created_at: response.user.created_at || new Date().toISOString(),
      //       updated_at: response.user.updated_at || new Date().toISOString()
      //     };

      //     set({
      //       user,
      //       token: response.accessToken, // ✅ FIXED: accessToken instead of token
      //       refreshToken: response.refreshToken || null,
      //       isAuthenticated: true,
      //       isLoading: false
      //     });

      //     toast.success(`Welcome back, ${response.user.first_name}!`);
      //   } catch (error: any) {
      //     set({ isLoading: false });
      //     const errorMessage = error.response?.data?.message || 'Login failed';
      //     toast.error(errorMessage);
      //     throw error;
      //   }
      // },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authService.login({ email, password });
          
          const user = {
            id: response.user.id,
            email: response.user.email,
            first_name: response.user.first_name,
            last_name: response.user.last_name,
            student_id: response.user.student_id,
            phone: response.user.phone,
            department: response.user.department,
            year_of_study: response.user.year_of_study,
            role: response.user.role,
            is_verified: response.user.is_verified,
            profile_image: response.user.profile_image,
            total_points: response.user.total_points,
            total_volunteer_hours: response.user.total_volunteer_hours,
            created_at: response.user.created_at || new Date().toISOString(),
            updated_at: response.user.updated_at || new Date().toISOString()
          };

          set({
            user,
            token: response.accessToken,
            refreshToken: response.refreshToken || null,
            isAuthenticated: true,
            isLoading: false
          });

          toast.success(`Welcome back, ${response.user.first_name}!`);
        } catch (error: any) {
          set({ isLoading: false });
          const errorMessage = error.response?.data?.message || error.message || 'Login failed';
          toast.error(errorMessage);
          throw error;
        }
      },

      // register: async (userData: RegisterData) => {
      //   set({ isLoading: true });
      //   try {
      //     const response = await authService.register(userData);
          
      //     // ✅ FIXED: Map backend field names to frontend
      //     const user = {
      //       id: response.user.id,
      //       email: response.user.email,
      //       first_name: response.user.first_name,
      //       last_name: response.user.last_name,
      //       student_id: response.user.student_id,
      //       phone: response.user.phone,
      //       department: response.user.department,
      //       year_of_study: response.user.year_of_study,
      //       role: response.user.role,
      //       is_verified: response.user.is_verified,
      //       profile_image: response.user.profile_image,
      //       total_points: response.user.total_points,
      //       total_volunteer_hours: response.user.total_volunteer_hours,
      //       created_at: response.user.created_at || new Date().toISOString(),
      //       updated_at: response.user.updated_at || new Date().toISOString()
      //     };

      //     set({
      //       user,
      //       token: response.accessToken, // ✅ FIXED: accessToken instead of token
      //       refreshToken: response.refreshToken || null,
      //       isAuthenticated: true,
      //       isLoading: false
      //     });

      //     toast.success('Account created successfully!');
      //   } catch (error: any) {
      //     set({ isLoading: false });
      //     const errorMessage = error.response?.data?.message || 'Registration failed';
      //     toast.error(errorMessage);
      //     throw error;
      //   }
      // },

      // inside useAuthStore.register
// register: async (userData: RegisterData) => {
//   set({ isLoading: true });
//   try {
//     const rawResponse = await authService.register(userData);

//     // Normalize common axios/ApiService / raw server shapes:
//     // rawResponse might be: axiosResponse -> { data: { success, message, data: { user, accessToken } } }
//     // or might be direct server body -> { success, message, data: { user, accessToken } }
//     const axiosData = rawResponse?.data ?? rawResponse;
//     const payload = axiosData?.data ?? axiosData; // now payload should contain { user, accessToken } or just user/accessToken

//     const serverUser = payload?.user ?? payload; // sometimes payload is user directly

//     // helper to pick camelCase or snake_case
//     const pick = (obj: any, camel: string, snake: string) => obj?.[camel] ?? obj?.[snake];

//     const user = {
//       id: pick(serverUser, 'id', 'id'),
//       email: pick(serverUser, 'email', 'email'),
//       first_name: pick(serverUser, 'firstName', 'first_name'),
//       last_name: pick(serverUser, 'lastName', 'last_name'),
//       student_id: pick(serverUser, 'studentId', 'student_id'),
//       phone: pick(serverUser, 'phone', 'phone'),
//       department: pick(serverUser, 'department', 'department'),
//       year_of_study: pick(serverUser, 'yearOfStudy', 'year_of_study'),
//       role: pick(serverUser, 'role', 'role'),
//       is_verified: pick(serverUser, 'isVerified', 'is_verified'),
//       profile_image: pick(serverUser, 'profileImage', 'profile_image'),
//       total_points: pick(serverUser, 'totalPoints', 'total_points') ?? 0,
//       total_volunteer_hours: pick(serverUser, 'totalVolunteerHours', 'total_volunteer_hours') ?? 0,
//       created_at: pick(serverUser, 'createdAt', 'created_at') ?? new Date().toISOString(),
//       updated_at: pick(serverUser, 'updatedAt', 'updated_at') ?? new Date().toISOString()
//     };

//     const accessToken = payload?.accessToken ?? payload?.access_token ?? rawResponse?.accessToken ?? rawResponse?.token ?? null;

//     set({
//       user,
//       token: accessToken,
//       refreshToken: null,
//       isAuthenticated: true,
//       isLoading: false
//     });

//     toast.success('Account created successfully!');
//   } catch (error: any) {
//     set({ isLoading: false });
//     const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
//     toast.error(errorMessage);
//     throw error;
//   }
// },
      register: async (userData: RegisterData) => {
        set({ isLoading: true });
        try {
          const response = await authService.register(userData);
          
          // ❌ DO NOT SET USER OR TOKEN - Registration requires email verification
          set({ isLoading: false });
          
          // Don't show success toast here - Register.tsx component will handle it
          // The backend now returns { success: true, message: '...', data: { email, requiresVerification: true } }
        } catch (error: any) {
          set({ isLoading: false });
          const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
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
          
          // ✅ FIXED: Map backend field names
          const user = {
            id: response.user.id,
            email: response.user.email,
            first_name: response.user.first_name,
            last_name: response.user.last_name,
            student_id: response.user.student_id,
            phone: response.user.phone,
            department: response.user.department,
            year_of_study: response.user.year_of_study,
            role: response.user.role,
            is_verified: response.user.is_verified,
            profile_image: response.user.profile_image,
            total_points: response.user.total_points,
            total_volunteer_hours: response.user.total_volunteer_hours,
            created_at: response.user.created_at || new Date().toISOString(),
            updated_at: response.user.updated_at || new Date().toISOString()
          };

          set({
            user,
            token: response.accessToken, // ✅ FIXED
            refreshToken: response.refreshToken || null,
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
          const userData = await authService.getCurrentUser();
          
          // ✅ FIXED: Map backend field names
          const user = {
            id: userData.id,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            student_id: userData.student_id,
            phone: userData.phone,
            department: userData.department,
            year_of_study: userData.year_of_study,
            role: userData.role,
            is_verified: userData.is_verified,
            profile_image: userData.profile_image,
            total_points: userData.total_points,
            total_volunteer_hours: userData.total_volunteer_hours,
            created_at: userData.created_at || new Date().toISOString(),
            updated_at: userData.updated_at || new Date().toISOString()
          };

          set({
            user,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error: any) {
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
          const updatedUserData = await authService.updateProfile(data);
          
          // ✅ FIXED: Map backend field names
          const updatedUser = {
            ...user,
            first_name: updatedUserData.first_name || user.first_name,
            last_name: updatedUserData.last_name || user.last_name,
            student_id: updatedUserData.student_id || user.student_id,
            phone: updatedUserData.phone || user.phone,
            department: updatedUserData.department || user.department,
            year_of_study: updatedUserData.year_of_study || user.year_of_study,
            profile_image: updatedUserData.profile_image || user.profile_image,
            updated_at: new Date().toISOString()
          };

          set({ user: updatedUser });
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
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Rehydrate error', error);
        } else if (state) {
          state.hydrated = true;
        }
      },
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