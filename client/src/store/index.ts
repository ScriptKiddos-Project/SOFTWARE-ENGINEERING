import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { useEventStore } from './eventStore';
import { useClubStore } from './clubStore';
import { useProfileStore } from './profileStore';
import { useNotificationStore } from './notificationStore';

// Re-export all stores
export { useAuthStore } from './authStore';
export { useEventStore } from './eventStore';
export { useClubStore } from './clubStore';
export { useProfileStore } from './profileStore';
export { useNotificationStore } from './notificationStore';

// Global app state
interface AppState {
  isLoading: boolean;
  isSidebarOpen: boolean;
  theme: 'light' | 'dark';
  setLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isLoading: false,
      isSidebarOpen: true,
      theme: 'light',
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      toggleSidebar: () => set((state) => ({ 
        isSidebarOpen: !state.isSidebarOpen 
      })),
      
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      
      setTheme: (theme) => set({ theme }),
      
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        isSidebarOpen: state.isSidebarOpen,
      }),
    }
  )
);

// Reset all stores
export const resetAllStores = () => {
  useAuthStore.getState().logout();
  useEventStore.getState().reset();
  useClubStore.getState().resetStore();
  useProfileStore.getState().clearProfile();
  useNotificationStore.getState().clearAllNotifications();
  useAppStore.getState().setLoading(false);
};

// Initialize app
export const initializeApp = async () => {
  try {
    useAppStore.getState().setLoading(true);
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      await useAuthStore.getState().checkAuth();;
    }
    
    // Load initial data if authenticated
    if (useAuthStore.getState().isAuthenticated) {
      await Promise.all([
        useNotificationStore.getState().fetchNotifications(),
      ]);
    }
  } catch (error) {
    console.error('Failed to initialize app:', error);
  } finally {
    useAppStore.getState().setLoading(false);
  }
};

// Export store types for use in components
export type { AppState };

export default {
  useAppStore,
  useAuthStore: useAuthStore,
  useEventStore: useEventStore,
  useClubStore: useClubStore,
  useProfileStore: useProfileStore,
  useNotificationStore: useNotificationStore,
  resetAllStores,
  initializeApp,
};